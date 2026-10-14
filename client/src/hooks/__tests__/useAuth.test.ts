import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'

const mockDispatch = jest.fn()
const mockNavigate = jest.fn()
const mockLoginMutation = jest.fn()
const mockLocation: { state: unknown } = { state: { from: '/saved' } }
const mockLoginOptions: {
  onCompleted?: ((data: { login: { token: string } }) => void) | undefined
  onError?: ((error: Error) => void) | undefined
} = {}

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}))

jest.mock('@apollo/client', () => ({
  useMutation: (
    _mutation: unknown,
    options: {
      onCompleted?: (data: { login: { token: string } }) => void
      onError?: (error: Error) => void
    }
  ) => {
    mockLoginOptions.onCompleted = options.onCompleted
    mockLoginOptions.onError = options.onError
    return [mockLoginMutation, { loading: false, error: null }]
  },
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: false }, mockDispatch]
}))

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.state = { from: '/saved' }
    mockLoginOptions.onCompleted = undefined
    mockLoginOptions.onError = undefined
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
    expect(mockLoginMutation).toHaveBeenCalledWith({
      variables: { email: 'test@example.com', password: 'pass' }
    })
  })

  it('onCompleted dispatches LOGIN and returns to the starting page', () => {
    renderHook(() => useAuth())
    const onCompleted = mockLoginOptions.onCompleted
    if (!onCompleted) throw new Error('missing onCompleted')
    act(() => {
      onCompleted({ login: { token: 'abc123' } })
    })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGIN', data: 'abc123' })
    expect(mockNavigate).toHaveBeenCalledWith('/saved', { replace: true })
  })

  it('returns home when no starting page was stored', () => {
    mockLocation.state = null
    renderHook(() => useAuth())
    const onCompleted = mockLoginOptions.onCompleted
    if (!onCompleted) throw new Error('missing onCompleted')
    act(() => {
      onCompleted({ login: { token: 'abc123' } })
    })
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('onError logs error', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    renderHook(() => useAuth())
    const onError = mockLoginOptions.onError
    if (!onError) throw new Error('missing onError')
    act(() => {
      onError(new Error('login failed'))
    })
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
