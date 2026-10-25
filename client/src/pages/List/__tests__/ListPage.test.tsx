import '@testing-library/jest-dom'
import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MOTION } from '../../../components/Collapse'
import { saveMock, savedQuery } from '../../../test/savedMocks'
import {
  chip,
  chipOrder,
  explore,
  groupOf,
  hasChipEl,
  ingredientsHeader,
  panel,
  pick,
  pickedIds,
  chevronOf,
  pickFromExplore,
  recipes,
  recipesHeader,
  region,
  searchBox,
  renderList,
  toggleOf
} from '../../../test/renderList'
import { savedParam, withSaved } from '../ListPage'
import { toggled } from '../Recipes'
import { isAbove } from '../ScrollToTop'

beforeEach(() => localStorage.clear())

describe('list helpers', () => {
  it('reads and switches the Saved param, and toggles ids', () => {
    expect(savedParam(new URLSearchParams('saved=1'))).toBe(true)
    expect(savedParam(new URLSearchParams())).toBe(false)
    const on = withSaved(new URLSearchParams('x=1'), true)
    expect(on.toString()).toBe('x=1&saved=1')
    expect(withSaved(on, false).toString()).toBe('x=1')
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
    const recipesHeading = screen.getByRole('heading', {
      level: 2,
      name: /^Recipes/
    })
    expect(
      ingredients.compareDocumentPosition(recipesHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Home' })).toBeNull()
    expect(screen.queryByText(/At home|At the shop/)).toBeNull()
    expect(screen.queryByRole('navigation', { name: /step/i })).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.queryByRole('link', { name: /View recipe/ })).toBeNull()
    expect(screen.getByText(/Nothing on your list yet/)).toBeInTheDocument()
    expect(recipes().getByText(/^No recipes picked yet/)).toBeInTheDocument()
  })
})

describe('Scenario: Chips from recipes, grouped by category', () => {
  it('shows chips grouped by category; unpicking removes only chips no other pick needs', () => {
    renderList()
    fireEvent.click(pickFromExplore('Red lentil dahl'))
    fireEvent.click(pickFromExplore('Potato, cauliflower and chickpea curry'))
    expect(groupOf('onion')).toBe('Fruit & Veg')
    expect(groupOf('potato')).toBe('Fruit & Veg')
    expect(groupOf('butter')).toBe('Dairy')
    expect(groupOf('red-lentils')).toBe('Pantry')
    // staples belong to their recipe and show in Ingredients, not Extra (#182)
    expect(hasChipEl('salt')).toBe(1)
    expect(hasChipEl('salt', 'extra')).toBe(0)
    // no count badge (#181): the count stays in the spoken label and in Used in
    expect(within(chip('onion')).queryByTestId('chip-count')).toBeNull()
    expect(toggleOf('onion')).toHaveAccessibleName(/in 2 recipes/)
    fireEvent.click(pickFromExplore('Potato, cauliflower and chickpea curry'))
    expect(hasChipEl('potato')).toBe(0)
    expect(hasChipEl('onion')).toBe(1)
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
    const chevron = chevronOf('onion')
    expect(chevron).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(chevron)
    expect(chevron).toHaveAttribute('aria-expanded', 'true')
    const details = panel('Brown onion details')
    expect(details).toBeVisible()
    // in the flow, straight after the chip, so the chips below move down
    const item = details.closest('li')
    expect(item?.previousElementSibling).toBe(chip('onion'))
    expect(item).toHaveClass('basis-full')
    const classes = item?.className.split(' ')
    expect(classes).not.toContain('absolute')
    expect(classes).not.toContain('fixed')
    expect(
      within(details)
        .getAllByRole('listitem')
        .map((li) => li.textContent)
    ).toEqual([
      // each recipe's box, then its unit (#182: never a bare number)
      'Red lentil dahlonion',
      'Potato, cauliflower and chickpea curryonion'
    ])
    fireEvent.click(chevronOf('garlic'))
    expect(chevron).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(chevronOf('garlic'))
    expect(chevronOf('garlic')).toHaveAttribute('aria-expanded', 'false')
  })

  it('has no Done button: changes apply at once and the chevron closes it (#181)', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    const chevron = chevronOf('tomato')
    await user.click(chevron)
    const details = panel('Tomatoes details')
    expect(within(details).queryByRole('button', { name: 'Remove' })).toBeNull()
    expect(within(details).queryByRole('button', { name: 'Done' })).toBeNull()
    const box = within(details).getByRole('textbox', {
      name: /^Red lentil dahl, /
    })
    await user.clear(box)
    await user.type(box, '2')
    await user.tab()
    expect(toggleOf('tomato')).toHaveAccessibleName(/^Tomatoes, 2\b/)
    await user.click(chevron)
    expect(chevron).toHaveAttribute('aria-expanded', 'false')
    expect(details).not.toBeVisible()
  })
})

