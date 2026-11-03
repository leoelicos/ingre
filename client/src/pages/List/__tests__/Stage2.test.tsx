import '@testing-library/jest-dom'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  chevronOf,
  chip,
  ensureExtra,
  explore,
  hasChipEl,
  panel,
  pick,
  recipes,
  region,
  renderList,
  searchBox,
  storedCopies,
  toggleOf
} from '../../../test/renderList'
import { saveMock, savedQuery } from '../../../test/savedMocks'
import type { RecipeInput } from '../../../types/payloads'
import { NO_EXTRA_HINT } from '../Extra'
import { REFRESH_QUESTION } from '../Ingredients'
import { OriginalDetails } from '../RowDetails'
import { recipeById } from '../../../test/library'
import { EXTRAS_KEY } from '../../../utils/storage/shoppingState'

/* #182 Stage 2 on the page: balance-sheet chips, Extra, recipe copies and filters. */

beforeEach(() => {
  localStorage.clear()
  Element.prototype.scrollIntoView = () => undefined
})

type User = ReturnType<typeof userEvent.setup>

const box = (panelName: string, name: RegExp | string) =>
  within(panel(panelName)).getByRole('textbox', { name })

/** Types a number into a box and leaves it, so the field commits. */
const setBox = async (user: User, field: HTMLElement, value: string) => {
  await user.clear(field)
  await user.type(field, value)
  await user.tab()
}

const question = (name: string) => screen.getByRole('group', { name })
const answer = async (user: User, name: string, reply: 'Yes' | 'No') =>
  user.click(within(question(name)).getByRole('button', { name: reply }))

const toolbar = (name: string) => within(screen.getByRole('toolbar', { name }))
const openFilter = (section: string) =>
  fireEvent.click(
    toolbar(`${section} actions`).getByRole('button', { name: /^Filter/ })
  )

/** Picks an ingredient in a filter's combo box, then closes its list. */
const choose = async (
  user: User,
  filter: ReturnType<typeof within>,
  picker: string,
  option: string
) => {
  await user.click(filter.getByRole('combobox', { name: picker }))
  await user.click(screen.getByRole('option', { name: option }))
  await user.keyboard('{Escape}')
  await user.tab()
}

/** A chip's open panel in a scope: "chip" (Ingredients), "extra" or "row-<id>". */
const scopedPanel = (id: string, scope: string) => {
  const found = document.getElementById(`${scope}-${id}-panel`)
  if (found === null) throw new Error(`no panel ${scope} ${id}`)
  return within(found)
}

/** Opens a picked recipe's row in Recipes and returns its details. */
const openRow = async (user: User, title: string) => {
  const chevron = recipes().getByRole('button', { name: `${title} details` })
  await user.click(chevron)
  const details = document.getElementById(
    chevron.getAttribute('aria-controls') ?? ''
  )
  if (details === null) throw new Error(`no details for ${title}`)
  return within(details)
}

