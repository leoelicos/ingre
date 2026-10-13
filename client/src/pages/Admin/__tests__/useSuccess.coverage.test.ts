import { render, renderHook, act } from '@testing-library/react'
import { useSuccess } from '../useSuccess'

const mockNavigate = jest.fn()
const mockMakeUserPro = jest.fn()

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams('session_id=abc')]
}))

jest.mock('@apollo/client', () => ({
  useMutation: () => [mockMakeUserPro, { loading: false }],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: true }, jest.fn()]
}))

describe('useSuccess coverage', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockNavigate.mockClear()
    mockMakeUserPro.mockReset()
    mockMakeUserPro.mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('saves the order and redirects', async () => {
    const { result } = renderHook(() => useSuccess())
    await act(async () => {
      await Promise.resolve()
    })
    act(() => {
      jest.runAllTimers()
    })
    expect(mockMakeUserPro).toHaveBeenCalledWith()
    expect(mockNavigate).toHaveBeenCalledWith('/upgrade')
    render(result.current.Token())
  })

  it('logs a failed upgrade', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mockMakeUserPro.mockRejectedValue(new Error('stripe'))
    renderHook(() => useSuccess())
    await act(async () => {
      await Promise.resolve()
    })
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })
})
