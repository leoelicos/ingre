import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { EXTRAS_KEY } from '../../../utils/storage/shoppingState'
import { WarRoom } from '../WarRoom'

expect.extend(toHaveNoViolations)

beforeEach(() => localStorage.clear())

/* The three War room layouts share one hook; each must add on one tap and stay accessible. */

const open = (design: string) =>
  render(
    <MemoryRouter initialEntries={[`/war-room?design=${design}`]}>
      <WarRoom />
    </MemoryRouter>
  )
const wall = () => screen.getByRole('list', { name: 'Ingredients and recipes' })
const field = () =>
  screen.getByRole('searchbox', { name: 'Search, type or paste a list' })
const listed = (): { ingredientId: string; quantity: number }[] =>
  JSON.parse(localStorage.getItem(EXTRAS_KEY) ?? '[]')

describe.each(['a', 'b', 'c', 'zz'])('design %s', (design) => {
  it('adds on one tap, takes one off with minus, and passes axe', async () => {
    const user = userEvent.setup()
    const { container } = open(design)
    const banana = within(wall()).getByRole('button', { name: 'Add banana' })
    await user.click(banana)
    await user.click(banana)
    expect(listed()).toMatchObject([{ ingredientId: 'banana', quantity: 2 }])
    expect(
      within(wall()).getByRole('button', { name: 'Add banana, 2 on list' })
    ).toBeInTheDocument()
    await user.click(
      within(wall()).getByRole('button', { name: 'One less banana' })
    )
    expect(listed()).toMatchObject([{ ingredientId: 'banana', quantity: 1 }])
    expect(await axe(container)).toHaveNoViolations()
  })

  it('"ba" shows Banana first; Enter adds it and keeps the field', async () => {
    const user = userEvent.setup()
    open(design)
    await user.keyboard('/')
    expect(field()).toHaveFocus()
    await user.keyboard('ba')
    const matches = screen.getByRole('list', { name: 'Matches' })
    const first = within(matches).getAllByRole('button')[0]
    expect(first).toHaveAccessibleName('Add banana')
    await user.keyboard('{Enter}')
    expect(listed()).toMatchObject([{ ingredientId: 'banana', quantity: 1 }])
    expect(field()).toHaveFocus()
    expect(field()).toHaveValue('')
  })

  it('the kind toggle filters the wall and is remembered', async () => {
    const user = userEvent.setup()
    const { unmount } = open(design)
    await user.click(screen.getByRole('radio', { name: 'Recipes' }))
    expect(
      within(wall()).queryByRole('button', { name: 'Add banana' })
    ).not.toBeInTheDocument()
    unmount()
    open(design)
    expect(screen.getByRole('radio', { name: 'Recipes' })).toBeChecked()
  })
})