describe('Feature: Balance-sheet ingredients (#182)', () => {
  it('Scenario: A chip shows a box per recipe in its own unit, and the total', async () => {
    const user = userEvent.setup()
    pick('butter-chicken', 'dahl')
    renderList()
    expect(toggleOf('butter')).toHaveAccessibleName(/^Butter, 40 g, /)
    await user.click(chevronOf('butter'))
    expect(box('Butter details', 'Butter chicken, butter (g)')).toHaveValue(
      '25'
    )
    expect(box('Butter details', 'Red lentil dahl, butter (g)')).toHaveValue(
      '15'
    )
    expect(panel('Butter details')).toHaveTextContent('Total: 40 g')
    await setBox(
      user,
      box('Butter details', 'Red lentil dahl, butter (g)'),
      '17.5'
    )
    expect(panel('Butter details')).toHaveTextContent('Total: 42.5 g')
  })

  it('Scenario: 0 asks first; No puts the box back to 1, Yes takes it off that recipe', async () => {
    const user = userEvent.setup()
    pick('butter-chicken', 'dahl')
    renderList()
    await user.click(chevronOf('butter'))
    const dahl = box('Butter details', 'Red lentil dahl, butter (g)')
    await setBox(user, dahl, '0')
    const ask = 'Remove butter from Red lentil dahl?'
    await waitFor(() =>
      expect(
        within(question(ask)).getByRole('button', { name: 'Yes' })
      ).toHaveFocus()
    )
    await answer(user, ask, 'No')
    expect(box('Butter details', 'Red lentil dahl, butter (g)')).toHaveValue(
      '1'
    )
    expect(box('Butter details', 'Red lentil dahl, butter (g)')).toHaveFocus()
    await setBox(
      user,
      box('Butter details', 'Red lentil dahl, butter (g)'),
      '0'
    )
    await answer(user, ask, 'Yes')
    expect(box('Butter details', 'Red lentil dahl, butter (g)')).toHaveValue(
      '0'
    )
    expect(panel('Butter details')).toHaveTextContent('Total: 25 g')
    expect(toggleOf('butter')).toHaveAccessibleName(/in 1 recipe/)
  })

  it('Scenario: Removed from every recipe, a chip greys at 0 and a number restores it', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    await user.click(chevronOf('red-lentils'))
    const name = /^Red lentil dahl, /
    await setBox(user, box('Red lentils details', name), '0')
    await answer(user, 'Remove red lentils from Red lentil dahl?', 'Yes')
    expect(chip('red-lentils')).toHaveAttribute('data-greyed', 'true')
    expect(toggleOf('red-lentils')).toBeDisabled()
    expect(toggleOf('red-lentils')).toHaveAccessibleName(
      /removed from every recipe/
    )
    await setBox(user, box('Red lentils details', name), '150')
    expect(chip('red-lentils')).toHaveAttribute('data-greyed', 'false')
  })

  it('Scenario: Refresh asks, then resets every copy to its original', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    await user.click(chevronOf('butter'))
    await setBox(user, box('Butter details', /^Red lentil dahl, /), '30')
    const refresh = toolbar('Ingredients actions').getByRole('button', {
      name: 'Refresh'
    })
    await user.click(refresh)
    await answer(user, REFRESH_QUESTION, 'No')
    expect(refresh).toHaveFocus()
    expect(toggleOf('butter')).toHaveAccessibleName(/^Butter, 30 g, /)
    await user.click(refresh)
    await answer(user, REFRESH_QUESTION, 'Yes')
    expect(toggleOf('butter')).toHaveAccessibleName(/^Butter, 15 g, /)
    expect(screen.queryByRole('group', { name: REFRESH_QUESTION })).toBeNull()
  })
})

