import '@testing-library/jest-dom'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MOTION } from '../../../components/Collapse'
import { saveMock, savedQuery } from '../../../test/savedMocks'
import {
  chip,
  chipOrder,
  explore,
  groupOf,
  hasChipEl,
  closeSheet,
  extra,
  fab,
  ingredientsAtTop,
  sheet,
  panel,
  pick,
  pickedIds,
  chevronOf,
  pickFromExplore,
  pickInExplore,
  recipes,
  region,
  searchBox,
  renderList,
  toggleOf,
  chipBox
} from '../../../test/renderList'
import { savedParam, withSaved } from '../ListPage'
import { toggled } from '../Recipes'
import { isAbove } from '../ScrollToTop'
import { NO_EXTRA_HINT } from '../Extra'
import { disconnected, fire, resetObserver } from '../../../test/observer'

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
  it('shows Recipes above Ingredients, with no steps, Home control, recipe chips, sheets or overlays (#192)', () => {
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
      recipesHeading.compareDocumentPosition(ingredients) &
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
    pickInExplore('Red lentil dahl')
    pickInExplore('Potato, cauliflower and chickpea curry')
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
    pickInExplore('Potato, cauliflower and chickpea curry')
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
    expect(toggleOf('tomato')).toBeChecked()
    expect(toggleOf('tomato')).toHaveAccessibleName(/, crossed off$/)
    expect(
      within(chipBox('tomato')).getByText('Tomatoes').parentElement
    ).toHaveClass('line-through')
    expect(chipOrder()).toEqual(before)
    expect(region('Ingredients')).toHaveTextContent(/\d+ items, 1 crossed off/)
    fireEvent.click(toggleOf('tomato'))
    expect(toggleOf('tomato')).not.toBeChecked()
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
    expect(within(chipBox('tomato')).getByText(/^2\b/)).toBeInTheDocument()
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

describe('Scenario: Add an extra (#192: the Extra sheet)', () => {
  it('lists the catalogue by category under the extra chips; a Dairy row adds Butter and says so', async () => {
    const user = userEvent.setup()
    renderList()
    const sheet = extra()
    const tabs = sheet.getByRole('tablist', { name: 'Categories' })
    expect(within(tabs).getAllByRole('tab').length).toBeGreaterThan(1)
    expect(sheet.getByText(NO_EXTRA_HINT)).toBeInTheDocument()
    expect(sheet.queryByText('Used in')).toBeNull()
    await user.click(within(tabs).getByRole('tab', { name: 'Dairy' }))
    await user.click(sheet.getByRole('button', { name: 'Butter' }))
    expect(hasChipEl('butter')).toBe(1)
    expect(hasChipEl('butter', 'extra')).toBe(1)
    expect(groupOf('butter', 'extra')).toBe('Dairy')
    expect(sheet.getByText('Butter added to Extra')).toHaveAttribute(
      'role',
      'status'
    )
    expect(
      sheet.getByRole('button', { name: 'Butter, on your list' })
    ).toHaveTextContent('On your list')
    await user.click(
      sheet.getByRole('button', { name: 'Butter, on your list' })
    )
    expect(sheet.getByText('Butter is already in Extra')).toBeInTheDocument()
    expect(hasChipEl('butter', 'extra')).toBe(1)
    closeSheet()
    expect(groupOf('butter')).toBe('Dairy')
    expect(toggleOf('butter')).toHaveAccessibleName(/, in Extra$/)
    // the page's own status stays quiet while a sheet speaks
    expect(
      screen
        .getAllByRole('status')
        .some((el) => el.textContent === 'Butter is already in Extra')
    ).toBe(true)
  })

  it('0 in the Extra box asks; Yes takes the extra off and focus goes to the close button', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(extra().getByRole('tab', { name: 'Dairy' }))
    await user.click(extra().getByRole('button', { name: 'Butter' }))
    await user.click(chevronOf('butter', 'extra'))
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
    expect(screen.getByRole('button', { name: 'Close Extra' })).toHaveFocus()
  })

  it('in Ingredients, 0 in the Extra box takes it off and focus goes to the Ingredients heading', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(extra().getByRole('tab', { name: 'Dairy' }))
    await user.click(extra().getByRole('button', { name: 'Butter' }))
    closeSheet()
    await user.click(chevronOf('butter'))
    const box = within(panel('Butter details')).getByRole('textbox', {
      name: /^Extra, /
    })
    await user.clear(box)
    await user.type(box, '0')
    await user.tab()
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    expect(hasChipEl('butter')).toBe(0)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Ingredients' })
    ).toHaveFocus()
  })
})

describe('Scenario: Add an existing ingredient', () => {
  it('gives an ingredient already on the list an Extra amount, never a second chip', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    await user.click(extra().getByRole('tab', { name: 'Dairy' }))
    await user.click(
      extra().getByRole('button', { name: 'Butter, on your list' })
    )
    expect(hasChipEl('butter')).toBe(1)
    // it gains an Extra source at 1 (#182, answer 8)
    expect(hasChipEl('butter', 'extra')).toBe(1)
    expect(extra().getByText('Butter added to Extra')).toBeInTheDocument()
  })
})

