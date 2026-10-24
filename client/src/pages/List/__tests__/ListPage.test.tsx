import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { MOTION } from '../../../components/Collapse'
import { Header } from '../../../components/Header'
import { AuthProvider, useAuthContext } from '../../../utils/auth/AuthContext'
import { StoreProvider } from '../../../utils/state/GlobalState'
import { FAVOURITES_KEY } from '../../../utils/storage/favourites'
import { PICKED_KEY } from '../../../utils/storage/shoppingState'
import { ListPage, listParams, toggled, withSaved } from '../ListPage'

const TOKEN = `e30.${btoa(
  JSON.stringify({
    data: { firstName: 'Ada', email: 'a@b.c', _id: '1', pro: false },
    exp: Date.now() / 1000 + 3600
  })
)}.sig`

const PretendLogin = () => {
  const [, dispatch] = useAuthContext()
  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'LOGIN', data: TOKEN })}
    >
      Pretend login
    </button>
  )
}

const Where = () => {
  const { search } = useLocation()
  return <output aria-label="where">{search}</output>
}

const renderList = (path = '/') =>
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <StoreProvider>
            <Header />
            <PretendLogin />
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <ListPage />
                    <Where />
                  </>
                }
              />
            </Routes>
          </StoreProvider>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

const pick = (...ids: string[]) =>
  localStorage.setItem(PICKED_KEY, JSON.stringify(ids))

/** The chip's list item, found by catalogue id. */
const chip = (id: string): HTMLElement => {
  const found = document.querySelector<HTMLElement>(`[data-chip="${id}"]`)
  if (found === null) throw new Error(`no chip ${id}`)
  return found
}
const hasChipEl = (id: string) =>
  document.querySelectorAll(`[data-chip="${id}"]`).length
const chipToggle = (id: string) => within(chip(id)).getAllByRole('button')[0]
const toggleOf = (id: string): HTMLElement => {
  const button = chipToggle(id)
  if (button === undefined) throw new Error(`no toggle ${id}`)
  return button
}
const chipOrder = () =>
  Array.from(document.querySelectorAll('[data-chip]'), (el) =>
    el.getAttribute('data-chip')
  )
/** The category heading a chip sits under. */
const groupOf = (id: string) =>
  chip(id).closest('[role="group"]')?.querySelector('h3')?.textContent
const panel = (name: string) => screen.getByRole('group', { name })
const ingredientsHeader = () =>
  screen.getByRole('button', { name: /^Ingredients/ })
const recipesHeader = () => screen.getByRole('button', { name: /^Recipes/ })
const region = (name: string) => screen.getByRole('region', { name })

beforeEach(() => localStorage.clear())

describe('list helpers', () => {
  it('reads the search and Saved params, and switches Saved', () => {
    expect(listParams(new URLSearchParams('q=dahl&saved=1'))).toEqual({
      query: 'dahl',
      savedOnly: true
    })
    expect(listParams(new URLSearchParams())).toEqual({
      query: '',
      savedOnly: false
    })
    const on = withSaved(new URLSearchParams('q=x'), true)
    expect(on.toString()).toBe('q=x&saved=1')
    expect(withSaved(on, false).toString()).toBe('q=x')
    expect([...toggled(new Set(['a']), 'b')]).toEqual(['a', 'b'])
    expect([...toggled(new Set(['a', 'b']), 'a')]).toEqual(['b'])
  })
})

describe('Scenario: One page', () => {
  it('shows Ingredients above Recipes, with no steps, Home control, recipe chips, modals or overlays', () => {
    renderList()
    expect(document.title).toContain('Shopping list')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Shopping list' })
    ).toBeInTheDocument()
    const ingredients = screen.getByRole('heading', {
      level: 2,
      name: /^Ingredients/
    })
    const recipes = screen.getByRole('heading', { level: 2, name: /^Recipes/ })
    expect(
      ingredients.compareDocumentPosition(recipes) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Home' })).toBeNull()
    expect(screen.queryByText(/At home|At the shop/)).toBeNull()
    expect(screen.queryByRole('navigation', { name: /step/i })).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.queryByRole('link', { name: /View recipe/ })).toBeNull()
    expect(screen.getByText(/Nothing on your list yet/)).toBeInTheDocument()
  })
})

