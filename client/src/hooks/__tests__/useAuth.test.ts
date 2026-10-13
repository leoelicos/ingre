import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'

const mockDispatch = jest.fn()
const mockNavigate = jest.fn()
const mockLoginMutation = jest.fn()

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}))

jest.mock('@apollo/client', () => ({
  useMutation: () => [mockLoginMutation, { loading: false, error: null }],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: false }, mockDispatch]
}))

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns login and logout functions', () => {
    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.handleLogout).toBe('function')
  })

  it('handleLogout dispatches LOGOUT', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      result.current.handleLogout()
    })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGOUT', data: '' })
  })

  it('login calls mutation', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      result.current.login({ email: 'test@example.com', password: 'pass' })
    })
    expect(mockLoginMutation).toHaveBeenCalled()
  })
})
