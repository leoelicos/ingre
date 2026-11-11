import '@testing-library/jest-dom'
import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toHaveNoViolations } from 'jest-axe'
import { axe } from '../../../test/axe'
import {
  explore,
  pickedIds,
  renderList,
  searchBox
} from '../../../test/renderList'
import { addFontAwesome } from '../../../utils/addFontAwesome'

expect.extend(toHaveNoViolations)
addFontAwesome()

beforeEach(() => localStorage.clear())

/* Acceptance for #205: every ingredient opens the same journey: shop section, what goes with it, the recipes that use it, and suggestions with what is missing and the cost. */

const HEADINGS = ['Shop section', 'Goes with', 'Used in', 'Suggested recipes']

const search = async (text: string) => {
  const user = userEvent.setup()
  renderList()
  await user.click(searchBox())
  await user.paste(text)
  return user
}

const open = (name: string) =>
  fireEvent.click(explore().getByRole('button', { name: `Details of ${name}` }))
const journey = (name: string) =>
  within(explore().getByRole('region', { name: `About ${name}` }))

describe('Scenario: an ingredient has the same relations whichever it is (#205)', () => {
  it('has a closed Details button beside every ingredient result', async () => {
    await search('carrot')
    const button = explore().getByRole('button', { name: 'Details of carrot' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveTextContent('Details')
    expect(screen.queryByRole('region', { name: 'About carrot' })).toBeNull()
  })

  it('opens four sections, in the same order, for an ingredient recipes use', async () => {
    await search('carrot')
    open('carrot')
    const headings = journey('carrot').getAllByRole('heading', { level: 4 })
    expect(headings.map((h) => h.textContent)).toEqual(HEADINGS)
  })

  it('opens the same four sections for an ingredient no recipe uses, each saying so', async () => {
    await search('banana')
    open('banana')
    const headings = journey('banana').getAllByRole('heading', { level: 4 })
    expect(headings.map((h) => h.textContent)).toEqual(HEADINGS)
    expect(journey('banana').getByText('Fruit & Veg')).toBeVisible()
    expect(
      journey('banana').getByText('Nothing pairs with it yet')
    ).toBeVisible()
    expect(
      journey('banana').getByText('No recipe in the library uses it yet')
    ).toBeVisible()
    expect(
      journey('banana').getByText('No recipes to suggest yet')
    ).toBeVisible()
  })

  it('names the shop section it is found in', async () => {
    await search('carrot')
    open('carrot')
    expect(journey('carrot').getByText('Fruit & Veg')).toBeVisible()
  })

  it('lists what goes with it, each a button that starts using it', async () => {
    await search('carrot')
    open('carrot')
    const goes = journey('carrot').getByRole('list', { name: 'Goes with' })
    const first = within(goes).getAllByRole('button')[0]
    expect(first).toBeDefined()
    expect(first).toHaveAttribute('aria-pressed', 'false')
    if (first === undefined) return
    fireEvent.click(first)
    expect(first).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('region', { name: 'Suggestions' })
    ).toBeInTheDocument()
  })

  it('lists the recipes that use it, by name', async () => {
    await search('carrot')
    open('carrot')
    const used = journey('carrot').getByRole('list', { name: 'Used in' })
    expect(
      within(used)
        .getAllByRole('listitem')
        .map((li) => li.textContent)
    ).toEqual([
      'Spaghetti bolognese',
      'Egg fried rice',
      'Lemongrass beef noodle salad (bún bò xào)'
    ])
  })

  it('suggests recipes with what is missing and about what it costs', async () => {
    await search('carrot')
    open('carrot')
    const notes = journey('carrot').getAllByTestId('suggestion-note')
    expect(notes).toHaveLength(3)
    expect(notes[0]).toHaveTextContent('Missing:')
    expect(notes[0]).toHaveTextContent('About $')
  })

  it('adds a suggestion to the list in one action, with an acknowledgement', async () => {
    await search('carrot')
    open('carrot')
    fireEvent.click(
      journey('carrot').getByRole('button', {
        name: 'Add Egg fried rice to your list'
      })
    )
    expect(pickedIds()).toContain('egg-fried-rice')
    expect(journey('carrot').getByRole('status')).toHaveTextContent(
      'Egg fried rice added to your list'
    )
    expect(journey('carrot').getByText('✓ On your list')).toBeVisible()
  })

  it('closes again from the same button', async () => {
    await search('carrot')
    open('carrot')
    open('carrot')
    expect(screen.queryByRole('region', { name: 'About carrot' })).toBeNull()
  })

  it('has no accessibility violations when open', async () => {
    await search('carrot')
    open('carrot')
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('opens from the keyboard', async () => {
    const user = await search('carrot')
    const button = explore().getByRole('button', { name: 'Details of carrot' })
    button.focus()
    await user.keyboard('{Enter}')
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })
})
