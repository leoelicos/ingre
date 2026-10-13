import { renderHook, act } from '@testing-library/react'
import { useRecipeCard } from '../useRecipeCard'
import { recipe } from '../../../../test/fixtures'

const mockDispatch = jest.fn()
const mockGetRecipe = jest.fn().mockResolvedValue({ data: { getRecipe: { name: 'Test' } } })

jest.mock('@apollo/client', () => ({
  useMutation: () => [jest.fn(), { loading: false, error: null }],
  useLazyQuery: () => [mockGetRecipe, { loading: false, error: null }],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ savedRecipes: [] }, mockDispatch]
}))

describe('useRecipeCard', () => {
  const card = recipe()

  it('returns expected handlers', () => {
    const { result } = renderHook(() =>
      useRecipeCard({ onSavedPage: false, recipe: card })
    )
    expect(typeof result.current.handleEdit).toBe('function')
    expect(typeof result.current.handleSave).toBe('function')
    expect(typeof result.current.handleRemove).toBe('function')
  })

  it('handleEdit calls getRecipe', async () => {
    const { result } = renderHook(() =>
      useRecipeCard({ onSavedPage: false, recipe: card })
    )
    await act(async () => {
      await result.current.handleEdit()
    })
    expect(mockGetRecipe).toHaveBeenCalled()
  })
})
