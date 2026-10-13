jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}))
import { useSignup } from '../useSignup'

jest.mock('@apollo/client', () => ({
  useMutation: () => [jest.fn(), { loading: false, error: null }],
  useLazyQuery: () => [jest.fn(), { loading: false, data: null }],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: false }, jest.fn()]
}))

describe('useSignup', () => {
  it('returns form handlers', () => {
    const { result } = renderHook(() => useSignup())
    expect(typeof result.current.handleFormSubmit).toBe('function')
    expect(typeof result.current.onFirstNameChange).toBe('function')
    expect(typeof result.current.onEmailChange).toBe('function')
  })
})
