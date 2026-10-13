import { renderHook, act } from '@testing-library/react'
import { useSearch } from '../useSearch'

jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ query: jest.fn().mockResolvedValue({ data: { getAppCredentials: { appId: 'id', appKey: 'key' } } }) }),
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ searchRecipes: [] }, jest.fn()]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))
jest.mock('../../../utils/api/edamam', () => jest.fn().mockResolvedValue([]))

describe('useSearch', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useSearch())
    expect(typeof result.current.searchText).toBe('string')
    expect(typeof result.current.handleFormSubmit).toBe('function')
    expect(typeof result.current.onSearchChange).toBe('function')
  })

  it('onSearchChange updates searchText', () => {
    const { result } = renderHook(() => useSearch())
    act(() => {
      result.current.onSearchChange({ target: { value: 'pasta' } })
    })
    expect(result.current.searchText).toBe('pasta')
  })
})
