import { renderHook } from '@testing-library/react'
import { useIngredients } from '../useIngredients'

jest.mock('@apollo/client', () => ({
  useLazyQuery: () => [jest.fn(), { loading: false, error: null, data: null }],
  useApolloClient: () => ({ query: jest.fn() }),
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ savedRecipes: [{ name: 'Pasta', ingredients: [] }] }, jest.fn()]
}))

describe('useIngredients', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useIngredients())
    expect(result.current).toBeDefined()
    expect(result.current.savedRecipeLoading).toBe(false)
  })
})
