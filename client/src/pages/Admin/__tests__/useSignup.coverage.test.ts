import { renderHook, act } from '@testing-library/react'
import { useSignup } from '../useSignup'

const mockNavigate = jest.fn()
const mockDispatch = jest.fn()
const mockCheck = jest.fn()
const mockAddUser = jest.fn()

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}))

jest.mock('@apollo/client', () => ({
  useMutation: () => [mockAddUser, { error: undefined }],
  useLazyQuery: () => [
    mockCheck,
    { loading: false, data: null, error: undefined }
  ],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: true }, mockDispatch]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

describe('useSignup coverage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockDispatch.mockClear()
    mockCheck.mockReset()
    mockAddUser.mockReset()
    mockCheck.mockResolvedValue({ data: { checkEmailAlreadyExists: false } })
    mockAddUser.mockResolvedValue({ data: { addUser: { token: 'tok' } } })
  })

  it('updates each field and logs the user in', async () => {
    const { result } = renderHook(() => useSignup())
    act(() => {
      result.current.onFirstNameChange({ target: { value: 'Ada' } })
      result.current.onLastNameChange({ target: { value: 'Lovelace' } })
      result.current.onEmailChange({ target: { value: 'ada@b.c' } })
      result.current.onPasswordChange({ target: { value: 'secret' } })
    })
    await act(async () => {
      await result.current.handleFormSubmit({ preventDefault: () => undefined })
    })
    expect(mockCheck).toHaveBeenCalledWith({ variables: { email: 'ada@b.c' } })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGIN', data: 'tok' })
    expect(mockNavigate).toHaveBeenCalledWith(-1)
    expect(result.current.loggedIn).toBe(true)
  })

  it('logs a failed signup', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mockAddUser.mockRejectedValue(new Error('exists'))
    const { result } = renderHook(() => useSignup())
    await act(async () => {
      await result.current.handleFormSubmit({ preventDefault: () => undefined })
    })
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })

  it('does not log in when the mutation returns no data', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mockAddUser.mockResolvedValue({ data: null })
    const { result } = renderHook(() => useSignup())
    await act(async () => {
      await result.current.handleFormSubmit({ preventDefault: () => undefined })
    })
    expect(mockDispatch).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalledWith(new Error('Sign up returned no data'))
    error.mockRestore()
  })
})