describe('Feature: Extra (#182)', () => {
  it('Scenario: Empty Extra says so and offers the plus', () => {
    renderList()
    expect(region('Extra')).toHaveTextContent(NO_EXTRA_HINT)
    expect(
      within(region('Extra')).getByRole('button', { name: 'Add an ingredient' })
    ).toBeInTheDocument()
  })

  it('Scenario: The Extra box holds whole numbers; 0 asks and Yes leaves the recipe amount', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    const plus = within(region('Extra')).getByRole('button', {
      name: 'Add an ingredient'
    })
    await user.click(plus)
    await user.click(screen.getByRole('tab', { name: 'Dairy' }))
    await user.click(
      screen.getByRole('button', { name: 'Butter, on your list' })
    )
    expect(plus).toHaveAttribute('aria-expanded', 'false')
    expect(chip('butter', 'extra')).toHaveTextContent('1 g')
    // the Ingredients chip is open; Extra's has the same panel
    const extraBox = () =>
      scopedPanel('butter', 'chip').getByRole('textbox', { name: /^Extra, / })
    await setBox(user, extraBox(), '3')
    expect(toggleOf('butter')).toHaveAccessibleName(/^Butter, 18 g, /)
    await user.click(chevronOf('butter', 'extra'))
    expect(
      scopedPanel('butter', 'extra').getByRole('textbox', { name: /^Extra, / })
    ).toHaveValue('3')
    await setBox(user, extraBox(), '0')
    await answer(user, 'Remove butter from Extra?', 'Yes')
    expect(hasChipEl('butter', 'extra')).toBe(0)
    expect(hasChipEl('butter')).toBe(1)
    expect(chevronOf('butter')).toHaveFocus()
  })

  it('Scenario: Staples belong to their recipe, and only the plus puts one in Extra', async () => {
    const user = userEvent.setup()
    renderList()
    fireEvent.click(explore().getByRole('button', { name: 'Red lentil dahl' }))
    expect(hasChipEl('salt')).toBe(1)
    expect(hasChipEl('salt', 'extra')).toBe(0)
    await user.click(chevronOf('salt'))
    expect(
      scopedPanel('salt', 'chip').getByRole('textbox', {
        name: /^Red lentil dahl, salt \(tsp\)$/
      })
    ).toHaveValue('0.5')
    const plus = within(region('Extra')).getByRole('button', {
      name: 'Add an ingredient'
    })
    await user.click(plus)
    await user.click(screen.getByRole('tab', { name: 'Pantry' }))
    await user.click(screen.getByRole('button', { name: 'Salt, on your list' }))
    expect(hasChipEl('salt', 'extra')).toBe(1)
    fireEvent.click(explore().getByRole('button', { name: 'Red lentil dahl' }))
    expect(hasChipEl('salt', 'extra')).toBe(1)
    expect(hasChipEl('butter')).toBe(0)
  })

  it('Scenario: Unpicking the last recipe that uses a staple removes it', () => {
    renderList()
    fireEvent.click(explore().getByRole('button', { name: 'Red lentil dahl' }))
    fireEvent.click(
      explore().getByRole('button', {
        name: 'Pork chops with apples and onion'
      })
    )
    expect(toggleOf('salt')).toHaveAccessibleName(/in 2 recipes/)
    fireEvent.click(explore().getByRole('button', { name: 'Red lentil dahl' }))
    expect(toggleOf('salt')).toHaveAccessibleName(/in 1 recipe/)
    fireEvent.click(
      explore().getByRole('button', {
        name: 'Pork chops with apples and onion'
      })
    )
    expect(hasChipEl('salt')).toBe(0)
  })

  it('Scenario: Crossed off is one state across Ingredients, Extra and rows', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      EXTRAS_KEY,
      JSON.stringify([
        { id: 'salt', name: 'salt', ingredientId: 'salt', quantity: 1 }
      ])
    )
    renderList()
    await user.click(explore().getByRole('button', { name: 'Red lentil dahl' }))
    await user.click(toggleOf('salt', 'extra'))
    expect(toggleOf('salt')).toBeChecked()
    await openRow(user, 'Red lentil dahl')
    expect(toggleOf('salt', 'row-dahl')).toBeChecked()
    await user.click(toggleOf('salt', 'row-dahl'))
    expect(toggleOf('salt', 'extra')).not.toBeChecked()
  })

  it('Scenario: The Extra filter offers category and crossed off, with Clear', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      EXTRAS_KEY,
      JSON.stringify([
        { id: 'salt', name: 'salt', ingredientId: 'salt', quantity: 1 },
        { id: 'feta', name: 'feta', ingredientId: 'feta', quantity: 1 },
        { id: 'eggs', name: 'eggs', ingredientId: 'egg', quantity: 1 }
      ])
    )
    renderList()
    await user.click(
      explore().getByRole('button', {
        name: 'Pork chops with apples and onion'
      })
    )
    await user.click(toggleOf('salt', 'extra'))
    openFilter('Extra')
    const filter = within(screen.getByRole('group', { name: 'Filter extra' }))
    expect(
      filter.getAllByRole('checkbox', {
        name: /Crossed off|Customised|Extra|Removed/
      })
    ).toHaveLength(1)
    await user.click(filter.getByRole('checkbox', { name: 'Crossed off' }))
    expect(
      within(region('Extra')).getByText('2 hidden by filter')
    ).toBeInTheDocument()
    expect(
      toolbar('Extra actions').getByRole('button', { name: 'Filter (1)' })
    ).toBeInTheDocument()
    await user.click(
      within(region('Extra')).getByRole('button', { name: 'Clear' })
    )
    expect(hasChipEl('salt', 'extra')).toBe(1)
  })

  it('Scenario: Typed extras stay, in Extra under Other, with the same panel', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      EXTRAS_KEY,
      JSON.stringify([
        { id: 'x1', name: 'birthday candles', ingredientId: null, quantity: 2 }
      ])
    )
    renderList()
    ensureExtra()
    const candles = document.querySelector<HTMLElement>(
      '[data-scope="extra"][data-category="Other"]'
    )
    if (candles === null) throw new Error('no typed extra')
    expect(candles).toHaveTextContent('Birthday candles')
    await user.click(within(candles).getByRole('button', { name: /details$/ }))
    expect(
      within(panel('Birthday candles details')).queryByRole('list', {
        name: 'Allergens'
      })
    ).toBeNull()
  })

  it('Scenario: Escape closes the Extra plus and focus goes back to it', async () => {
    const user = userEvent.setup()
    renderList()
    const plus = within(region('Extra')).getByRole('button', {
      name: 'Add an ingredient'
    })
    await user.click(plus)
    await user.keyboard('{Escape}')
    expect(plus).toHaveFocus()
    expect(plus).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('Feature: Counted items have a buying unit (#182, owner decision 2)', () => {
  it('Scenario: Counted items read in their own unit, singular or plural, never a bare number', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    expect(toggleOf('garlic')).toHaveAccessibleName(/^Garlic, 2 cloves, /)
    expect(toggleOf('onion')).toHaveAccessibleName(/^Brown onion, ½ onion, /)
    expect(toggleOf('tomato')).toHaveAccessibleName(/^Tomatoes, 1 tomato, /)
    expect(toggleOf('ginger')).toHaveAccessibleName(/^Ginger, 10 g, /)
    await user.click(chevronOf('garlic'))
    expect(
      box('Garlic details', 'Red lentil dahl, garlic (cloves)')
    ).toHaveValue('2')
    const plus = within(region('Extra')).getByRole('button', {
      name: 'Add an ingredient'
    })
    await user.click(plus)
    await user.click(screen.getByRole('tab', { name: 'Fruit & Veg' }))
    await user.click(
      screen.getByRole('button', { name: 'Garlic, on your list' })
    )
    expect(chip('garlic', 'extra')).toHaveTextContent('1 head')
    expect(toggleOf('garlic')).toHaveAccessibleName(/^Garlic, 12 cloves, /)
    const extraBox = () =>
      scopedPanel('garlic', 'chip').getByRole('textbox', {
        name: 'Extra, garlic (head)'
      })
    await setBox(user, extraBox(), '2')
    expect(chip('garlic', 'extra')).toHaveTextContent('2 heads')
    expect(
      scopedPanel('garlic', 'chip').getByRole('textbox', {
        name: 'Extra, garlic (heads)'
      })
    ).toHaveValue('2')
  })

  it('Scenario: A recipe row and its customisations show counted amounts with their unit', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    const row = await openRow(user, 'Red lentil dahl')
    expect(row.getByText('2 cloves')).toBeInTheDocument()
    expect(row.getByText('½ onion')).toBeInTheDocument()
    expect(row.getByText('1 tomato')).toBeInTheDocument()
  })
})