describe('Scenario: Edit quantity', () => {
  it('shows the new quantity on the chip', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    await user.click(chevronOf('tomato'))
    const details = panel('Tomatoes details')
    const quantity = within(details).getByRole('textbox', {
      name: /^Red lentil dahl, /
    })
    expect(quantity).toHaveValue('1')
    await user.clear(quantity)
    await user.type(quantity, '2')
    await user.tab()
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
    await user.click(chevronOf('tomato'))
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
    await user.click(chevronOf('tomato'))
    await user.click(
      within(panel('Tomatoes details')).getByRole('radio', { name: 'Deli' })
    )
    await user.click(chevronOf('butter'))
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
    expect(hasChipEl('butter', 'extra')).toBe(1)
    expect(groupOf('butter')).toBe('Dairy')
    expect(groupOf('butter', 'extra')).toBe('Dairy')
    expect(screen.getByRole('status', { name: '' })).toHaveTextContent(
      'Butter added to Extra'
    )
    expect(
      within(area).getByRole('button', { name: 'Butter, on your list' })
    ).toHaveTextContent('On your list')
    expect(toggleOf('butter')).toHaveAccessibleName(/, in Extra$/)
  })

  it('0 in the Extra box asks; Yes takes the extra off and focus goes to the plus', async () => {
    const user = userEvent.setup()
    renderList()
    const plus = screen.getByRole('button', { name: 'Add an ingredient' })
    await user.click(plus)
    await user.click(screen.getByRole('tab', { name: 'Dairy' }))
    await user.click(screen.getByRole('button', { name: 'Butter' }))
    await user.keyboard('{Escape}')
    await user.click(chevronOf('butter'))
    const details = panel('Butter details')
    const box = within(details).getByRole('textbox', { name: /^Extra, / })
    await user.clear(box)
    await user.type(box, '0')
    await user.tab()
    await user.click(
      within(
        screen.getByRole('group', { name: 'Remove butter from Extra?' })
      ).getByRole('button', { name: 'Yes' })
    )
    expect(hasChipEl('butter')).toBe(0)
    expect(hasChipEl('butter', 'extra')).toBe(0)
    expect(plus).toHaveFocus()
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
    // it gains an Extra source at 1 (#182, answer 8)
    expect(hasChipEl('butter', 'extra')).toBe(1)
    const chevron = chevronOf('butter')
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
    const row = pickFromExplore('Red lentil dahl')
    const item = row.closest('li')
    expect(row).toHaveAttribute('aria-pressed', 'false')
    expect(item).toHaveClass('shadow-raised')
    expect(within(row).getByTestId('row-check')).toHaveTextContent('')
    fireEvent.click(row)
    expect(row).toHaveAttribute('aria-pressed', 'true')
    expect(item).toHaveClass('shadow-pressed', 'border-primary')
    expect(within(row).getByTestId('row-check')).toHaveTextContent('✓')
    expect(pickedIds()).toEqual(['dahl'])
    expect(region('Recipes')).toHaveTextContent('1 recipe picked')
    expect(
      within(region('Recipes')).queryByRole('button', { name: /\bAdd\b/ })
    ).toBeNull()
    expect(within(item ?? document.body).getAllByRole('button')).toHaveLength(2)
    // the Recipes section shows only picked recipes (#181)
    expect(
      recipes().getByRole('button', { name: 'Red lentil dahl' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(recipes().queryByRole('button', { name: 'Shaking beef' })).toBeNull()
    fireEvent.click(row)
    expect(row).toHaveAttribute('aria-pressed', 'false')
    expect(recipes().getByText(/^No recipes picked yet/)).toBeInTheDocument()
  })
})

describe('Scenario: Multiple rows open', () => {
  it('keeps both rows open, each with ingredients, portions, method and notes', () => {
    pick('dahl', 'vegetable-curry')
    renderList()
    const dahl = recipes().getByRole('button', {
      name: 'Red lentil dahl details'
    })
    const curry = recipes().getByRole('button', {
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
      ;['Ingredients', 'Method'].forEach((name) =>
        expect(open(button).getByRole('heading', { name })).toBeVisible()
      )
      expect(
        open(button).getByRole('textbox', { name: 'Portions' })
      ).toHaveValue('2')
    })
    // F6: no "You'll also need"
    expect(open(dahl).queryByText(/also need/)).toBeNull()
    expect(open(dahl).getByRole('heading', { name: 'Notes' })).toBeVisible()
    expect(open(dahl).getByText('Contains: milk')).toBeVisible()
    expect(open(dahl).getByText('Red lentils')).toBeVisible()
    fireEvent.click(dahl)
    expect(dahl).toHaveAttribute('aria-expanded', 'false')
    expect(curry).toHaveAttribute('aria-expanded', 'true')
    // picking is separate from opening
    expect(pickedIds()).toEqual(['dahl', 'vegetable-curry'])
  })
})

describe('Scenario: Save visibility', () => {
  it('hides Save in expanded rows when signed out, and saves on the server when signed in (F4)', async () => {
    renderList('/', [savedQuery(), saveMock('dahl')])
    fireEvent.click(
      explore().getByRole('button', { name: 'See recipe: Red lentil dahl' })
    )
    expect(
      screen.queryByRole('button', { name: /Save Red lentil dahl/ })
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Pretend login' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Save Red lentil dahl' })
    )
    expect(
      await screen.findByRole('button', { name: 'Unsave Red lentil dahl' })
    ).toBeInTheDocument()
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
    expect(
      recipes().queryByRole('button', { name: 'Red lentil dahl' })
    ).toBeNull()
    await user.click(recipesHeader())
    expect(
      recipes().getByRole('button', { name: 'Red lentil dahl' })
    ).toBeVisible()
  })
})

