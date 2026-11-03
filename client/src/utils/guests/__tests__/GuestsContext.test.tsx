import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GuestsProvider, useGuestActions, useGuestList } from '../GuestsContext'
import { GUESTS_KEY } from '../guests'

const Probe = () => {
  const guests = useGuestList()
  const { add, remove, setAllergens } = useGuestActions()
  return (
    <>
      <output aria-label="guests">{JSON.stringify(guests)}</output>
      <button onClick={() => add('Kai')}>add</button>
      <button onClick={() => setAllergens(guests[0]?.id ?? '', ['milk'])}>
        milk
      </button>
      <button onClick={() => remove(guests[0]?.id ?? '')}>remove</button>
    </>
  )
}

beforeEach(() => localStorage.clear())

describe('GuestsProvider', () => {
  it('adds, sets allergens, removes and persists', async () => {
    const user = userEvent.setup()
    render(
      <GuestsProvider>
        <Probe />
      </GuestsProvider>
    )
    await user.click(screen.getByText('add'))
    await user.click(screen.getByText('milk'))
    expect(screen.getByLabelText('guests')).toHaveTextContent('"milk"')
    expect(localStorage.getItem(GUESTS_KEY)).toContain('Kai')
    await user.click(screen.getByText('remove'))
    expect(screen.getByLabelText('guests')).toHaveTextContent('[]')
  })

  it('reads guests saved earlier', () => {
    localStorage.setItem(
      GUESTS_KEY,
      JSON.stringify([{ id: 'a', name: 'Sam', allergens: [] }])
    )
    render(
      <GuestsProvider>
        <Probe />
      </GuestsProvider>
    )
    expect(screen.getByLabelText('guests')).toHaveTextContent('Sam')
  })
})

describe('without a provider', () => {
  it('has no guests, and actions are an error', () => {
    const quiet = jest.spyOn(console, 'error').mockImplementation(jest.fn())
    const Bare = () => <output aria-label="n">{useGuestList().length}</output>
    render(<Bare />)
    expect(screen.getByLabelText('n')).toHaveTextContent('0')
    expect(() => render(<Probe />)).toThrow('needs a GuestsProvider')
    quiet.mockRestore()
  })
})