describe('Feature: Ingredients filter (#182)', () => {
  it('Scenario: Any ticked value in a group matches; every group must match; N hidden with Clear', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    openFilter('Ingredients')
    const filter = within(
      screen.getByRole('group', { name: 'Filter ingredients' })
    )
    await user.click(filter.getByRole('checkbox', { name: 'Dairy' }))
    expect(hasChipEl('butter')).toBe(1)
    expect(hasChipEl('onion')).toBe(0)
    await user.click(filter.getByRole('checkbox', { name: 'Fruit & Veg' }))
    expect(hasChipEl('onion')).toBe(1)
    await user.click(filter.getByRole('checkbox', { name: 'Extra' }))
    expect(hasChipEl('onion')).toBe(0)
    expect(hasChipEl('butter')).toBe(0)
    await user.click(filter.getByRole('checkbox', { name: 'Extra' }))
    await user.click(filter.getByRole('checkbox', { name: 'Customised' }))
    expect(
      toolbar('Ingredients actions').getByRole('button', { name: 'Filter (3)' })
    ).toBeInTheDocument()
    expect(
      within(region('Ingredients')).getByText(/\d+ hidden by filter/)
    ).toBeInTheDocument()
    await user.click(
      within(region('Ingredients')).getByRole('button', { name: 'Clear' })
    )
    expect(hasChipEl('red-lentils')).toBe(1)
  })

  it('Scenario: Picking an item already on the list clears the filter and opens its chip', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    openFilter('Ingredients')
    await user.click(
      within(
        screen.getByRole('group', { name: 'Filter ingredients' })
      ).getByRole('checkbox', { name: 'Pantry' })
    )
    await user.click(
      within(region('Extra')).getByRole('button', { name: 'Add an ingredient' })
    )
    await user.click(screen.getByRole('tab', { name: 'Dairy' }))
    await user.click(
      screen.getByRole('button', { name: 'Butter, on your list' })
    )
    expect(chevronOf('butter')).toHaveAttribute('aria-expanded', 'true')
    expect(
      within(region('Ingredients')).queryByText(/hidden by filter/)
    ).toBeNull()
  })
})

