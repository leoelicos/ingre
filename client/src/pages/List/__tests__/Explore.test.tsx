import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { savedQuery, savedRecipe } from '../../../test/savedMocks'
import {
  chip,
  explore,
  closeSheet,
  fab,
  openSheet,
  sheet,
  hasChipEl,
  pick,
  pickInExplore,
  recipes,
  renderList,
  searchBox
} from '../../../test/renderList'

beforeEach(() => localStorage.clear())

type User = ReturnType<typeof userEvent.setup>
/** Puts the whole query in at once: typing key by key re-renders every result per key, slow on CI. */
const search = async (user: User, text: string): Promise<void> => {
  await user.click(searchBox())
  await user.paste(text)
}

const where = () => screen.getByLabelText('where')
/** The group under an Explore heading. */
const groupUnder = (title: string): HTMLElement => {
  const heading = explore().getByRole('heading', { level: 3, name: title })
  if (heading.parentElement === null) throw new Error(`no group ${title}`)
  return heading.parentElement
}
/** Recipe row names in a group of Explore's results, in order. */
const groupNames = (title: string) =>
  Array.from(
    groupUnder(title).querySelectorAll('button[aria-pressed]'),
    (button) =>
      document.getElementById(button.getAttribute('aria-labelledby') ?? '')
        ?.textContent
  )
const ingredientResults = () =>
  within(
    explore().getByRole('heading', { level: 3, name: 'Ingredients' })
      .parentElement ?? document.body
  )
    .getAllByRole('button')
    .map((button) => button.getAttribute('aria-label'))
const browseNames = () => groupNames('Browse recipes')
const signIn = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Pretend login' }))
const openFilter = () =>
  fireEvent.click(
    within(screen.getByRole('toolbar', { name: 'Explore actions' })).getByRole(
      'button',
      { name: /^Filter/ }
    )
  )

