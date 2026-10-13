import { renderHook } from '@testing-library/react'
import { useIngredients } from '../useIngredients'

jest.mock('@apollo/client', () => ({
  useLazyQuery: () => [jest.fn(), { loading: false, error: null, data: null }],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ savedRecipes: [] }, jest.fn()]
}))

describe('useIngredients', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useIngredients())
    expect(result.current).toBeDefined()
  })
})
