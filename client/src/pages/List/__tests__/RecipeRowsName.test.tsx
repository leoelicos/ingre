import '@testing-library/jest-dom'
import { fireEvent, within } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { copyLines, newCopy, usedLines } from '../../../utils/balance/copies'
import { catalogue, library } from '../../../utils/library/recipeLibrary'
import { displayName } from '../../../utils/shopping/shoppingList'
import { explore, pick, recipes, renderList } from '../../../test/renderList'

/*
 * #191: a closed recipe row shows its name and every ingredient as a read-only chip; an
 * open row shows the editable chips instead. Never a key-ingredient preview or badges.
 */

expect.extend(toHaveNoViolations)
beforeEach(() => localStorage.clear())

const DAHL = 'Red lentil dahl'
const dahl = library.filter((r) => r.id === 'dahl')
const DAHL_NAMES = dahl.flatMap((recipe) =>
  usedLines(copyLines(recipe, newCopy(recipe.id), catalogue)).map(displayName)
)
/** A three-letter code (or the "?" placeholder) the old badges drew. */
const CODE = /^([A-Z]{3}|\?)$/

type Scope = ReturnType<typeof within>

const rowOf = (scope: Scope, name: string): HTMLElement => {
  const row = scope.getByRole('button', { name }).closest('li')
  if (row === null) throw new Error(`no row ${name}`)
  return row
}
/** Every element on the page whose whole text is a badge code. */
const codes = (root: Element): string[] =>
  Array.from(root.querySelectorAll('*'), (el) => el.textContent).filter(
    (text) => CODE.test(text)
  )
/** The row's details panel, from its chevron. */
const detailsOf = (row: HTMLElement): HTMLElement => {
  const id = within(row)
    .getAllByRole('button')
    .map((button) => button.getAttribute('aria-controls'))
    .find((value) => value !== null)
  const found = document.getElementById(id ?? '')
  if (found === null) throw new Error('no details')
  return found
}
const namesList = (row: HTMLElement) =>
  within(row).queryByRole('list', { name: `Ingredients in ${DAHL}` })

/** The toggle is just the check mark and name: no preview list or description. */
const expectNameToggle = (scope: Scope) => {
  const toggle = scope.getByRole('button', { name: DAHL })
  expect(toggle).toHaveTextContent(new RegExp(`^✓?${DAHL}$`))
  expect(toggle).not.toHaveAttribute('aria-describedby')
  expect(within(toggle).queryByRole('list')).toBeNull()
}

/** Closed: every ingredient by name, as plain read-only list items. */
const expectReadOnlyNames = (row: HTMLElement) => {
  const list = namesList(row)
  if (list === null) throw new Error('no ingredient names')
  const items = within(list).getAllByRole('listitem')
  expect(items.map((item) => item.textContent)).toEqual(DAHL_NAMES)
  expect(items).toHaveLength(12)
  expect(within(list).queryAllByRole('button')).toEqual([])
  expect(within(list).queryAllByRole('checkbox')).toEqual([])
  expect(list.querySelectorAll('svg, input, [tabindex]')).toHaveLength(0)
  items.forEach((item) => expect(item).not.toHaveTextContent(/\d/))
}

describe('Scenario: Recipes rows (#191)', () => {
  it('a closed row shows its name and every ingredient as a read-only chip', async () => {
    pick('dahl')
    const { container } = renderList()
    expectNameToggle(recipes())
    expectReadOnlyNames(rowOf(recipes(), DAHL))
    expect(codes(container)).toEqual([])
    expect(await axe(container)).toHaveNoViolations()
  })

  it('an open row shows the editable chips instead, with no preview or badges', () => {
    pick('dahl')
    const { container } = renderList()
    fireEvent.click(recipes().getByRole('button', { name: `${DAHL} details` }))
    const row = rowOf(recipes(), DAHL)
    expect(namesList(row)).toBeNull()
    expect(
      detailsOf(row).querySelectorAll('[data-scope="row-dahl"][data-chip]')
    ).toHaveLength(12)
    expectNameToggle(recipes())
    expect(codes(container)).toEqual([])
  })
})

describe('Scenario: Explore results (#191)', () => {
  it('a closed result shows its name and every ingredient as a read-only chip', () => {
    const { container } = renderList()
    expectNameToggle(explore())
    expectReadOnlyNames(rowOf(explore(), DAHL))
    expect(codes(container)).toEqual([])
  })

  it('an open result shows its ingredients once, with no preview or badges', () => {
    const { container } = renderList()
    fireEvent.click(
      explore().getByRole('button', { name: `See recipe: ${DAHL}` })
    )
    const row = rowOf(explore(), DAHL)
    expect(namesList(row)).toBeNull()
    expect(detailsOf(row).querySelectorAll('[data-ingredient]')).toHaveLength(
      12
    )
    expectNameToggle(explore())
    expect(codes(container)).toEqual([])
  })
})
