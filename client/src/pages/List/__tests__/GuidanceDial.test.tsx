import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { GUIDANCE_KEY } from '../../../utils/explore/ExploreContext'
import { explore, renderList, searchBox } from '../../../test/renderList'
import { addFontAwesome } from '../../../utils/addFontAwesome'
import type { Guidance } from '../../../utils/guidance/guidance'

expect.extend(toHaveNoViolations)
addFontAwesome()

beforeEach(() => localStorage.clear())

/* Acceptance for #206: a draggable dial sets how much Explore does unasked. */

const CARROT = 'carrot'
const dial = () => explore().getByRole('slider', { name: 'Guidance' })
const start = (mode?: Guidance) => {
  if (mode !== undefined)
    localStorage.setItem(GUIDANCE_KEY, JSON.stringify(mode))
  return renderList()
}
const search = async (text: string) => {
  const user = userEvent.setup()
  await user.click(searchBox())
  await user.paste(text)
  return user
}
const flagged = () =>
  document.querySelectorAll('[data-name-chip][data-flagged="true"]')

describe('Scenario: the dial (#206)', () => {
  it('is a slider named Guidance with four positions, Assisted by default', () => {
    start()
    expect(dial()).toHaveAttribute('min', '0')
    expect(dial()).toHaveAttribute('max', '3')
    expect(dial()).toHaveAccessibleDescription('Assisted')
    ;['Self-directed', 'Guided', 'Assisted', 'Hand-held'].forEach((label) =>
      expect(explore().getByText(label, { selector: 'li' })).toBeVisible()
    )
  })

  it('turns with the arrow keys, Home and End, and remembers where it is', async () => {
    const user = userEvent.setup()
    const { unmount } = start()
    dial().focus()
    await user.keyboard('{ArrowLeft}')
    expect(dial()).toHaveAccessibleDescription('Guided')
    await user.keyboard('{Home}')
    expect(dial()).toHaveAccessibleDescription('Self-directed')
    await user.keyboard('{End}')
    expect(dial()).toHaveAccessibleDescription('Hand-held')
    unmount()
    start()
    expect(dial()).toHaveAccessibleDescription('Hand-held')
  })

  it('has no accessibility violations', async () => {
    start()
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

describe('Scenario: what each position does (#206)', () => {
  it('Self-directed: no suggestions and no tips; Details still answers on request', async () => {
    start('self-directed')
    const user = await search(CARROT)
    expect(
      screen.queryByRole('button', { name: 'Use carrot' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Browse ingredients' })
    ).not.toBeInTheDocument()
    const details = explore().getByRole('button', { name: 'Details of carrot' })
    await user.hover(details)
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    await user.click(details)
    expect(explore().getAllByTestId('suggestion-note').length).toBeGreaterThan(
      0
    )
  })

  it('Self-directed: what goes with an ingredient is plain text, since nothing is suggested unasked', async () => {
    start('self-directed')
    const user = await search(CARROT)
    await user.click(
      explore().getByRole('button', { name: 'Details of carrot' })
    )
    const goes = explore().getByRole('list', { name: 'Goes with' })
    expect(goes.querySelectorAll('button')).toHaveLength(0)
    expect(goes.querySelectorAll('li').length).toBeGreaterThan(0)
  })

  it('Guided: tooltips, but no suggestions and no Use buttons', async () => {
    start('guided')
    const user = await search(CARROT)
    expect(
      screen.queryByRole('button', { name: 'Use carrot' })
    ).not.toBeInTheDocument()
    await user.hover(
      explore().getByRole('button', { name: 'Details of carrot' })
    )
    expect(
      await screen.findByRole('tooltip', {}, { timeout: 3000 })
    ).toHaveTextContent('See where it sits in the shop')
  })

  it('Assisted: suggestions with tooltips and at most two outlines a row', async () => {
    start('assisted')
    const user = await search(CARROT)
    const use = explore().getByRole('button', { name: 'Use carrot' })
    await user.hover(use)
    expect(
      await screen.findByRole('tooltip', {}, { timeout: 3000 })
    ).toHaveTextContent('Pick what you have')
    await user.click(use)
    const notes = explore().getAllByTestId('suggestion-note').length
    expect(notes).toBeGreaterThan(0)
    expect(flagged().length).toBeGreaterThan(0)
    expect(flagged().length).toBeLessThanOrEqual(2 * notes)
  })

  it('Hand-held: every missing ingredient outlined, and a primary action to add', async () => {
    start('hand-held')
    const user = await search(CARROT)
    await user.click(explore().getByRole('button', { name: 'Use carrot' }))
    const missing = explore()
      .getAllByTestId('suggestion-note')[0]
      ?.querySelector('p')
    expect(missing).toBeDefined()
    const count = (missing?.textContent ?? '')
      .replace('Missing: ', '')
      .split(', ').length
    expect(flagged().length).toBeGreaterThanOrEqual(count)
    expect(
      explore().getAllByRole('button', { name: /^Add .* to your list$/ })[0]
    ).toHaveClass('bg-primary')
  })

  it('outlines are never the only sign: the missing ingredients are still named in text', async () => {
    start('assisted')
    const user = await search(CARROT)
    await user.click(explore().getByRole('button', { name: 'Use carrot' }))
    expect(explore().getAllByText(/^Missing:/).length).toBeGreaterThan(0)
  })

  it('turning the dial down takes the suggestions away', async () => {
    const user = userEvent.setup()
    start('assisted')
    await user.click(searchBox())
    await user.paste(CARROT)
    await user.click(explore().getByRole('button', { name: 'Use carrot' }))
    expect(
      screen.getByRole('region', { name: 'Suggestions' })
    ).toBeInTheDocument()
    dial().focus()
    await user.keyboard('{Home}')
    expect(
      screen.queryByRole('region', { name: 'Suggestions' })
    ).not.toBeInTheDocument()
    await user.keyboard('{End}')
    expect(
      screen.getByRole('region', { name: 'Suggestions' })
    ).toBeInTheDocument()
  })
})
