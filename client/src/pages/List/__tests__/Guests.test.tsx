import '@testing-library/jest-dom'
import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  chip,
  explore,
  pick,
  recipes,
  renderList,
  searchBox
} from '../../../test/renderList'
import { GUESTS_KEY } from '../../../utils/guests/guests'

/* Scenario: Guest profiles flag what a guest can't have (#209): words plus an outline. */

const KAI = { id: 'g2', name: 'Kai', allergens: ['milk'] }

const saveGuests = (...guests: readonly object[]) =>
  localStorage.setItem(GUESTS_KEY, JSON.stringify(guests))

expect.extend(toHaveNoViolations)

beforeEach(() => localStorage.clear())

const actions = () =>
  explore().getByRole('toolbar', { name: 'Explore actions' })
const guestsButton = (name: string | RegExp = /^Guests/) =>
  within(actions()).getByRole('button', { name })
const panel = () => screen.getByRole('group', { name: 'Guests at the table' })

describe('Guests panel', () => {
  it('opens inline from the Explore actions and starts with a hint', () => {
    renderList()
    const button = guestsButton('Guests')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(panel()).toHaveTextContent('Nothing is changed for you')
  })

  it('adds a guest, ticks an allergen, and keeps both on this device', async () => {
    const user = userEvent.setup()
    renderList()
    fireEvent.click(guestsButton('Guests'))
    await user.type(within(panel()).getByLabelText('Guest name'), 'Kai')
    await user.click(within(panel()).getByRole('button', { name: 'Add guest' }))
    expect(guestsButton('Guests (1)')).toBeInTheDocument()
    await user.click(within(panel()).getByRole('checkbox', { name: 'milk' }))
    expect(JSON.parse(localStorage.getItem(GUESTS_KEY) ?? '[]')).toEqual([
      expect.objectContaining({ name: 'Kai', allergens: ['milk'] })
    ])
    await user.click(within(panel()).getByRole('checkbox', { name: 'milk' }))
    expect(
      within(panel()).getByRole('checkbox', { name: 'milk' })
    ).not.toBeChecked()
  })

  it('ignores a blank name and removes a guest', async () => {
    const user = userEvent.setup()
    saveGuests(KAI)
    renderList()
    fireEvent.click(guestsButton())
    await user.click(within(panel()).getByRole('button', { name: 'Add guest' }))
    expect(guestsButton()).toHaveTextContent('Guests (1)')
    await user.click(
      within(panel()).getByRole('button', { name: 'Remove Kai' })
    )
    expect(guestsButton()).toHaveTextContent(/^Guests$/)
    expect(localStorage.getItem(GUESTS_KEY)).toBe('[]')
  })

  it('has no accessibility violations, closed or open', async () => {
    saveGuests(KAI)
    const { container } = renderList()
    expect(await axe(container)).toHaveNoViolations()
    fireEvent.click(guestsButton())
    expect(await axe(container)).toHaveNoViolations()
    /* two axe passes over the whole list page, which grows with the library (#103) */
  }, 20000)
})

describe('Flags', () => {
  it("say who can't have a recipe, and outline the ingredient chip that clashes", () => {
    saveGuests(KAI)
    renderList()
    const row = explore()
      .getByRole('button', {
        name: 'See recipe: Red lentil dahl'
      })
      .closest('li')
    const scope = within(row ?? document.body)
    expect(scope.getByTestId('guest-flag')).toHaveTextContent(
      "Kai can't have: milk"
    )
    const flagged = row?.querySelectorAll('[data-guest-flag]')
    expect(Array.from(flagged ?? [], (el) => el.textContent)).toEqual([
      'Butter'
    ])
  })

  it('stay off a recipe with nothing a guest cannot have, and when there are no guests', () => {
    const dahlRow = () =>
      explore()
        .getByRole('button', { name: 'See recipe: Red lentil dahl' })
        .closest('li') ?? document.body
    saveGuests({ id: 'g1', name: 'Sam', allergens: ['sesame'] })
    const { unmount } = renderList()
    expect(within(dahlRow()).queryByTestId('guest-flag')).toBeNull()
    expect(dahlRow().querySelector('[data-guest-flag]')).toBeNull()
    unmount()
    localStorage.clear()
    renderList()
    expect(screen.queryAllByTestId('guest-flag')).toEqual([])
  })

  it('show on picked recipes, on the list chip (outline and spoken), and in its details', () => {
    saveGuests(KAI)
    pick('dahl')
    renderList()
    expect(recipes().getAllByTestId('guest-flag')[0]).toHaveTextContent(
      "Kai can't have: milk"
    )
    const butter = chip('butter')
    expect(butter).toHaveAttribute('data-guest-flag', 'true')
    expect(
      within(butter).getByRole('checkbox', { name: /, / })
    ).toHaveAccessibleName(/\. Kai can't have: milk$/)
    expect(chip('onion')).not.toHaveAttribute('data-guest-flag')
    fireEvent.click(within(butter).getByRole('button', { name: /details$/ }))
    expect(
      within(
        screen.getByRole('region', { name: 'Ingredients' })
      ).getAllByTestId('guest-flag')
    ).not.toHaveLength(0)
  })

  it('show on ingredient search results', async () => {
    const user = userEvent.setup()
    saveGuests(KAI)
    renderList()
    await user.click(searchBox())
    await user.paste('butter')
    const item = explore()
      .getAllByRole('button', { name: 'Add butter' })[0]!
      .closest('li')
    expect(
      within(item ?? document.body).getByTestId('guest-flag')
    ).toHaveTextContent("Kai can't have: milk")
  })
})
