import { renderHook, act } from '@testing-library/react'
import { useIngredients } from '../useIngredients'
import { ingredient, recipe } from '../../../test/fixtures'
import type { ClientRecipe } from '../../../types/client'

const mockDispatch = jest.fn()
const mockQuery = jest.fn()
const mockGetSavedRecipes = jest.fn()
const mockStore: {
  savedRecipes: ClientRecipe[]
  savedIngredients: unknown[]
  ingredientsDidGenerate: boolean
} = {
  savedRecipes: [],
  savedIngredients: [],
  ingredientsDidGenerate: true
}
const mockLazy: {
  loading: boolean
  error: Error | null
  data: { getSavedRecipes?: ClientRecipe[] } | null
} = { loading: false, error: null, data: null }

jest.mock('@apollo/client', () => ({
  useLazyQuery: () => [mockGetSavedRecipes, mockLazy],
  useApolloClient: () => ({ query: (...args: unknown[]) => mockQuery(...args) }),
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [mockStore, mockDispatch]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

describe('useIngredients coverage', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockQuery.mockReset()
    mockGetSavedRecipes.mockReset()
    mockGetSavedRecipes.mockResolvedValue({})
    mockStore.savedRecipes = []
    mockStore.savedIngredients = []
    mockStore.ingredientsDidGenerate = true
    mockLazy.loading = false
    mockLazy.error = null
    mockLazy.data = null
  })

  it('reloads recipes, skips ones without an id, and adds a row', async () => {
    mockStore.savedRecipes = [recipe(), recipe({ _id: undefined, name: 'Skip' })]
    mockQuery.mockResolvedValue({
      data: {
        getRecipe: {
          ingredients: [ingredient({ _id: 'a' }), ingredient({ _id: undefined, name: 'Salt' })]
        }
      }
    })
    const { result } = renderHook(() => useIngredients())
    await act(async () => {
      await result.current.reload()
    })
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'UPDATE_SAVED_INGREDIENTS' })
    )
    act(() => {
      result.current.handleAdd()
      result.current.onFinish()
    })
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'UPDATE_SAVED_INGREDIENTS' })
    )
  })

  it('logs a failed reload', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    mockStore.savedRecipes = [recipe()]
    mockQuery.mockRejectedValue(new Error('no recipe'))
    const { result } = renderHook(() => useIngredients())
    await act(async () => {
      await result.current.reload()
    })
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })

  it('generates ingredients on first load', async () => {
    mockStore.ingredientsDidGenerate = false
    mockStore.savedRecipes = [recipe()]
    mockQuery.mockResolvedValue({
      data: { getRecipe: { ingredients: [ingredient()] } }
    })
    await act(async () => {
      renderHook(() => useIngredients())
    })
    expect(mockGetSavedRecipes).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'FLAG_INGREDIENTS_GENERATED',
      data: undefined
    })
  })

  it('stores saved recipes once the lazy query resolves', () => {
    mockLazy.loading = true
    const { rerender } = renderHook(() => useIngredients())
    mockLazy.loading = false
    mockLazy.error = new Error('load')
    rerender()
    mockLazy.error = null
    mockLazy.data = {}
    rerender()
    mockLazy.data = { getSavedRecipes: [recipe({ name: 'Loaded' })] }
    rerender()
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_SAVED_RECIPES',
      data: [recipe({ name: 'Loaded' })]
    })
  })
})
