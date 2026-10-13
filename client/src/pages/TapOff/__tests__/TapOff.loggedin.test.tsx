import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TapOff from '../TapOff'

const mockDispatch = jest.fn()
const mockState: { savedIngredients: unknown } = { savedIngredients: [] }
const mockAuth = { loggedIn: true }

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [mockAuth, jest.fn()]
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [mockState, mockDispatch]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

describe('TapOff when logged in', () => {
  it('asks for an ingredient list when nothing is saved', () => {
    mockState.savedIngredients = 'not-a-list'
    render(
      <MemoryRouter>
        <TapOff />
      </MemoryRouter>
    )
    expect(screen.getByText(/generate an ingredient list/i)).toBeInTheDocument()
  })

  it('lists ingredients and toggles them', () => {
    mockState.savedIngredients = [
      {
        _id: '1',
        name: 'Tomato',
        quantity: 2,
        measure: 'cup',
        category: { name: 'Produce' },
        recipe: 'Salad',
        recipeId: 'r1'
      },
      { nope: true }
    ]
    render(
      <MemoryRouter>
        <TapOff />
      </MemoryRouter>
    )
    const box = screen.getByRole('checkbox')
    fireEvent.click(box)
    expect(box).toBeChecked()
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'UPDATE_TAP_OFF' })
    )
  })
})