describe('Scenario: Motion', () => {
  it('every opening part animates in 0.2 s and is instant with reduced motion', () => {
    pick('dahl')
    renderList()
    fireEvent.click(chevronOf('tomato'))
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
    const scrolls: ScrollIntoViewOptions[] = []
    Element.prototype.scrollIntoView = function (
      options?: boolean | ScrollIntoViewOptions
    ) {
      if (typeof options === 'object') scrolls.push(options)
    }
    window.IntersectionObserver = FakeObserver
    const { unmount } = renderList()
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
    fire({ isIntersecting: false, boundingClientRect: new DOMRect(0, 900) })
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
    fire({})
    await user.click(screen.getByRole('button', { name: 'Scroll to top' }))
    expect(scrolls).toEqual([{ block: 'start', behavior: 'smooth' }])
    expect(
      screen.getByRole('heading', { level: 2, name: /^Ingredients/ })
    ).toHaveFocus()
    fire({ isIntersecting: true, boundingClientRect: new DOMRect(0, 0) })
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
    unmount()
    expect(disconnected).toEqual(['yes'])
  })

  it('hides again when a jump to the very top leaves the chips below the screen', () => {
    window.IntersectionObserver = FakeObserver
    renderList()
    fire({})
    expect(
      screen.getByRole('button', { name: 'Scroll to top' })
    ).toBeInTheDocument()
    fireEvent.scroll(window)
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
  })

  it('treats only a box wholly above the screen as scrolled past', () => {
    expect(isAbove({ bottom: -1 })).toBe(true)
    expect(isAbove({ bottom: 0 })).toBe(false)
    expect(isAbove({ bottom: 400 })).toBe(false)
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
    await user.click(pickFromExplore('Red lentil dahl'))
    await user.click(toggleOf('tomato'))
    await user.click(chevronOf('butter'))
    const butter = within(panel('Butter details')).getByRole('textbox', {
      name: /^Red lentil dahl, /
    })
    await user.clear(butter)
    await user.type(butter, '20')
    await user.tab()
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
      recipes().getByRole('button', { name: 'Red lentil dahl' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(toggleOf('tomato')).toHaveAttribute('aria-pressed', 'true')
    expect(toggleOf('butter')).toHaveAccessibleName(/^Butter, 20 g, Deli, /)
    expect(chip('butter')).toHaveAttribute('data-category', 'Deli')
    expect(groupOf('butter')).toBe('Dairy')
    expect(chipOrder()).toEqual(order)
    expect(chipOrder()).toHaveLength(order.length)
    // in Ingredients and in Extra
    expect(
      screen.getAllByRole('heading', { level: 3, name: 'Bakery' })
    ).toHaveLength(2)
  })
})

describe('Scenario: Accessibility', () => {
  it('reads name, quantity, category, crossed off state and recipe count; chevrons and headers expose aria-expanded', () => {
    pick('dahl', 'vegetable-curry')
    renderList()
    fireEvent.click(toggleOf('onion'))
    expect(toggleOf('onion')).toHaveAccessibleName(
      'Brown onion, 1 onion, Fruit & Veg, in 2 recipes, crossed off'
    )
    expect(toggleOf('onion')).toHaveAttribute('aria-pressed', 'true')
    ;[
      ingredientsHeader(),
      recipesHeader(),
      chevronOf('onion'),
      recipes().getByRole('button', { name: 'Red lentil dahl details' }),
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
    const chevron = chevronOf('tomato')
    expect(chevron).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(chevron).toHaveAttribute('aria-expanded', 'true')
    await user.tab()
    expect(
      within(panel('Tomatoes details')).getByRole('textbox', {
        name: /^Red lentil dahl, /
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
    act(() => searchBox().focus())
    const row = pickFromExplore('Shaking beef')
    row.focus()
    await user.keyboard('{Enter}')
    expect(row).toHaveAttribute('aria-pressed', 'true')
    recipesHeader().focus()
    await user.keyboard('{Enter}')
    expect(recipesHeader()).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('Scenario: Neumorphic hierarchy', () => {
  const noFill = (el: HTMLElement) =>
    el.className.split(' ').filter((c) => /^(bg-|from-|to-)/.test(c))

  it('raises the Recipes section, recesses its rows and raises their chips', () => {
    pick('dahl')
    renderList()
    const section = region('Recipes')
    expect(section).toHaveClass(
      'before:border',
      'before:border-border',
      'before:shadow-section',
      'before:bg-transparent'
    )
    expect(noFill(section)).toEqual([])
    // the header lies flat on the raised section: one raised level at a time
    expect(recipesHeader()).not.toHaveClass('shadow-raised')
    expect(recipesHeader()).toHaveClass('data-[focus-visible]:focus-ring')
    const row = recipes().getByRole('button', { name: 'Red lentil dahl' })
    const item = row.closest('li') ?? document.body
    expect(item).toHaveClass('shadow-recessed', 'border-primary')
    expect(item).not.toHaveClass('shadow-pressed')
    expect(noFill(item)).toEqual(['bg-transparent'])
    expect(row).toHaveClass('data-[focus-visible]:focus-ring')
    fireEvent.click(
      recipes().getByRole('button', { name: 'Red lentil dahl details' })
    )
    const rowChip = chip('tomato', 'row-dahl')
    expect(rowChip).toHaveClass('shadow-chip', 'border')
    expect(noFill(rowChip)).toEqual(['bg-transparent'])
  })

  it('leaves the Ingredients section outline as it was', () => {
    pick('dahl')
    renderList()
    expect(region('Ingredients')).not.toHaveClass('before:shadow-section')
    expect(ingredientsHeader()).toHaveClass('shadow-raised', 'bg-bg')
  })

  it('chips are raised platforms with an ink edge, no fill or gradient, and flat parts', () => {
    pick('dahl')
    renderList()
    const tomato = chip('tomato')
    expect(tomato).toHaveClass(
      'shadow-chip',
      'border',
      'border-badge-produce-ink',
      'text-badge-produce-ink'
    )
    expect(noFill(tomato)).toEqual(['bg-transparent'])
    const check = within(tomato).getByTestId('chip-check')
    const chevron = chevronOf('tomato')
    ;[check, chevron].forEach((part) => {
      expect(part.className).not.toMatch(/shadow|bg-|gradient/)
    })
    expect(toggleOf('tomato')).toHaveClass('data-[focus-visible]:focus-ring')
    expect(chevron).toHaveClass('data-[focus-visible]:focus-ring')
    fireEvent.click(toggleOf('tomato'))
    expect(tomato).toHaveClass('shadow-chip-pressed')
    expect(check.className).not.toMatch(/shadow|bg-/)
    fireEvent.click(chevron)
    expect(chevron.className).not.toMatch(/shadow|bg-/)
  })
})
