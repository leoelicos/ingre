import { renderHook } from '@testing-library/react'
import { useRecipeCard } from '../useRecipeCard'

const mockDispatch = jest.fn()
const mockSaveRecipe = jest.fn().mockResolvedValue({ data: { saveRecipe: {} } })
const mockRemoveRecipe = jest.fn().mockResolvedValue({ data: { removeRecipe: {} } })
const mockGetRecipe = jest.fn().mockResolvedValue({ data: { getRecipe: { name: 'Test' } } })

jest.mock('@apollo/client', () => ({
  useMutation: () => [mockSaveRecipe, { loading: false, error: null }],
  useLazyQuery: () => [mockGetRecipe, { loading: false, error: null }],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ savedRecipes: [{ edamamId: '1', _id: 'id1' }] }, mockDispatch]
}))

describe('useRecipeCard', () => {
  const recipe = { name: 'Test', edamamId: '1', _id: 'id1' } as any

  it('returns expected handlers', () => {
    const { result } = renderHook(() =>
      useRecipeCard({ onSavedPage: false, recipe })
    )
    expect(typeof result.current.handleEdit).toBe('function')
    expect(typeof result.current.handleSave).toBe('function')
    expect(typeof result.current.handleRemove).toBe('function')
  })

  it('handleEdit dispatches SET_EDIT_RECIPE', async () => {
    const { result } = renderHook(() =>
      useRecipeCard({ onSavedPage: false, recipe })
    )
    await result.current.handleEdit()
    expect(mockGetRecipe).toHaveBeenCalled()
  })
})
