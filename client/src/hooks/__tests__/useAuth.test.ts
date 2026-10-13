import { renderHook } from '@testing-library/react'
import { useAuth } from '../useAuth'

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}))

jest.mock('@apollo/client', () => ({
  useMutation: () => [jest.fn(), { loading: false, error: null }],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: false }, jest.fn()]
}))

describe('useAuth', () => {
  it('returns login and logout functions', () => {
    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.handleLogout).toBe('function')
  })
})