describe('Scenario: Chips from recipes, grouped by category', () => {
  it('shows chips grouped by category; unpicking removes only chips no other pick needs', () => {
    renderList()
    fireEvent.click(screen.getByRole('button', { name: 'Red lentil dahl' }))
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Potato, cauliflower and chickpea curry'
      })
    )
    expect(groupOf('onion')).toBe('Fruit & Veg')
    expect(groupOf('potato')).toBe('Fruit & Veg')
    expect(groupOf('butter')).toBe('Dairy')
    expect(groupOf('red-lentils')).toBe('Pantry')
    // staples are notes, not chips
    expect(hasChipEl('salt')).toBe(0)
    // a count badge when two or more picked recipes need it
    expect(within(chip('onion')).getByTestId('chip-count')).toHaveTextContent(
      '2'
    )
    expect(within(chip('potato')).queryByTestId('chip-count')).toBeNull()
    expect(toggleOf('onion')).toHaveAccessibleName(/in 2 recipes/)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Potato, cauliflower and chickpea curry'
      })
    )
    expect(hasChipEl('potato')).toBe(0)
    expect(hasChipEl('onion')).toBe(1)
    expect(within(chip('onion')).queryByTestId('chip-count')).toBeNull()
    expect(region('Ingredients')).toHaveTextContent(/\d+ items/)
  })
})

