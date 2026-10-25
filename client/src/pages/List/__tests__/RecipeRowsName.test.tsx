import '@testing-library/jest-dom'
import { fireEvent, within } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { explore, pick, recipes, renderList } from '../../../test/renderList'

/* #191: a recipe row shows just its name; no key-ingredient preview or three-letter badges. */

expect.extend(toHaveNoViolations)
beforeEach(() => localStorage.clear())

const DAHL = 'Red lentil dahl'
/** A three-letter code (or the "?" placeholder) the old badges drew. */
const CODE = /^([A-Z]{3}|\?)$/

type Scope = ReturnType<typeof within>

const rowOf = (scope: Scope, name: string): HTMLElement => {
  const row = scope.getByRole('button', { name }).closest('li')
  if (row === null) throw new Error(`no row ${name}`)
  return row
}
/** Any element in the row whose whole text is a badge code. */
const codes = (row: HTMLElement): string[] =>
  Array.from(row.querySelectorAll('span'), (el) => el.textContent).filter(
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

const expectNameOnly = (scope: Scope, name: string) => {
  const toggle = scope.getByRole('button', { name })
  expect(toggle).toHaveTextContent(new RegExp(`^✓?${name}$`))
  expect(toggle).not.toHaveAttribute('aria-describedby')
  expect(within(toggle).queryByRole('list')).toBeNull()
  expect(codes(rowOf(scope, name))).toEqual([])
}

describe('Scenario: Recipes rows show just the name (#191)', () => {
  it('a collapsed row is the name, check mark and chevron only', async () => {
    pick('dahl')
    const { container } = renderList()
    expectNameOnly(recipes(), DAHL)
    expect(rowOf(recipes(), DAHL)).toHaveTextContent(new RegExp(`^✓${DAHL}$`))
    expect(await axe(container)).toHaveNoViolations()
  })

  it('an expanded row shows its chips, with no preview or badges above them', () => {
    pick('dahl')
    renderList()
    fireEvent.click(recipes().getByRole('button', { name: `${DAHL} details` }))
    const row = rowOf(recipes(), DAHL)
    expect(
      detailsOf(row).querySelectorAll('[data-scope="row-dahl"][data-chip]')
        .length
    ).toBe(12)
    expectNameOnly(recipes(), DAHL)
  })
})

describe('Scenario: Explore results show just the name (#191)', () => {
  it('a collapsed result is the name and See recipe only', () => {
    renderList()
    expectNameOnly(explore(), DAHL)
    expect(rowOf(explore(), DAHL)).toHaveTextContent(
      new RegExp(`^${DAHL}See recipe$`)
    )
  })

  it('an expanded result shows its ingredients, with no preview or badges', () => {
    renderList()
    fireEvent.click(
      explore().getByRole('button', { name: `See recipe: ${DAHL}` })
    )
    const row = rowOf(explore(), DAHL)
    expect(detailsOf(row).querySelectorAll('[data-ingredient]').length).toBe(12)
    expectNameOnly(explore(), DAHL)
  })
})
