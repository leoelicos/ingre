import type { ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { CHECKOUT, GET_USER } from '../../../lib/apollo/graphQL/queries'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { useUpgrade } from '../useUpgrade'
import type { CheckoutRedirect } from '../useUpgrade'

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider
    mocks={[
      { request: { query: GET_USER }, error: new Error('offline') },
      {
        request: { query: CHECKOUT },
        result: { data: { checkout: { session: 'cs_test_2' } } }
      }
    ]}
    addTypename={false}
  >
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  </MockedProvider>
)

/** Starts checkout with this Stripe.js loader; resolves once the loader was called. */
const startCheckout = async (load: () => Promise<CheckoutRedirect | null>) => {
  const loader = jest.fn(load)
  const hook = renderHook(() => useUpgrade(loader), { wrapper })
  expect(hook.result.current.checkoutFailed).toBe(false)
  act(() => {
    hook.result.current.getCheckout()
  })
  await waitFor(() => {
    expect(loader).toHaveBeenCalledTimes(1)
  })
  return hook
}

describe('useUpgrade', () => {
  it('stays not-pro when the user query fails, and fails checkout when Stripe.js gives nothing', async () => {
    const { result } = await startCheckout(() => Promise.resolve(null))
    expect(result.current.loggedIn).toBe(false)
    await waitFor(() => {
      expect(result.current.checkoutFailed).toBe(true)
    })
    expect(result.current.pro).toBe(false)
  })

  it('fails checkout when Stripe.js does not load (404 or 500 for the script)', async () => {
    const { result } = await startCheckout(() =>
      Promise.reject(new Error('Failed to load Stripe.js'))
    )
    await waitFor(() => {
      expect(result.current.checkoutFailed).toBe(true)
    })
    expect(result.current.pro).toBe(false)
  })

  it('redirects to the new session once Stripe.js loads', async () => {
    // Stripe navigates away on success, so its promise never settles
    const redirectToCheckout = jest.fn(
      (): Promise<never> => new Promise(() => undefined)
    )
    const { result } = await startCheckout(() =>
      Promise.resolve({ redirectToCheckout })
    )
    await waitFor(() => {
      expect(redirectToCheckout).toHaveBeenCalledWith({
        sessionId: 'cs_test_2'
      })
    })
    expect(result.current.checkoutFailed).toBe(false)
  })
})