describe('Feature: Recipe copies (#182)', () => {
  it('Scenario: Portions are whole numbers and edits scale with them', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    const row = await openRow(user, 'Red lentil dahl')
    await user.click(chevronOf('butter', 'row-dahl'))
    await setBox(user, box('Butter details', /^Red lentil dahl, /), '30')
    expect(row.getByText('Butter 15 g → 30 g')).toBeInTheDocument()
    await setBox(user, row.getByRole('textbox', { name: 'Portions' }), '4')
    expect(row.getByText('Butter 30 g → 60 g')).toBeInTheDocument()
    expect(row.getByText('Portions 2 → 4')).toBeInTheDocument()
    // a cleared box is not a number: portions stay
    await user.clear(row.getByRole('textbox', { name: 'Portions' }))
    await user.tab()
    expect(row.getByRole('textbox', { name: 'Portions' })).toHaveValue('4')
    expect(storedCopies()).toEqual([
      { recipeId: 'dahl', portions: 4, amounts: { butter: 15 } }
    ])
  })

  it('Scenario: A row chip tap crosses off; its chevron opens the recipe box; 0 greys it in the row', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    const row = await openRow(user, 'Red lentil dahl')
    await user.click(toggleOf('tomato', 'row-dahl'))
    expect(toggleOf('tomato')).toBeChecked()
    await user.click(chevronOf('tomato', 'row-dahl'))
    await setBox(user, box('Tomatoes details', /^Red lentil dahl, /), '0')
    await answer(user, 'Remove tomatoes from Red lentil dahl?', 'Yes')
    expect(chip('tomato', 'row-dahl')).toHaveAttribute('data-greyed', 'true')
    expect(row.getByText('Tomatoes removed')).toBeInTheDocument()
    expect(within(panel('Tomatoes details')).getByRole('textbox')).toHaveFocus()
  })

  it('Scenario: A row adds an ingredient with the category tabs; one already there just opens', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    const row = await openRow(user, 'Red lentil dahl')
    const add = row.getByRole('button', {
      name: 'Add an ingredient to Red lentil dahl'
    })
    await user.click(add)
    const area = within(
      screen.getByRole('group', {
        name: 'Add an ingredient to Red lentil dahl'
      })
    )
    await user.click(area.getByRole('tab', { name: 'Dairy' }))
    expect(
      area.getByRole('button', { name: 'Butter, in this recipe' })
    ).toBeInTheDocument()
    await user.click(area.getByRole('button', { name: 'Feta' }))
    expect(hasChipEl('feta', 'row-dahl')).toBe(1)
    expect(hasChipEl('feta')).toBe(1)
    expect(row.getByText(/^Added feta /)).toBeInTheDocument()
    expect(chevronOf('feta', 'row-dahl')).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    await user.click(add)
    await user.click(area.getByRole('tab', { name: 'Dairy' }))
    await user.click(
      area.getByRole('button', { name: 'Butter, in this recipe' })
    )
    expect(chevronOf('butter', 'row-dahl')).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    await user.click(add)
    await user.keyboard('{Escape}')
    expect(add).toHaveFocus()
    await user.click(add)
    await user.click(document.body)
    expect(
      screen.queryByRole('group', {
        name: 'Add an ingredient to Red lentil dahl'
      })
    ).toBeNull()
  })

  it('Scenario: Allergens follow the customised ingredients; Explore keeps the original', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    const row = await openRow(user, 'Red lentil dahl')
    expect(row.getByText('Contains: milk')).toBeInTheDocument()
    await user.click(chevronOf('butter', 'row-dahl'))
    await setBox(user, box('Butter details', /^Red lentil dahl, /), '0')
    await answer(user, 'Remove butter from Red lentil dahl?', 'Yes')
    expect(row.queryByText('Contains: milk')).toBeNull()
    expect(row.getByText('Butter removed')).toBeInTheDocument()
    act(() => searchBox().focus())
    await user.click(
      explore().getByRole('button', { name: 'See recipe: Red lentil dahl' })
    )
    expect(explore().getByText('Contains: milk')).toBeInTheDocument()
  })

  it('Scenario: Unpicking removes the copy; picking again starts from the original', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    await openRow(user, 'Red lentil dahl')
    await user.click(chevronOf('butter', 'row-dahl'))
    await setBox(user, box('Butter details', /^Red lentil dahl, /), '30')
    const tick = recipes().getByRole('button', { name: 'Red lentil dahl' })
    await user.click(tick)
    expect(hasChipEl('butter')).toBe(0)
    act(() => searchBox().focus())
    await user.click(explore().getByRole('button', { name: 'Red lentil dahl' }))
    expect(toggleOf('butter')).toHaveAccessibleName(/^Butter, 15 g, /)
  })

  it('Scenario: Saving a copy sends its customisations (F4)', async () => {
    const user = userEvent.setup()
    const seen: RecipeInput[] = []
    pick('dahl')
    renderList('/', [savedQuery(), saveMock('dahl', seen)])
    fireEvent.click(screen.getByRole('button', { name: 'Pretend login' }))
    const row = await openRow(user, 'Red lentil dahl')
    await user.click(chevronOf('butter', 'row-dahl'))
    await setBox(user, box('Butter details', /^Red lentil dahl, /), '30')
    await user.click(row.getByRole('button', { name: 'Save Red lentil dahl' }))
    expect(
      await row.findByRole('button', { name: 'Unsave Red lentil dahl' })
    ).toBeInTheDocument()
    expect(seen[0]?.customisations).toEqual({
      added: [],
      removed: [],
      changed: [{ ingredientId: 'butter', from: 15, to: 30 }]
    })
  })
  it('Scenario: Saving from Explore saves the list copy with its customisations; off the list it saves the original', async () => {
    const user = userEvent.setup()
    const seen: RecipeInput[] = []
    pick('dahl')
    renderList('/', [
      savedQuery(),
      saveMock('dahl', seen),
      saveMock('butter-chicken', seen)
    ])
    fireEvent.click(screen.getByRole('button', { name: 'Pretend login' }))
    await user.click(chevronOf('butter'))
    await setBox(user, box('Butter details', /^Red lentil dahl, /), '30')
    act(() => searchBox().focus())
    await user.click(
      explore().getByRole('button', { name: 'See recipe: Red lentil dahl' })
    )
    await user.click(
      await explore().findByRole('button', { name: 'Save Red lentil dahl' })
    )
    await waitFor(() => expect(seen).toHaveLength(1))
    expect(seen[0]?.customisations).toEqual({
      added: [],
      removed: [],
      changed: [{ ingredientId: 'butter', from: 15, to: 30 }]
    })
    await user.click(
      explore().getByRole('button', { name: 'See recipe: Butter chicken' })
    )
    await user.click(
      explore().getByRole('button', { name: 'Save Butter chicken' })
    )
    await waitFor(() => expect(seen).toHaveLength(2))
    expect(seen[1]?.customisations).toEqual({
      added: [],
      removed: [],
      changed: []
    })
  })
})

