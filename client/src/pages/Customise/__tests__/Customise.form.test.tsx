import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import Customise from '../Customise'

const mockForm = {
  handleClearAll: jest.fn(),
  handleUndoAll: jest.fn(),
  name: 'Pie',
  onNameChange: jest.fn(),
  portions: 2,
  onPortionsChange: jest.fn(),
  ingredients: [{ name: 'Salt', quantity: 1, measure: 'g', category: 'spice' }],
  onIngredientsChange: jest.fn(),
  onDeleteIngredient: jest.fn(),
  onAddIngredient: jest.fn(),
  handleBack: jest.fn(),
  onFinish: jest.fn(),
  saved: false
}
const mockSave: {
  saveRecipe: jest.Mock
  saveRecipeLoading: boolean
  saveRecipeError: Error | undefined
} = {
  saveRecipe: jest.fn(),
  saveRecipeLoading: false,
  saveRecipeError: undefined
}
const mockUpdate: {
  updateRecipe: jest.Mock
  updateRecipeLoading: boolean
  updateRecipeError: Error | undefined
} = {
  updateRecipe: jest.fn(),
  updateRecipeLoading: false,
  updateRecipeError: undefined
}
const mockAuth = { loggedIn: true }

jest.mock('../useCustomiseForm', () => ({
  useCustomiseForm: () => mockForm
}))
jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [mockAuth, jest.fn()]
}))
jest.mock('../../../lib/apollo/graphQL/useSaveRecipe', () => ({
  useSaveRecipe: () => mockSave
}))
jest.mock('../../../lib/apollo/graphQL/updateRecipe', () => ({
  useUpdateRecipe: () => mockUpdate
}))

describe('Customise form', () => {
  beforeEach(() => {
    mockAuth.loggedIn = true
    mockForm.saved = false
    mockSave.saveRecipeLoading = false
    mockSave.saveRecipeError = undefined
    mockUpdate.updateRecipeLoading = false
    mockUpdate.updateRecipeError = undefined
  })

  it('edits ingredients and saves', () => {
    const { rerender } = render(<Customise />)
    fireEvent.change(screen.getByDisplayValue('Pie'), {
      target: { value: 'Tart' }
    })
    fireEvent.change(screen.getByDisplayValue('2'), { target: { value: '3' } })
    fireEvent.change(screen.getByDisplayValue('Salt'), {
      target: { value: 'Sugar' }
    })
    fireEvent.change(screen.getByDisplayValue('1'), { target: { value: '4' } })
    fireEvent.change(screen.getByDisplayValue('g'), { target: { value: 'kg' } })
    fireEvent.change(screen.getByDisplayValue('spice'), {
      target: { value: 'bakery' }
    })
    fireEvent.click(screen.getByText(/delete ingredient/i))
    fireEvent.click(screen.getByText(/add ingredient/i))
    fireEvent.click(screen.getByText(/clear all/i))
    fireEvent.click(screen.getByText(/undo all/i))
    fireEvent.click(screen.getByText('Save'))
    fireEvent.click(screen.getByText(/go back/i))
    expect(mockForm.onFinish).toHaveBeenCalled()
    expect(mockForm.onAddIngredient).toHaveBeenCalled()

    mockSave.saveRecipeLoading = true
    rerender(<Customise />)
    expect(screen.getByText(/saving/i)).toBeInTheDocument()

    mockSave.saveRecipeLoading = false
    mockUpdate.updateRecipeLoading = true
    rerender(<Customise />)
    expect(screen.getByText(/saving/i)).toBeInTheDocument()

    mockUpdate.updateRecipeLoading = false
    mockForm.saved = true
    rerender(<Customise />)
    expect(screen.getByText(/saved!/i)).toBeInTheDocument()

    mockForm.saved = false
    mockSave.saveRecipeError = new Error('save')
    rerender(<Customise />)
    expect(screen.getByText('Error')).toBeInTheDocument()

    mockSave.saveRecipeError = undefined
    mockUpdate.updateRecipeError = new Error('update')
    rerender(<Customise />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })
})