describe('Scenario: Explore lives in a sheet (#192)', () => {
  it('is off the page until "+ Recipe" opens it as a labelled dialog, search at the top with focus', () => {
    renderList()
    expect(sheet('Explore')).toBeNull()
    expect(document.getElementById('explore')).toBeNull()
    expect(screen.queryByRole('search')).toBeNull()
    openSheet()
    const dialog = screen.getByRole('dialog', { name: 'Explore' })
    expect(searchBox()).toHaveFocus()
    expect(
      within(dialog)
        .getByRole('search')
        .compareDocumentPosition(
          within(dialog).getByRole('heading', { name: 'Browse recipes' })
        ) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('Escape clears a filled search first, then closes the sheet and focus goes back to the FAB', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(fab())
    await user.paste('dahl')
    await user.keyboard('{Escape}')
    expect(searchBox()).toHaveValue('')
    await user.keyboard('{Escape}')
    expect(sheet('Explore')).toBeNull()
    await waitFor(() => expect(fab()).toHaveFocus())
  })

  it('keeps the query while it is shut, so it opens where it was left', async () => {
    const user = userEvent.setup()
    renderList()
    await search(user, 'dahl')
    closeSheet()
    expect(searchBox()).toHaveValue('dahl')
    expect(groupNames('Recipes')).toEqual(['Red lentil dahl'])
  })
})

describe('Scenario: Browse and search (#181)', () => {
  it('always shows browse when blank, typing overrides it, and clearing brings it back', async () => {
    const user = userEvent.setup()
    renderList()
    const browse = browseNames()
    expect(browse.length).toBeGreaterThan(5)
    expect(browse).toEqual(
      [...browse].sort((a, b) => (a ?? '').localeCompare(b ?? ''))
    )
    await search(user, 'dahl')
    expect(
      explore().queryByRole('heading', { name: 'Browse recipes' })
    ).toBeNull()
    expect(groupNames('Recipes')).toEqual(['Red lentil dahl'])
    await user.clear(searchBox())
    expect(browseNames()).toEqual(browse)
  })

  it('Escape clears the text and brings browse back; no Enter-to-search and no ?q=', async () => {
    const user = userEvent.setup()
    renderList()
    await user.type(searchBox(), 'beef{Enter}')
    expect(where()).toHaveTextContent(/^\/$/)
    expect(
      explore().queryByRole('heading', { name: 'Browse recipes' })
    ).toBeNull()
    await user.keyboard('{Escape}')
    expect(searchBox()).toHaveValue('')
    expect(
      explore().getByRole('heading', { name: 'Browse recipes' })
    ).toBeVisible()
    expect(sheet('Explore')).toBeInTheDocument()
  })

  it('ranks starts-with, then word starts, then contains, in separate groups that sit side by side from 768px', async () => {
    const user = userEvent.setup()
    renderList()
    await search(user, 'chick')
    const recipeNames = groupNames('Recipes')
    expect(recipeNames[0]).toMatch(/^Chick/)
    const ingredients = ingredientResults()
    expect(ingredients[0]).toMatch(/^Add chick/)
    const grid = explore().getByRole('heading', {
      level: 3,
      name: 'Ingredients'
    }).parentElement?.parentElement
    expect(grid).toHaveClass('@[768px]:grid-cols-2')
    expect(grid?.parentElement).toHaveClass('@container')
    // ingredients first (left), then recipes
    expect(grid?.firstElementChild).toHaveTextContent(/^Ingredients/)
  })

  it('every word must match, in the name or an ingredient; a group with no results is left out', async () => {
    const user = userEvent.setup()
    renderList()
    await search(user, 'lentil dahl')
    expect(groupNames('Recipes')).toEqual(['Red lentil dahl'])
    expect(explore().queryByRole('heading', { name: 'Ingredients' })).toBeNull()
    await user.clear(searchBox())
    await search(user, 'turmeric dahl')
    expect(groupNames('Recipes')).toEqual(['Red lentil dahl'])
    await user.clear(searchBox())
    await search(user, 'red lentils')
    expect(ingredientResults()).toContain('Add red lentils')
  })

  it('says No matches, then close matches, then the browse list', async () => {
    const user = userEvent.setup()
    renderList()
    await search(user, 'chikpea')
    expect(explore().getByText('No matches for ‘chikpea’')).toHaveAttribute(
      'role',
      'status'
    )
    expect(
      explore().getByRole('heading', { name: 'Close matches' })
    ).toBeVisible()
    expect(
      explore().getByRole('heading', { name: 'Browse recipes' })
    ).toBeVisible()
    await user.clear(searchBox())
    await search(user, 'zzqxw')
    expect(explore().getByText('No matches for ‘zzqxw’')).toBeInTheDocument()
    expect(
      explore().queryByRole('heading', { name: 'Close matches' })
    ).toBeNull()
    expect(
      explore().getByRole('heading', { name: 'Browse recipes' })
    ).toBeVisible()
  })
})

describe('Scenario: Explore results act in place (#181)', () => {
  it('ticks a recipe from Explore, and See recipe expands the row in place', () => {
    renderList()
    pickInExplore('Red lentil dahl')
    expect(
      recipes().getByRole('button', { name: 'Red lentil dahl' })
    ).toHaveAttribute('aria-pressed', 'true')
    const see = explore().getByRole('button', {
      name: 'See recipe: Red lentil dahl'
    })
    expect(see).toHaveTextContent('See recipe')
    fireEvent.click(see)
    expect(see).toHaveAttribute('aria-expanded', 'true')
    const details = document.getElementById(
      see.getAttribute('aria-controls') ?? ''
    )
    expect(details?.closest('li')).toBe(see.closest('li'))
    expect(
      within(details ?? document.body).getByRole('heading', { name: 'Method' })
    ).toBeVisible()
    fireEvent.click(see)
    expect(see).toHaveAttribute('aria-expanded', 'false')
  })

  it('an ingredient result adds it as an extra and stays in the sheet; again says it is in Extra (#192)', async () => {
    const user = userEvent.setup()
    renderList()
    await search(user, 'banana')
    await user.click(explore().getByRole('button', { name: 'Add banana' }))
    expect(explore().getByText('Banana added to Extra')).toBeInTheDocument()
    const onList = explore().getByRole('button', {
      name: 'Banana, on your list'
    })
    expect(onList).toHaveTextContent('on your list')
    await user.click(onList)
    expect(
      explore().getByText('Banana is already in Extra')
    ).toBeInTheDocument()
    closeSheet()
    expect(hasChipEl('banana')).toBe(1)
    expect(chip('banana')).toHaveAttribute('data-category')
  })

  it('shows allergen tags on ingredient results', async () => {
    const user = userEvent.setup()
    renderList()
    await search(user, 'butter')
    const item = explore()
      .getByRole('button', { name: 'Add butter' })
      .closest('li')
    expect(
      within(item ?? document.body).getByRole('list', { name: 'Allergens' })
    ).toHaveTextContent('milk')
  })
})

describe('Scenario: Saved filters Explore (#181)', () => {
  it("Saved is a switch in Explore's filter, not in Recipes, and filters by the server's hearts (F4)", async () => {
    renderList('/', [savedQuery([savedRecipe('dahl')])])
    signIn()
    expect(recipes().queryByRole('switch')).toBeNull()
    explore()
    openFilter()
    fireEvent.click(explore().getByRole('switch', { name: 'Saved' }))
    expect(where()).toHaveTextContent('/?saved=1')
    await waitFor(() => expect(browseNames()).toEqual(['Red lentil dahl']))
    fireEvent.click(explore().getByRole('switch', { name: 'Saved' }))
    expect(where()).toHaveTextContent(/^\/$/)
  })

  it('closing the sheet opened by the Saved link drops ?saved=1, so the link opens it again', () => {
    renderList('/?saved=1')
    expect(sheet('Explore')).toBeInTheDocument()
    closeSheet()
    expect(where()).toHaveTextContent(/^\/$/)
    expect(sheet('Explore')).toBeNull()
  })

  it('says when nothing is saved yet', () => {
    renderList('/?saved=1')
    expect(explore().getByText(/^No saved recipes yet/)).toBeInTheDocument()
  })

  it('the Saved link opens Explore and its filter even when something is picked', () => {
    pick('dahl')
    renderList('/?saved=1')
    expect(explore().getByRole('switch', { name: 'Saved' })).toBeChecked()
  })
})

describe('Scenario: Search bar (#181, #192)', () => {
  it('sits at the top of the Explore sheet with the placeholder, not in the header', () => {
    renderList()
    expect(screen.queryByRole('search')).toBeNull()
    expect(searchBox()).toHaveAttribute(
      'placeholder',
      'Search ingredients and recipes'
    )
    expect(explore().getByRole('search')).toContainElement(searchBox())
  })
})
