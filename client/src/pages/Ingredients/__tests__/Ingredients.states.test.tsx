import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Ingredients } from '../Ingredients'

const mockReload = jest.fn()
const mockFinish = jest.fn()
const mockAdd = jest.fn()
const mockIngredients: {
  savedRecipeLoading: boolean
  savedRecipeError: Error | undefined
  dataSource: unknown[]
  reload: typeof mockReload
  onFinish: typeof mockFinish
  handleAdd: typeof mockAdd
} = {
  savedRecipeLoading: false,
  savedRecipeError: undefined,
  dataSource: [],
  reload: mockReload,
  onFinish: mockFinish,
  handleAdd: mockAdd
}
const mockAuth = { loggedIn: true }

jest.mock('../useIngredients', () => ({
  useIngredients: () => mockIngredients
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [mockAuth, jest.fn()]
}))

describe('Ingredients states', () => {
  beforeEach(() => {
    mockAuth.loggedIn = true
    mockIngredients.savedRecipeLoading = false
    mockIngredients.savedRecipeError = undefined
    mockIngredients.dataSource = []
  })

  it('shows a loading message, an error, an empty list, and rows', () => {
    mockIngredients.savedRecipeLoading = true
    const { rerender } = render(
      <MemoryRouter>
        <Ingredients />
      </MemoryRouter>
    )
    expect(screen.getByText(/loading saved ingredients/i)).toBeInTheDocument()

    mockIngredients.savedRecipeLoading = false
    mockIngredients.savedRecipeError = new Error('nope')
    rerender(
      <MemoryRouter>
        <Ingredients />
      </MemoryRouter>
    )
    expect(
      screen.getByText(/couldn't load saved ingredients/i)
    ).toBeInTheDocument()

    mockIngredients.savedRecipeError = undefined
    rerender(
      <MemoryRouter>
        <Ingredients />
      </MemoryRouter>
    )
    expect(screen.getByText(/click the generate button/i)).toBeInTheDocument()

    mockIngredients.dataSource = [{ name: 'Salt' }]
    rerender(
      <MemoryRouter>
        <Ingredients />
      </MemoryRouter>
    )
    expect(screen.getByText(/salt/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Generate'))
    fireEvent.click(screen.getByText('Ingredient'))
    fireEvent.click(screen.getByText('Tap Off'))
    expect(mockReload).toHaveBeenCalled()
    expect(mockAdd).toHaveBeenCalled()
    expect(mockFinish).toHaveBeenCalled()
  })
})
