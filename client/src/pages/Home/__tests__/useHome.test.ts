import { renderHook } from '@testing-library/react'
import { useHome } from '../useHome'

jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ query: jest.fn() }),
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: true, profile: { data: { firstName: 'Test' } } }, jest.fn()]
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ homeRecipes: [], homeDidMount: false }, jest.fn()]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))
jest.mock('../../../utils/api/edamam', () => jest.fn())

describe('useHome', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useHome())
    expect(result.current.loggedIn).toBe(true)
    expect(result.current.firstName).toBe('Test')
    expect(typeof result.current.handleRefresh).toBe('function')
  })
})