describe('Scenario: Sheets (#192)', () => {
  it('Escape closes a sheet and focus goes back to the FAB', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(fab())
    expect(sheet('Explore')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(sheet('Explore')).toBeNull()
    await waitFor(() => expect(fab()).toHaveFocus())
  })

  it('the close button and a press on the dimmed page close it', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(fab())
    await user.click(screen.getByRole('button', { name: 'Close Explore' }))
    expect(sheet('Explore')).toBeNull()
    await user.click(fab())
    const dialog = screen.getByRole('dialog', { name: 'Explore' })
    const overlay = dialog.parentElement?.parentElement ?? document.body
    await user.click(overlay)
    expect(sheet('Explore')).toBeNull()
  })
})

describe('Scenario: Recipe rows', () => {
  it('one tap selects the row: pressed, bordered, ticked and announced; there is no Add button', () => {
    renderList()
    const row = pickFromExplore('Red lentil dahl')
    const inExplore = () =>
      explore().getByRole('button', { name: 'Red lentil dahl' })
    const item = row.closest('li')
    expect(row).toHaveAttribute('aria-pressed', 'false')
    expect(item).toHaveClass('shadow-raised')
    expect(within(row).getByTestId('row-check')).toHaveTextContent('')
    fireEvent.click(row)
    expect(row).toHaveAttribute('aria-pressed', 'true')
    expect(item).toHaveClass('shadow-pressed', 'border-primary')
    expect(within(row).getByTestId('row-check')).toHaveTextContent('✓')
    expect(pickedIds()).toEqual(['dahl'])
    expect(within(item ?? document.body).getAllByRole('button')).toHaveLength(2)
    closeSheet()
    expect(region('Recipes')).toHaveTextContent('1 recipe picked')
    expect(
      within(region('Recipes')).queryByRole('button', { name: /\bAdd\b/ })
    ).toBeNull()
    // the Recipes section shows only picked recipes (#181)
    expect(
      recipes().getByRole('button', { name: 'Red lentil dahl' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(recipes().queryByRole('button', { name: 'Shaking beef' })).toBeNull()
    fireEvent.click(inExplore())
    expect(inExplore()).toHaveAttribute('aria-pressed', 'false')
    closeSheet()
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
    // the page behind the sheet is hidden from assistive tech while it is open
    fireEvent.click(
      screen.getByRole('button', { name: 'Pretend login', hidden: true })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Save Red lentil dahl' })
    )
    expect(
      await screen.findByRole('button', { name: 'Unsave Red lentil dahl' })
    ).toBeInTheDocument()
  })
})

describe('Scenario: No accordions (#192)', () => {
  it('section headers are plain headings: nothing collapses, both sections always show', () => {
    pick('dahl')
    renderList()
    ;['Ingredients', 'Recipes'].forEach((name) => {
      expect(
        screen.getByRole('heading', { level: 2, name })
      ).not.toHaveAttribute('aria-expanded')
      expect(
        screen.queryByRole('button', { name: new RegExp(`^${name}`) })
      ).toBeNull()
    })
    expect(chip('tomato')).toBeVisible()
    expect(
      recipes().getByRole('button', { name: 'Red lentil dahl' })
    ).toBeVisible()
  })

  it('pins the Ingredients heading at the top, on the page background, over the list', () => {
    renderList()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Ingredients' })
    ).toHaveClass('sticky', 'top-0', 'z-10', 'bg-bg')
    expect(
      screen.getByRole('heading', { level: 2, name: 'Recipes' })
    ).not.toHaveClass('sticky')
  })
})

describe('Scenario: Motion', () => {
  it('every opening part animates in 0.2 s and is instant with reduced motion', () => {
    pick('dahl')
    renderList()
    fireEvent.click(chevronOf('tomato'))
    const parts = [
      ...document.querySelectorAll('[data-collapse]'),
      chip('tomato').nextElementSibling
    ]
    // the filters, every recipe row and the chip panel
    expect(parts.length).toBeGreaterThan(3)
    parts.forEach((part) => {
      expect(part?.className).toContain(MOTION)
    })
  })
})

describe('Scenario: Scroll to top', () => {
  it('appears once Recipes is scrolled past; brings it back and focuses the Recipes heading (#192)', async () => {
    const user = userEvent.setup()
    const scrolls: ScrollIntoViewOptions[] = []
    Element.prototype.scrollIntoView = function (
      options?: boolean | ScrollIntoViewOptions
    ) {
      if (typeof options === 'object') scrolls.push(options)
    }
    const { unmount } = renderList()
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
    fire('recipes', {
      isIntersecting: false,
      boundingClientRect: new DOMRect(0, 900)
    })
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
    fire('recipes', {})
    await user.click(screen.getByRole('button', { name: 'Scroll to top' }))
    expect(scrolls).toEqual([{ block: 'start', behavior: 'smooth' }])
    expect(
      screen.getByRole('heading', { level: 2, name: /^Recipes/ })
    ).toHaveFocus()
    fire('recipes', {
      isIntersecting: true,
      boundingClientRect: new DOMRect(0, 0)
    })
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
    unmount()
    expect(disconnected).toEqual(expect.arrayContaining(['recipes']))
  })

  it('hides again when a jump to the very top leaves Recipes below the screen', () => {
    renderList()
    fire('recipes', {})
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
    resetObserver()
    renderList()
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
  })
})

describe('Scenario: State kept', () => {
  it('keeps picks, crossed off chips, edits, extras and chip order after a refresh', async () => {
    const user = userEvent.setup()
    const first = renderList()
    pickInExplore('Red lentil dahl')
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
    await user.click(extra().getByRole('tab', { name: 'Bakery' }))
    const [bread] = within(
      extra().getByRole('tabpanel', { name: 'Bakery' })
    ).getAllByRole('button')
    if (bread === undefined) throw new Error('no bakery rows')
    await user.click(bread)
    closeSheet()
    const order = chipOrder()
    first.unmount()

    renderList()
    expect(
      recipes().getByRole('button', { name: 'Red lentil dahl' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(toggleOf('tomato')).toBeChecked()
    expect(toggleOf('butter')).toHaveAccessibleName(/^Butter, 20 g, Deli, /)
    expect(chip('butter')).toHaveAttribute('data-category', 'Deli')
    expect(groupOf('butter')).toBe('Dairy')
    expect(chipOrder()).toEqual(order)
    expect(chipOrder()).toHaveLength(order.length)
    // in Ingredients, and in Extra
    expect(
      screen.getAllByRole('heading', { level: 3, name: 'Bakery' })
    ).toHaveLength(1)
    expect(
      extra().getAllByRole('heading', { level: 3, name: 'Bakery' })
    ).toHaveLength(1)
  })
})

describe('Scenario: Accessibility', () => {
  it('reads name, quantity, category, crossed off state and recipe count; chevrons expose aria-expanded', () => {
    pick('dahl', 'vegetable-curry')
    renderList()
    fireEvent.click(toggleOf('onion'))
    expect(toggleOf('onion')).toHaveAccessibleName(
      'Brown onion, 1 onion, Fruit & Veg, in 2 recipes, crossed off'
    )
    expect(toggleOf('onion')).toBeChecked()
    ;[
      chevronOf('onion'),
      recipes().getByRole('button', { name: 'Red lentil dahl details' })
    ].forEach((button) => {
      expect(button.tagName).toBe('BUTTON')
      expect(button).toHaveAttribute('aria-expanded')
      expect(button.className).toContain('focus-ring')
    })
  })

  it('works by keyboard: chips, chevrons, Sort, the FAB, the search box, tabs and rows', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    toggleOf('tomato').focus()
    await user.keyboard(' ')
    expect(toggleOf('tomato')).toBeChecked()
    await user.keyboard(' ')
    expect(toggleOf('tomato')).not.toBeChecked()
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
    fab().focus()
    await user.keyboard('{Enter}')
    expect(searchBox()).toHaveFocus()
    const row = pickFromExplore('Shaking beef')
    act(() => row.focus())
    await user.keyboard('{Enter}')
    expect(row).toHaveAttribute('aria-pressed', 'true')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(fab()).toHaveFocus())
    ingredientsAtTop(true)
    expect(fab()).toHaveAccessibleName('Add a pantry item')
    await user.keyboard('{Enter}')
    const tab = extra().getAllByRole('tab')[0]
    act(() => tab?.focus())
    await user.keyboard('{ArrowRight}')
    expect(extra().getAllByRole('tab')[1]).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(sheet('Extra')).toBeNull()
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
    const recipesRow = screen.getByRole('heading', {
      level: 2,
      name: 'Recipes'
    }).firstElementChild
    expect(recipesRow).not.toHaveClass('shadow-raised')
    expect(
      screen.getByRole('heading', { level: 2, name: 'Recipes' })
    ).toHaveClass('focus-visible:focus-ring')
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
    expect(
      screen.getByRole('heading', { level: 2, name: 'Ingredients' })
        .firstElementChild
    ).toHaveClass('shadow-raised', 'bg-bg')
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
    expect(chipBox('tomato')).toHaveClass('data-[focus-visible]:focus-ring')
    expect(chevron).toHaveClass('data-[focus-visible]:focus-ring')
    fireEvent.click(toggleOf('tomato'))
    expect(tomato).toHaveClass('shadow-chip-pressed')
    expect(check.className).not.toMatch(/shadow|bg-/)
    fireEvent.click(chevron)
    expect(chevron.className).not.toMatch(/shadow|bg-/)
  })
})
