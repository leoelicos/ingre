import { renderHook } from '@testing-library/react'
import { useUpgrade } from '../useUpgrade'

const mockGetCheckout = jest.fn()
const mockRedirect = jest.fn()
const mockStripeBox: {
  current: { redirectToCheckout: typeof mockRedirect } | null
} = {
  current: { redirectToCheckout: mockRedirect }
}
const mockCheckout: { data: { checkout: { session: string } } | null } = {
  data: null
}
const mockUser: {
  loading: boolean
  error: Error | null
  data: { getUser: { pro: boolean } } | null
} = { loading: true, error: null, data: null }

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: () => ({
    then: (
      onFulfilled: (
        stripe: { redirectToCheckout: typeof mockRedirect } | null
      ) => void
    ) => {
      onFulfilled(mockStripeBox.current)
      return Promise.resolve()
    }
  })
}))

jest.mock('@apollo/client', () => ({
  useLazyQuery: () => [mockGetCheckout, mockCheckout],
  useQuery: () => mockUser,
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: false }, jest.fn()]
}))

describe('useUpgrade coverage', () => {
  beforeEach(() => {
    mockRedirect.mockClear()
    mockStripeBox.current = { redirectToCheckout: mockRedirect }
    mockCheckout.data = null
    mockUser.loading = true
    mockUser.error = null
    mockUser.data = null
  })

  it('redirects to stripe when checkout data arrives', () => {
    mockCheckout.data = { checkout: { session: 'sess_1' } }
    renderHook(() => useUpgrade())
    expect(mockRedirect).toHaveBeenCalledWith({ sessionId: 'sess_1' })
  })

  it('logs when stripe does not load', () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mockStripeBox.current = null
    mockCheckout.data = { checkout: { session: 'sess_1' } }
    renderHook(() => useUpgrade())
    expect(mockRedirect).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalledWith('Error: No response from Stripe')
    error.mockRestore()
  })

  it('sets pro from the user query once it settles', () => {
    mockUser.loading = true
    const { result, rerender } = renderHook(() => useUpgrade())
    expect(result.current.pro).toBe(false)
    mockUser.loading = false
    mockUser.error = new Error('user')
    rerender()
    mockUser.error = null
    mockUser.data = { getUser: { pro: true } }
    rerender()
    expect(result.current.pro).toBe(true)
    expect(result.current.loggedIn).toBe(false)
  })
})
