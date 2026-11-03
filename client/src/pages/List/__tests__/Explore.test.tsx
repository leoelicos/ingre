import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { savedQuery, savedRecipe } from '../../../test/savedMocks'
import {
  chip,
  explore,
  exploreHeader,
  hasChipEl,
  pick,
  pickFromExplore,
  recipes,
  region,
  renderList,
  searchBox
} from '../../../test/renderList'
import { focusableIn } from '../gestures'

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
    within(
      explore().getByRole('toolbar', { name: 'Explore actions' })
    ).getByRole('button', { name: /^Filter/ })
  )

describe('Scenario: Discovery holds Explore (#192)', () => {
  it('keeps Explore off the page until Find recipes opens the dialog', () => {
    renderList()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('region', { name: 'Explore' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Find recipes' }))
    const dialog = screen.getByRole('dialog', { name: 'Find recipes' })
    expect(dialog).toBeInTheDocument()
    expect(region('Explore').tagName).toBe('SECTION')
    expect(exploreHeader()).toHaveTextContent('Explore')
    expect(searchBox()).toHaveFocus()
  })

  it('opens from the add button when Ingredients is not in view', () => {
    renderList()
    fireEvent.click(screen.getByRole('button', { name: '+ Recipe' }))
    expect(
      screen.getByRole('dialog', { name: 'Find recipes' })
    ).toBeInTheDocument()
  })

  it('Escape clears a search first, then closes and returns focus', async () => {
    const user = userEvent.setup()
    renderList()
    const find = screen.getByRole('button', { name: 'Find recipes' })
    await user.click(find)
    await user.type(searchBox(), 'beef')
    await user.keyboard('{Escape}')
    expect(searchBox()).toHaveValue('')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(find).toHaveFocus()
  })

  it('closes from the Close button and from the backdrop', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(screen.getByRole('button', { name: 'Find recipes' }))
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.click(screen.getByRole('button', { name: '+ Recipe' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.pointerDown(dialog.parentElement ?? dialog)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('a downward drag on the handle closes the sheet; a sideways drag does not', () => {
    renderList()
    fireEvent.click(screen.getByRole('button', { name: 'Find recipes' }))
    const dialog = screen.getByRole('dialog')
    const handle = dialog.firstElementChild
    if (!(handle instanceof HTMLElement)) throw new Error('no handle')
    fireEvent.pointerUp(handle, { clientX: 1, clientY: 1 })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.pointerDown(handle, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerUp(handle, { clientX: 80, clientY: 20, pointerId: 1 })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.pointerDown(handle, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerUp(handle, { clientX: 14, clientY: 120, pointerId: 1 })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('keeps Tab inside the dialog', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(screen.getByRole('button', { name: 'Find recipes' }))
    const items = focusableIn(screen.getByRole('dialog'))
    const first = items[0]
    const second = items[1]
    const last = items[items.length - 1]
    if (first === undefined || second === undefined || last === undefined) {
      throw new Error('no focusables')
    }
    last.focus()
    await user.keyboard('{Tab}')
    expect(first).toHaveFocus()
    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(last).toHaveFocus()
    first.focus()
    await user.tab()
    expect(second).toHaveFocus()
  })
})

describe('Scenario: Pantry discovery (#192)', () => {
  it('opens Extra from Add pantry item, not on the workspace', () => {
    renderList()
    expect(screen.queryByRole('region', { name: 'Extra' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Add pantry item' }))
    expect(
      screen.getByRole('dialog', { name: 'Add pantry item' })
    ).toBeInTheDocument()
    expect(region('Extra')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add an ingredient' })
    ).toBeInTheDocument()
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
    expect(region('Explore')).toBeInTheDocument()
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
    expect(explore().getByRole('status')).toHaveTextContent(
      'No matches for ‘chikpea’'
    )
    expect(
      explore().getByRole('heading', { name: 'Close matches' })
    ).toBeVisible()
    expect(
      explore().getByRole('heading', { name: 'Browse recipes' })
    ).toBeVisible()
    await user.clear(searchBox())
    await search(user, 'zzqxw')
    expect(explore().getByRole('status')).toHaveTextContent(
      'No matches for ‘zzqxw’'
    )
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
    fireEvent.click(pickFromExplore('Red lentil dahl'))
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

  it('an ingredient result adds it as an extra, or opens its chip when it is on the list', async () => {
    const user = userEvent.setup()
    const scrolled: Element[] = []
    Element.prototype.scrollIntoView = function () {
      scrolled.push(this)
    }
    renderList()
    await search(user, 'banana')
    await user.click(explore().getByRole('button', { name: 'Add banana' }))
    expect(hasChipEl('banana')).toBe(1)
    expect(hasChipEl('banana', 'extra')).toBe(1)
    expect(screen.getByText('Banana added to Extra')).toBeInTheDocument()
    const onList = explore().getByRole('button', {
      name: 'Banana, on your list'
    })
    expect(onList).toHaveTextContent('on your list')
    await user.click(onList)
    const chevron = within(chip('banana')).getByRole('button', {
      name: 'Banana details'
    })
    expect(chevron).toHaveAttribute('aria-expanded', 'true')
    expect(scrolled).toEqual([chevron])
    expect(hasChipEl('banana')).toBe(1)
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
    openFilter()
    fireEvent.click(explore().getByRole('switch', { name: 'Saved' }))
    expect(where()).toHaveTextContent('/?saved=1')
    await waitFor(() => expect(browseNames()).toEqual(['Red lentil dahl']))
    fireEvent.click(explore().getByRole('switch', { name: 'Saved' }))
    expect(where()).toHaveTextContent(/^\/$/)
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

describe('Scenario: Search bar (#181)', () => {
  it('has a max width and the new placeholder', () => {
    renderList()
    expect(searchBox()).toHaveAttribute(
      'placeholder',
      'Search ingredients and recipes'
    )
    expect(screen.getByRole('search')).toHaveClass('max-w-[36rem]')
  })

  it('away from the list, typing goes to the list with the text and focus kept', async () => {
    const user = userEvent.setup()
    renderList('/elsewhere')
    expect(screen.getByText('Elsewhere')).toBeInTheDocument()
    await search(user, 'd')
    expect(where()).toHaveTextContent(/^\/$/)
    expect(searchBox()).toHaveValue('d')
    expect(searchBox()).toHaveFocus()
    expect(region('Explore')).toBeInTheDocument()
  })
})