describe('Scenario: Cross off stays in place', () => {
  it('strikes the chip through in place, restores it, and shows no Undo', () => {
    pick('dahl')
    renderList()
    const before = chipOrder()
    fireEvent.click(toggleOf('tomato'))
    expect(toggleOf('tomato')).toHaveAttribute('aria-pressed', 'true')
    expect(toggleOf('tomato')).toHaveAccessibleName(/, crossed off$/)
    expect(
      within(toggleOf('tomato')).getByText('Tomatoes').parentElement
    ).toHaveClass('line-through')
    expect(chipOrder()).toEqual(before)
    expect(region('Ingredients')).toHaveTextContent(/\d+ items, 1 crossed off/)
    fireEvent.click(toggleOf('tomato'))
    expect(toggleOf('tomato')).toHaveAttribute('aria-pressed', 'false')
    expect(toggleOf('tomato')).not.toHaveAccessibleName(/crossed off/)
    expect(chipOrder()).toEqual(before)
    expect(screen.queryByText(/undo/i)).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

describe('Scenario: Chip panel pushes content', () => {
  it('opens inline after the chip, listing every picked recipe that uses it; one at a time', () => {
    pick('dahl', 'vegetable-curry')
    renderList()
    const chevron = screen.getByRole('button', { name: 'Brown onion details' })
    expect(chevron).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(chevron)
    expect(chevron).toHaveAttribute('aria-expanded', 'true')
    const details = panel('Brown onion details')
    expect(details).toBeVisible()
    // in the flow, straight after the chip, so the chips below move down
    const item = details.closest('li')
    expect(item?.previousElementSibling).toBe(chip('onion'))
    expect(item).toHaveClass('basis-full')
    expect(item?.className).not.toMatch(/absolute|fixed/)
    expect(
      within(details)
        .getAllByRole('listitem')
        .map((li) => li.textContent)
    ).toEqual(['Red lentil dahl', 'Potato, cauliflower and chickpea curry'])
    fireEvent.click(screen.getByRole('button', { name: 'Garlic details' }))
    expect(chevron).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Garlic details' }))
    expect(
      screen.getByRole('button', { name: 'Garlic details' })
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('Done closes the panel and returns focus to the chevron', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    const chevron = screen.getByRole('button', { name: 'Tomatoes details' })
    await user.click(chevron)
    const details = panel('Tomatoes details')
    expect(within(details).queryByRole('button', { name: 'Remove' })).toBeNull()
    await user.click(within(details).getByRole('button', { name: 'Done' }))
    expect(chevron).toHaveAttribute('aria-expanded', 'false')
    expect(chevron).toHaveFocus()
    expect(details).not.toBeVisible()
  })
})

describe('Scenario: Edit quantity', () => {
  it('shows the new quantity on the chip', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    await user.click(screen.getByRole('button', { name: 'Tomatoes details' }))
    const details = panel('Tomatoes details')
    const quantity = within(details).getByRole('textbox', { name: 'Quantity' })
    expect(quantity).toHaveValue('1')
    await user.click(within(details).getByRole('button', { name: /Increase/ }))
    expect(quantity).toHaveValue('2')
    expect(toggleOf('tomato')).toHaveAccessibleName(/^Tomatoes, 2\b/)
    expect(within(toggleOf('tomato')).getByText(/^2\b/)).toBeInTheDocument()
    await user.clear(quantity)
    await user.type(quantity, '3')
    await user.tab()
    expect(toggleOf('tomato')).toHaveAccessibleName(/^Tomatoes, 3\b/)
    // cleared is not a quantity: the last one stays
    await user.clear(quantity)
    await user.tab()
    expect(toggleOf('tomato')).toHaveAccessibleName(/^Tomatoes, 3\b/)
  })
})

describe('Scenario: Category change does not reorder', () => {
  it("changes only the chip's colour, then Sort now moves it into Dairy", async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    const before = chipOrder()
    const toneBefore = chip('tomato').className
    await user.click(screen.getByRole('button', { name: 'Tomatoes details' }))
    const details = panel('Tomatoes details')
    expect(
      within(details).queryByRole('button', { name: 'Sort now' })
    ).toBeNull()
    await user.click(within(details).getByRole('radio', { name: 'Dairy' }))
    expect(chip('tomato')).toHaveAttribute('data-category', 'Dairy')
    expect(chip('tomato').className).not.toBe(toneBefore)
    expect(chip('tomato').className).toBe(chip('butter').className)
    expect(toggleOf('tomato')).toHaveAccessibleName(/, Dairy, /)
    expect(chipOrder()).toEqual(before)
    expect(groupOf('tomato')).toBe('Fruit & Veg')
    const sortNow = within(panel('Tomatoes details')).getByRole('button', {
      name: 'Sort now'
    })
    const category = within(panel('Tomatoes details')).getByRole('radiogroup', {
      name: 'Category'
    })
    expect(sortNow.parentElement).toBe(
      within(category).getByText('Category').parentElement
    )
    await user.click(sortNow)
    expect(groupOf('tomato')).toBe('Dairy')
    // the panel follows the chip and focus stays on the chosen category
    expect(
      within(panel('Tomatoes details')).getByRole('radio', { name: 'Dairy' })
    ).toHaveFocus()
    expect(
      within(panel('Tomatoes details')).queryByRole('button', {
        name: 'Sort now'
      })
    ).toBeNull()
  })
})

describe('Scenario: Sort button', () => {
  it('regroups every chip by its current category', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    await user.click(screen.getByRole('button', { name: 'Tomatoes details' }))
    await user.click(
      within(panel('Tomatoes details')).getByRole('radio', { name: 'Deli' })
    )
    await user.click(screen.getByRole('button', { name: 'Butter details' }))
    await user.click(
      within(panel('Butter details')).getByRole('radio', { name: 'Frozen' })
    )
    expect(groupOf('tomato')).toBe('Fruit & Veg')
    expect(groupOf('butter')).toBe('Dairy')
    await user.click(screen.getByRole('button', { name: 'Sort' }))
    expect(groupOf('tomato')).toBe('Deli')
    expect(groupOf('butter')).toBe('Frozen')
  })
})

describe('Scenario: Add an extra', () => {
  it('opens category tabs inline below the plus; a Dairy row adds Butter', async () => {
    const user = userEvent.setup()
    renderList()
    const plus = screen.getByRole('button', { name: 'Add an ingredient' })
    expect(plus).toHaveAttribute('aria-expanded', 'false')
    await user.click(plus)
    expect(plus).toHaveAttribute('aria-expanded', 'true')
    const area = screen.getByRole('group', { name: 'Add an ingredient' })
    expect(
      plus.compareDocumentPosition(area) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    const tabs = within(area).getByRole('tablist', { name: 'Categories' })
    expect(within(tabs).getAllByRole('tab').length).toBeGreaterThan(1)
    expect(within(area).queryByText('Used in')).toBeNull()
    await user.click(within(tabs).getByRole('tab', { name: 'Dairy' }))
    await user.click(within(area).getByRole('button', { name: 'Butter' }))
    expect(hasChipEl('butter')).toBe(1)
    expect(groupOf('butter')).toBe('Dairy')
    expect(screen.getByRole('status', { name: '' })).toHaveTextContent(
      'Butter added'
    )
    expect(
      within(area).getByRole('button', { name: 'Butter, on your list' })
    ).toHaveTextContent('On your list')
    expect(toggleOf('butter')).toHaveAccessibleName(/, added by you$/)
  })

  it('Remove takes an extra off the list and focus goes to the plus', async () => {
    const user = userEvent.setup()
    renderList()
    const plus = screen.getByRole('button', { name: 'Add an ingredient' })
    await user.click(plus)
    await user.click(screen.getByRole('tab', { name: 'Dairy' }))
    await user.click(screen.getByRole('button', { name: 'Butter' }))
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Butter details' }))
    const details = panel('Butter details')
    expect(within(details).getByText('Added by you')).toBeInTheDocument()
    await user.click(within(details).getByRole('button', { name: 'Remove' }))
    expect(hasChipEl('butter')).toBe(0)
    expect(plus).toHaveFocus()
    expect(screen.getByText('Removed')).toBeInTheDocument()
  })
})

describe('Scenario: Add an existing ingredient', () => {
  it('scrolls to the chip and opens its panel instead of adding a duplicate', async () => {
    const user = userEvent.setup()
    const scrolled: Element[] = []
    Element.prototype.scrollIntoView = function () {
      scrolled.push(this)
    }
    pick('dahl')
    renderList()
    await user.click(screen.getByRole('button', { name: 'Add an ingredient' }))
    await user.click(screen.getByRole('tab', { name: 'Dairy' }))
    await user.click(
      screen.getByRole('button', { name: 'Butter, on your list' })
    )
    expect(hasChipEl('butter')).toBe(1)
    const chevron = screen.getByRole('button', { name: 'Butter details' })
    expect(chevron).toHaveAttribute('aria-expanded', 'true')
    expect(panel('Butter details')).toBeVisible()
    expect(scrolled).toEqual([chevron])
    expect(chevron).toHaveFocus()
    expect(
      screen.getByRole('button', { name: 'Add an ingredient' })
    ).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('Scenario: Close the plus area', () => {
  it('closes on a click outside, stays open for clicks inside, and Escape returns focus to the plus', async () => {
    const user = userEvent.setup()
    renderList()
    const plus = screen.getByRole('button', { name: 'Add an ingredient' })
    await user.click(plus)
    await user.click(screen.getByRole('tab', { name: 'Bakery' }))
    expect(plus).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('heading', { level: 1, hidden: true }))
    expect(plus).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('group', { name: 'Add an ingredient' })
    ).toBeNull()
    await user.click(plus)
    await user.click(plus)
    expect(plus).toHaveAttribute('aria-expanded', 'false')
    await user.click(plus)
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{Escape}')
    expect(plus).toHaveAttribute('aria-expanded', 'false')
    expect(plus).toHaveFocus()
    fireEvent.pointerDown(document.body)
    expect(plus).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('Scenario: Recipe rows', () => {
  it('one tap selects the row: pressed, bordered, ticked and announced; there is no Add button', () => {
    renderList()
    const row = screen.getByRole('button', { name: 'Red lentil dahl' })
    const item = row.closest('li')
    expect(row).toHaveAttribute('aria-pressed', 'false')
    expect(item).toHaveClass('shadow-raised')
    expect(within(row).getByTestId('row-check')).toHaveTextContent('')
    fireEvent.click(row)
    expect(row).toHaveAttribute('aria-pressed', 'true')
    expect(item).toHaveClass('shadow-pressed', 'border-primary')
    expect(within(row).getByTestId('row-check')).toHaveTextContent('✓')
    expect(localStorage.getItem(PICKED_KEY)).toBe('["dahl"]')
    expect(region('Recipes')).toHaveTextContent('1 recipe picked')
    expect(
      within(region('Recipes')).queryByRole('button', { name: /\bAdd\b/ })
    ).toBeNull()
    expect(within(item ?? document.body).getAllByRole('button')).toHaveLength(2)
    fireEvent.click(row)
    expect(row).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('Scenario: Multiple rows open', () => {
  it('keeps both rows open, each with ingredients, servings, method and notes', () => {
    renderList()
    const dahl = screen.getByRole('button', { name: 'Red lentil dahl details' })
    const curry = screen.getByRole('button', {
      name: 'Potato, cauliflower and chickpea curry details'
    })
    fireEvent.click(dahl)
    fireEvent.click(curry)
    expect(dahl).toHaveAttribute('aria-expanded', 'true')
    expect(curry).toHaveAttribute('aria-expanded', 'true')
    const open = (button: HTMLElement) => {
      const id = button.getAttribute('aria-controls') ?? ''
      const region = document.getElementById(id)
      if (region === null) throw new Error('no details')
      return within(region)
    }
    ;[dahl, curry].forEach((button) => {
      ;['Ingredients', 'Method', 'Notes'].forEach((name) =>
        expect(open(button).getByRole('heading', { name })).toBeVisible()
      )
      expect(open(button).getByRole('radiogroup')).toBeVisible()
    })
    expect(open(dahl).getByText("You'll also need: salt")).toBeVisible()
    expect(open(dahl).getByText('Contains: milk')).toBeVisible()
    expect(open(dahl).getByText(/^Red lentils/)).toBeVisible()
    fireEvent.click(open(dahl).getByRole('radio', { name: '3' }))
    expect(open(curry).getByRole('radio', { name: '3' })).toBeChecked()
    fireEvent.click(dahl)
    expect(dahl).toHaveAttribute('aria-expanded', 'false')
    expect(curry).toHaveAttribute('aria-expanded', 'true')
    // picking is separate from opening
    expect(localStorage.getItem(PICKED_KEY)).toBeNull()
  })
})

describe('Scenario: Save visibility', () => {
  it('hides Save in expanded rows when signed out, and shows it when signed in', () => {
    renderList()
    fireEvent.click(
      screen.getByRole('button', { name: 'Red lentil dahl details' })
    )
    expect(
      screen.queryByRole('button', { name: /Save Red lentil dahl/ })
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Pretend login' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Save Red lentil dahl' })
    )
    expect(localStorage.getItem(FAVOURITES_KEY)).toBe('["dahl"]')
  })
})

describe('Saved filter and empty states', () => {
  it('filters to saved recipes, and says when there are none', () => {
    renderList()
    fireEvent.click(screen.getByRole('switch', { name: 'Saved' }))
    expect(screen.getByLabelText('where')).toHaveTextContent('?saved=1')
    expect(screen.getByText(/^No saved recipes yet/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('switch', { name: 'Saved' }))
    expect(screen.getByLabelText('where')).toHaveTextContent('')
  })

  it('says No recipes when saved ids match nothing', () => {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(['gone']))
    renderList('/?saved=1')
    expect(screen.getByText('No recipes')).toBeInTheDocument()
  })

  it('shows only saved recipes', () => {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(['dahl']))
    renderList('/?saved=1')
    expect(
      screen.getByRole('button', { name: 'Red lentil dahl' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Shaking beef' })).toBeNull()
  })

  it('an ingredient search with no recipes offers it as a chip, then points to the list', () => {
    renderList('/?q=banana')
    expect(
      screen.getByText(
        'No recipes with banana yet. You can add banana to your list'
      )
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '+ Add banana' }))
    expect(hasChipEl('banana')).toBe(1)
    fireEvent.click(
      screen.getByRole('button', {
        name: '✓ Banana is on your list. View list'
      })
    )
    expect(
      screen.getByRole('heading', { level: 2, name: /^Ingredients/ })
    ).toHaveFocus()
  })

  it('a search matching nothing says so', () => {
    renderList('/?q=zzzz')
    expect(screen.getByText('No recipes with zzzz yet.')).toBeInTheDocument()
  })
})

describe('Scenario: Collapsible sections', () => {
  it('hides the chips and announces collapsed; the same for Recipes', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    expect(ingredientsHeader()).toHaveAttribute('aria-expanded', 'true')
    await user.click(ingredientsHeader())
    expect(ingredientsHeader()).toHaveAttribute('aria-expanded', 'false')
    expect(chip('tomato')).not.toBeVisible()
    expect(screen.queryByRole('button', { name: /^Tomatoes, / })).toBeNull()
    await user.click(ingredientsHeader())
    expect(chip('tomato')).toBeVisible()
    await user.click(recipesHeader())
    expect(recipesHeader()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: 'Red lentil dahl' })).toBeNull()
    await user.click(recipesHeader())
    expect(
      screen.getByRole('button', { name: 'Red lentil dahl' })
    ).toBeVisible()
  })
})

describe('Scenario: Motion', () => {
  it('every opening part animates in 0.2 s and is instant with reduced motion', () => {
    pick('dahl')
    renderList()
    fireEvent.click(screen.getByRole('button', { name: 'Tomatoes details' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add an ingredient' }))
    const parts = [
      ...document.querySelectorAll('[data-collapse]'),
      chip('tomato').nextElementSibling,
      document.getElementById('add-ingredient-area')
    ]
    // both sections, every recipe row, the chip panel and the plus area
    expect(parts.length).toBeGreaterThan(4)
    parts.forEach((part) => {
      expect(part?.className).toContain(MOTION)
    })
  })
})

describe('Scenario: Scroll to top', () => {
  const original = window.IntersectionObserver
  const ENTRY: IntersectionObserverEntry = {
    isIntersecting: false,
    boundingClientRect: new DOMRect(0, -500, 10, 10),
    intersectionRatio: 0,
    intersectionRect: new DOMRect(),
    rootBounds: null,
    target: document.body,
    time: 0
  }
  let fire: (entry: Partial<IntersectionObserverEntry>) => void = () => {}
  const disconnected: string[] = []
  class FakeObserver {
    readonly root = null
    readonly rootMargin = ''
    readonly scrollMargin = ''
    readonly thresholds = []
    constructor(callback: IntersectionObserverCallback) {
      fire = (entry) =>
        act(() =>
          callback(
            [
              {
                ...ENTRY,
                ...entry
              }
            ],
            this
          )
        )
    }
    observe() {}
    unobserve() {}
    disconnect() {
      disconnected.push('yes')
    }
    takeRecords() {
      return []
    }
  }
  afterEach(() => {
    window.IntersectionObserver = original
  })

  it('appears once the chips are scrolled past; brings them back and focuses the Ingredients heading', async () => {
    const user = userEvent.setup()
    const scrolls: ScrollToOptions[] = []
    window.scrollTo = (options?: ScrollToOptions | number) => {
      if (typeof options === 'object') scrolls.push(options)
    }
    window.IntersectionObserver = FakeObserver
    const { unmount } = renderList()
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
    fire({ isIntersecting: false, boundingClientRect: new DOMRect(0, 900) })
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
    fire({})
    await user.click(screen.getByRole('button', { name: 'Scroll to top' }))
    expect(scrolls).toEqual([{ top: 0, behavior: 'smooth' }])
    expect(
      screen.getByRole('heading', { level: 2, name: /^Ingredients/ })
    ).toHaveFocus()
    fire({ isIntersecting: true, boundingClientRect: new DOMRect(0, 0) })
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
    unmount()
    expect(disconnected).toEqual(['yes'])
  })

  it('never shows without IntersectionObserver', () => {
    renderList()
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
  })
})

describe('Scenario: State kept', () => {
  it('keeps picks, crossed off chips, edits, extras and chip order after a refresh', async () => {
    const user = userEvent.setup()
    const first = renderList()
    await user.click(screen.getByRole('button', { name: 'Red lentil dahl' }))
    await user.click(toggleOf('tomato'))
    await user.click(screen.getByRole('button', { name: 'Butter details' }))
    await user.click(
      within(panel('Butter details')).getByRole('button', { name: /Increase/ })
    )
    await user.click(
      within(panel('Butter details')).getByRole('radio', { name: 'Deli' })
    )
    await user.click(screen.getByRole('button', { name: 'Add an ingredient' }))
    await user.click(screen.getByRole('tab', { name: 'Bakery' }))
    const [bread] = within(
      screen.getByRole('tabpanel', { name: 'Bakery' })
    ).getAllByRole('button')
    if (bread === undefined) throw new Error('no bakery rows')
    await user.click(bread)
    const order = chipOrder()
    first.unmount()

    renderList()
    expect(
      screen.getByRole('button', { name: 'Red lentil dahl' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(toggleOf('tomato')).toHaveAttribute('aria-pressed', 'true')
    expect(toggleOf('butter')).toHaveAccessibleName(/, Deli, /)
    expect(chip('butter')).toHaveAttribute('data-category', 'Deli')
    expect(groupOf('butter')).toBe('Dairy')
    expect(chipOrder()).toEqual(order)
    expect(chipOrder()).toHaveLength(order.length)
    expect(
      screen.getByRole('heading', { level: 3, name: 'Bakery' })
    ).toBeVisible()
  })
})

describe('Scenario: Accessibility', () => {
  it('reads name, quantity, category, crossed off state and recipe count; chevrons and headers expose aria-expanded', () => {
    pick('dahl', 'vegetable-curry')
    renderList()
    fireEvent.click(toggleOf('onion'))
    expect(toggleOf('onion')).toHaveAccessibleName(
      'Brown onion, 1, Fruit & Veg, in 2 recipes, crossed off'
    )
    expect(toggleOf('onion')).toHaveAttribute('aria-pressed', 'true')
    ;[
      ingredientsHeader(),
      recipesHeader(),
      screen.getByRole('button', { name: 'Brown onion details' }),
      screen.getByRole('button', { name: 'Red lentil dahl details' }),
      screen.getByRole('button', { name: 'Add an ingredient' })
    ].forEach((button) => {
      expect(button.tagName).toBe('BUTTON')
      expect(button).toHaveAttribute('aria-expanded')
      expect(button.className).toContain('focus-ring')
    })
  })

  it('works by keyboard: chips, chevrons, Sort, plus, tabs, rows and section headers', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    toggleOf('tomato').focus()
    await user.keyboard('{Enter}')
    expect(toggleOf('tomato')).toHaveAttribute('aria-pressed', 'true')
    await user.keyboard(' ')
    expect(toggleOf('tomato')).toHaveAttribute('aria-pressed', 'false')
    await user.tab()
    const chevron = screen.getByRole('button', { name: 'Tomatoes details' })
    expect(chevron).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(chevron).toHaveAttribute('aria-expanded', 'true')
    await user.tab()
    expect(
      within(panel('Tomatoes details')).getByRole('textbox', {
        name: 'Quantity'
      })
    ).toHaveFocus()
    screen.getByRole('button', { name: 'Sort' }).focus()
    await user.keyboard('{Enter}')
    const plus = screen.getByRole('button', { name: 'Add an ingredient' })
    plus.focus()
    await user.keyboard('{Enter}')
    expect(plus).toHaveAttribute('aria-expanded', 'true')
    await user.tab()
    expect(screen.getAllByRole('tab')[0]).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(plus).toHaveFocus()
    const row = screen.getByRole('button', { name: 'Shaking beef' })
    row.focus()
    await user.keyboard('{Enter}')
    expect(row).toHaveAttribute('aria-pressed', 'true')
    recipesHeader().focus()
    await user.keyboard('{Enter}')
    expect(recipesHeader()).toHaveAttribute('aria-expanded', 'false')
  })
})
