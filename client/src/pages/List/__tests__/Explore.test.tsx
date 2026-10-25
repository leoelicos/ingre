import '@testing-library/jest-dom'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
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
import { HIDE_EXPLORE } from '../Explore'

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

describe('Scenario: Explore is always on the page (#181)', () => {
  it('is expanded on load when nothing is selected: an inline, labelled region that pushes content down', () => {
    renderList()
    const area = region('Explore')
    expect(area.tagName).toBe('SECTION')
    expect(area).toHaveClass('shadow-raised')
    expect(area.className).not.toMatch(/\b(absolute|fixed)\b/)
    expect(screen.queryByRole('dialog')).toBeNull()
    // Explore comes before the sections, in the flow
    expect(
      area.compareDocumentPosition(region('Ingredients')) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'true')
    expect(exploreHeader()).toHaveAttribute('aria-controls', 'explore-content')
    expect(document.getElementById('explore-content')).toBeVisible()
  })

  it('is collapsed on load when something is selected, but still there; search focus expands it', () => {
    pick('dahl')
    renderList()
    expect(region('Explore')).toBeVisible()
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById('explore-content')).not.toBeVisible()
    expect(screen.queryByRole('button', { name: HIDE_EXPLORE })).toBeNull()
    act(() => searchBox().focus())
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'true')
  })

  it('expands when typing', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    act(() => searchBox().blur())
    fireEvent.change(searchBox(), { target: { value: 'dahl' } })
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'true')
    await user.clear(searchBox())
    expect(
      explore().getByRole('heading', { name: 'Browse recipes' })
    ).toBeVisible()
  })
})

describe('Scenario: Explore collapses, never goes away (#181)', () => {
  it('stays expanded on an outside click and Escape; X collapses it to its header row and focuses that', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(screen.getByRole('heading', { level: 1, hidden: true }))
    fireEvent.pointerDown(document.body)
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'true')
    explore()
      .getByRole('button', { name: /^Filter/ })
      .focus()
    await user.keyboard('{Escape}')
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'true')
    const hide = screen.getByRole('button', { name: HIDE_EXPLORE })
    expect(hide).toHaveAttribute('aria-controls', 'explore-content')
    await user.click(hide)
    expect(region('Explore')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Explore' })).toBeVisible()
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'false')
    expect(exploreHeader()).toHaveFocus()
    expect(screen.queryByRole('button', { name: HIDE_EXPLORE })).toBeNull()
    await user.click(exploreHeader())
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'true')
    expect(exploreHeader()).toHaveFocus()
  })

  it('keeps what is inside while collapsed: an open filter is still open when it expands', async () => {
    const user = userEvent.setup()
    renderList()
    openFilter()
    await user.click(screen.getByRole('button', { name: HIDE_EXPLORE }))
    await user.click(exploreHeader())
    expect(explore().getByRole('switch', { name: 'Saved' })).toBeVisible()
  })

  it('the header row collapses the results but keeps the header; search focus or typing expands it', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(exploreHeader())
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'false')
    expect(exploreHeader()).toHaveClass('shadow-raised')
    expect(explore().queryByRole('switch', { name: 'Saved' })).toBeNull()
    act(() => searchBox().focus())
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: HIDE_EXPLORE })).toBeVisible()
    await user.click(exploreHeader())
    act(() => searchBox().blur())
    fireEvent.change(searchBox(), { target: { value: 'b' } })
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'true')
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
