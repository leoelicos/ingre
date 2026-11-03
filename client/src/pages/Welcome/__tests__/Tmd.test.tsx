import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  ExploreProvider,
  GUIDANCE_KEY
} from '../../../utils/explore/ExploreContext'
import { TMD_KEY } from '../../../utils/tmd/tmd'
import { Tmd } from '../Tmd'

expect.extend(toHaveNoViolations)

beforeEach(() => localStorage.clear())

const renderIt = (onDone = jest.fn()) => {
  const view = render(
    <ExploreProvider>
      <Tmd onDone={onDone} />
    </ExploreProvider>
  )
  return { ...view, onDone, user: userEvent.setup() }
}

const next = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Next' }))

describe('Tmd (#211)', () => {
  it('starts at step 1 of 3 with the dial question, a why and the change-later hint', () => {
    renderIt()
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      'Step 1 of 3'
    )
    expect(
      screen.getByRole('radiogroup', { name: 'How much help do you want?' })
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Assisted' })).toBeChecked()
    expect(
      screen.getByText(/Why we ask: this sets how much Explore/)
    ).toBeInTheDocument()
    expect(screen.getByText(/You can change these later/)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Back' })
    ).not.toBeInTheDocument()
  })

  it('Next and Back move between the steps and keep what was chosen', async () => {
    const { user } = renderIt()
    await user.click(screen.getByText('Guided'))
    await next(user)
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      'Step 2 of 3'
    )
    expect(
      screen.getByRole('radiogroup', { name: 'Do you follow a diet?' })
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('radio', { name: 'Guided' })).toBeChecked()
  })

  it('Finish saves the three answers and turns the dial', async () => {
    const { user, onDone } = renderIt()
    await user.click(screen.getByText('Hand-held'))
    await next(user)
    await user.click(screen.getByText('Vegan'))
    expect(screen.getByRole('radio', { name: 'Vegan' })).toBeChecked()
    await next(user)
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      'Step 3 of 3'
    )
    await user.click(screen.getByText('Peanut'))
    await user.click(screen.getByText('Milk'))
    expect(screen.getByRole('checkbox', { name: 'Milk' })).toBeChecked()
    await user.click(screen.getByText('Milk'))
    expect(screen.getByRole('checkbox', { name: 'Milk' })).not.toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Finish' }))
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(JSON.parse(localStorage.getItem(TMD_KEY) ?? 'null')).toEqual({
      guidance: 'hand-held',
      diet: 'vegan',
      avoid: ['peanut']
    })
    expect(localStorage.getItem(GUIDANCE_KEY)).toBe('"hand-held"')
  })

  it('Skip leaves everything as it was: Assisted, no diet, nothing avoided', async () => {
    const { user, onDone } = renderIt()
    await user.click(screen.getByText('Guided'))
    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(TMD_KEY)).toBeNull()
    expect(localStorage.getItem(GUIDANCE_KEY)).toBeNull()
  })

  it('opens on the saved answers when they are changed later', () => {
    localStorage.setItem(
      TMD_KEY,
      JSON.stringify({ guidance: 'self-directed', diet: 'none', avoid: [] })
    )
    renderIt()
    expect(screen.getByRole('radio', { name: 'Self-directed' })).toBeChecked()
  })

  it.each([0, 1, 2])('has no axe violations at step %i', async (steps) => {
    const { container, user } = renderIt()
    for (let i = 0; i < steps; i++) await next(user)
    expect(await axe(container)).toHaveNoViolations()
  })
})
