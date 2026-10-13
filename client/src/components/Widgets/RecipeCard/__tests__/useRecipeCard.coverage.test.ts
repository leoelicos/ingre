import { renderHook, act } from '@testing-library/react'
import { useRecipeCard } from '../useRecipeCard'
import { ingredient, recipe } from '../../../../test/fixtures'
import type { ClientRecipe } from '../../../../types/client'

const mockSaveRecipe = jest.fn()
const mockRemoveRecipe = jest.fn()
const mockGetRecipe = jest.fn()
const mockUseMutation = jest.fn()
const mockUseLazyQuery = jest.fn()
const mockDispatch = jest.fn()
const mockSaved: { savedRecipes: ClientRecipe[] } = { savedRecipes: [] }
const mockFlags: {
  saveError: Error | undefined
  removeError: Error | undefined
  getError: Error | undefined
  getLoading: boolean
} = {
  saveError: undefined,
  removeError: undefined,
  getError: undefined,
  getLoading: false
}

jest.mock('@apollo/client', () => ({
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useLazyQuery: (...args: unknown[]) => mockUseLazyQuery(...args),
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [mockSaved, mockDispatch]
}))

describe('useRecipeCard coverage', () => {
  beforeEach(() => {
    mockSaveRecipe.mockReset()
    mockRemoveRecipe.mockReset()
    mockGetRecipe.mockReset()
    mockDispatch.mockClear()
    mockUseMutation.mockReset()
    mockUseLazyQuery.mockReset()
    mockSaved.savedRecipes = []
    mockFlags.saveError = undefined
    mockFlags.removeError = undefined
    mockFlags.getError = undefined
    mockFlags.getLoading = false
    mockUseMutation.mockImplementation(() => {
      const index = mockUseMutation.mock.calls.length
      if (index % 2 === 1) {
        return [mockSaveRecipe, { loading: false, error: mockFlags.saveError }]
      }
      return [mockRemoveRecipe, { error: mockFlags.removeError }]
    })
    mockUseLazyQuery.mockImplementation(() => [
      mockGetRecipe,
      { loading: mockFlags.getLoading, error: mockFlags.getError }
    ])
    mockSaveRecipe.mockResolvedValue({ data: { saveRecipe: recipe() } })
    mockRemoveRecipe.mockResolvedValue({ data: {} })
    mockGetRecipe.mockResolvedValue({
      data: { getRecipe: recipe({ name: 'Server' }) }
    })
  })

  it('logs mutation errors', () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mockFlags.saveError = new Error('save')
    mockFlags.removeError = new Error('remove')
    renderHook(() => useRecipeCard({ onSavedPage: false, recipe: recipe() }))
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })

  it('edits a saved recipe and ignores edit failures', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const { result } = renderHook(() =>
      useRecipeCard({ onSavedPage: false, recipe: recipe({ _id: undefined }) })
    )
    await act(async () => {
      await result.current.handleEdit()
    })
    expect(mockGetRecipe).not.toHaveBeenCalled()

    const loaded = renderHook(() =>
      useRecipeCard({ onSavedPage: true, recipe: recipe() })
    )
    await act(async () => {
      await loaded.result.current.handleEdit()
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_EDIT_RECIPE',
      data: recipe({ name: 'Server' })
    })

    mockGetRecipe.mockResolvedValueOnce(undefined)
    await act(async () => {
      await loaded.result.current.handleEdit()
    })
    mockGetRecipe.mockRejectedValueOnce(new Error('edit failed'))
    await act(async () => {
      await loaded.result.current.handleEdit()
    })
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })

  it('saves with defaults and with the provided recipe', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const empty = renderHook(() =>
      useRecipeCard({
        onSavedPage: false,
        recipe: recipe({
          name: '',
          portions: 0,
          picture_url: '',
          edamamId: undefined,
          instructions: undefined,
          ingredients: [
            ingredient({ name: '', quantity: 0, measure: '', category: '' })
          ]
        })
      })
    )
    await act(async () => {
      await empty.result.current.handleSave()
    })
    expect(mockSaveRecipe).toHaveBeenCalledWith({
      variables: {
        input: expect.objectContaining({
          name: 'Untitled Recipe',
          portions: 1,
          edamamId: undefined,
          instructions: undefined
        })
      }
    })

    const blankInstructions = renderHook(() =>
      useRecipeCard({
        onSavedPage: false,
        recipe: recipe({ instructions: '', edamamId: '' })
      })
    )
    await act(async () => {
      await blankInstructions.result.current.handleSave()
    })

    const full = renderHook(() =>
      useRecipeCard({ onSavedPage: false, recipe: recipe() })
    )
    await act(async () => {
      await full.result.current.handleSave()
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_SAVED_RECIPE',
      data: recipe()
    })

    mockSaveRecipe.mockResolvedValueOnce(undefined)
    await act(async () => {
      await full.result.current.handleSave()
    })
    mockSaveRecipe.mockRejectedValueOnce(new Error('save failed'))
    await act(async () => {
      await full.result.current.handleSave()
    })
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })

  it('removes a recipe from the saved page or by edamam id', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mockSaved.savedRecipes = [recipe({ _id: 'saved-id', edamamId: 'ed1' })]
    const saved = renderHook(() =>
      useRecipeCard({ onSavedPage: true, recipe: recipe() })
    )
    await act(async () => {
      await saved.result.current.handleRemove()
    })
    expect(mockRemoveRecipe).toHaveBeenCalledWith({
      variables: { recipeId: 'id1' }
    })

    const searched = renderHook(() =>
      useRecipeCard({ onSavedPage: false, recipe: recipe() })
    )
    await act(async () => {
      await searched.result.current.handleRemove()
    })
    expect(mockRemoveRecipe).toHaveBeenCalledWith({
      variables: { recipeId: 'saved-id' }
    })

    mockSaved.savedRecipes = []
    await act(async () => {
      await searched.result.current.handleRemove()
    })

    mockRemoveRecipe.mockResolvedValueOnce(undefined)
    await act(async () => {
      await searched.result.current.handleRemove()
    })
    mockRemoveRecipe.mockRejectedValueOnce(new Error('remove failed'))
    await act(async () => {
      await searched.result.current.handleRemove()
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_SAVED_RECIPE',
      data: 'ed1'
    })
    expect(error).toHaveBeenCalledWith(Error)
    error.mockRestore()
  })
})
