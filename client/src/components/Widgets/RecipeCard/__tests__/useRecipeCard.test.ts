import { renderHook } from '@testing-library/react'
import { useRecipeCard } from '../useRecipeCard'

jest.mock('@apollo/client', () => ({
  useMutation: () => [jest.fn(), { loading: false, error: null }],
  useLazyQuery: () => [jest.fn(), { loading: false, error: null }],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ savedRecipes: [] }, jest.fn()]
}))

describe('useRecipeCard', () => {
  it('returns expected handlers', () => {
    const { result } = renderHook(() =>
      useRecipeCard({ onSavedPage: false, recipe: { name: 'Test', edamamId: '1' } as any })
    )
    expect(typeof result.current.handleEdit).toBe('function')
    expect(typeof result.current.handleSave).toBe('function')
    expect(typeof result.current.handleRemove).toBe('function')
  })
})
