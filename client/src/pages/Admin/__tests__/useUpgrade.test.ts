import { renderHook } from '@testing-library/react'
import { useUpgrade } from '../useUpgrade'

jest.mock('@apollo/client', () => ({
  useLazyQuery: () => [jest.fn(), { loading: false, data: null }],
  useQuery: () => ({ loading: false, data: null, error: null }),
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: true, profile: { data: { pro: false } } }, jest.fn()]
}))

describe('useUpgrade', () => {
  it('returns pro and loggedIn state', () => {
    const { result } = renderHook(() => useUpgrade())
    expect(result.current.loggedIn).toBe(true)
    expect(result.current.pro).toBe(false)
    expect(typeof result.current.getCheckout).toBe('function')
  })
})