describe('Feature: Recipe filters (#182)', () => {
  it('Scenario: Contains and excludes take several ingredients, by the customised copy', async () => {
    const user = userEvent.setup()
    pick('dahl', 'vegetable-curry')
    renderList()
    openFilter('Recipes')
    const filter = within(screen.getByRole('group', { name: 'Filter recipes' }))
    await choose(user, filter, 'Contains', 'Butter')
    expect(
      recipes().queryByRole('button', {
        name: 'Potato, cauliflower and chickpea curry'
      })
    ).toBeNull()
    expect(
      within(region('Recipes')).getByText('1 hidden by filter')
    ).toBeInTheDocument()
    await user.click(filter.getByRole('button', { name: /^Remove Butter/ }))
    await choose(user, filter, 'Excludes', 'Potato')
    await choose(user, filter, 'Excludes', 'Red lentils')
    expect(
      toolbar('Recipes actions').getByRole('button', { name: 'Filter (2)' })
    ).toBeInTheDocument()
    expect(
      within(region('Recipes')).getByText('2 hidden by filter')
    ).toBeInTheDocument()
    await user.click(
      within(region('Recipes')).getByRole('button', { name: 'Clear' })
    )
    expect(
      recipes().getByRole('button', { name: 'Red lentil dahl' })
    ).toBeInTheDocument()
  })

  it('Scenario: Nothing hidden shows no note; a chosen ingredient stays when its recipe goes', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderList()
    openFilter('Recipes')
    const filter = within(screen.getByRole('group', { name: 'Filter recipes' }))
    await choose(user, filter, 'Contains', 'Butter')
    expect(within(region('Recipes')).queryByText(/hidden by filter/)).toBeNull()
    await user.click(recipes().getByRole('button', { name: 'Red lentil dahl' }))
    expect(
      filter.getByRole('button', { name: /^Remove Butter/ })
    ).toBeInTheDocument()
  })

  it('Scenario: Explore filters the originals, and Clear also turns Saved off', async () => {
    const user = userEvent.setup()
    renderList('/?saved=1')
    const filter = within(screen.getByRole('group', { name: 'Filter Explore' }))
    await choose(user, filter, 'Contains', 'Red lentils')
    await user.click(
      within(region('Explore')).getByRole('button', { name: 'Clear' })
    )
    expect(filter.getByRole('switch', { name: 'Saved' })).not.toBeChecked()
    expect(screen.getByLabelText('where')).toHaveTextContent(/^\/$/)
    await choose(user, filter, 'Contains', 'Red lentils')
    expect(
      explore().getByRole('button', { name: 'Red lentil dahl' })
    ).toBeInTheDocument()
    expect(explore().queryByRole('button', { name: 'Shaking beef' })).toBeNull()
  })
})

describe('Feature: Explore rows (#182, answer 32)', () => {
  it('shows the original at 2 portions; ingredients missing from the catalogue still show', () => {
    render(
      <OriginalDetails
        recipe={recipeById('dahl')}
        title="Red lentil dahl"
        saved={null}
        items={[]}
      />
    )
    expect(screen.getAllByText('150 g').length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { name: 'Notes' })).toBeNull()
  })
})
