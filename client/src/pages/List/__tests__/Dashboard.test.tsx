import '@testing-library/jest-dom'
import { fireEvent, within } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { pick, region, renderList } from '../../../test/renderList'
import { EXTRAS_KEY } from '../../../utils/storage/shoppingState'

/* #232: a cross-section of the current list: macros, estimated cost, spread over shop sections. */

expect.extend(toHaveNoViolations)
beforeEach(() => localStorage.clear())

const dashboard = () => within(region('Dashboard'))

describe('Dashboard (#232)', () => {
  it('says what it is for while the list is empty', () => {
    renderList()
    expect(dashboard().getByText(/Nothing on your list yet/)).toBeVisible()
    expect(dashboard().queryByRole('meter')).toBeNull()
  })

  it('shows cost, energy and macros for the list, and its summary in the header', () => {
    pick('dahl')
    renderList()
    const heading = region('Dashboard').querySelector('h2')
    expect(heading).toHaveTextContent(/\$\d+\.\d\d · \d+ items/)
    const cost = /\$(\d+\.\d\d)/.exec(heading?.textContent ?? '')?.[1] ?? ''
    expect(Number(cost)).toBeGreaterThan(0)
    expect(dashboard().getByText('Estimated cost')).toBeVisible()
    expect(dashboard().getByText(`About $${cost}`)).toBeVisible()
    expect(dashboard().getByText('Energy').nextSibling).toHaveTextContent(
      /^\d+ kJ$/
    )
    ;['Protein', 'Fat', 'Carbohydrate'].forEach((name) =>
      expect(dashboard().getByText(name).nextSibling).toHaveTextContent(/ g$/)
    )
    expect(dashboard().getByText(/rough, unverified estimates/)).toBeVisible()
  })

  it('spreads the cost over the shop sections with a labelled meter each', () => {
    pick('dahl')
    renderList()
    const meters = dashboard().getAllByRole('meter')
    expect(meters.length).toBeGreaterThan(1)
    const names = meters.map((m) => m.getAttribute('aria-valuetext'))
    names.forEach((text) =>
      expect(text).toMatch(/^\$\d+\.\d\d · \d+ items? · \d+%$/)
    )
    expect(
      dashboard().getByRole('meter', { name: 'Fruit & Veg' })
    ).toHaveAttribute('aria-valuemin', '0')
  })

  it('names items without a price or nutrition', () => {
    localStorage.setItem(
      EXTRAS_KEY,
      JSON.stringify([
        { id: 'x1', name: 'foil', ingredientId: null, quantity: 1 }
      ])
    )
    renderList()
    expect(dashboard().getByText('No price for: foil')).toBeVisible()
    expect(dashboard().getByText('No nutrition for: foil')).toBeVisible()
  })

  it('collapses with the other sections in the vertical layout', () => {
    renderList()
    const toggle = region('Dashboard').querySelector('button[aria-expanded]')
    expect(toggle).not.toBeNull()
    if (toggle === null) return
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('has no accessibility violations', async () => {
    pick('dahl')
    const { container } = renderList()
    expect(await axe(container)).toHaveNoViolations()
  })
})
