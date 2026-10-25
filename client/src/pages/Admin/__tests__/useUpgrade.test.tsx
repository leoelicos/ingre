import type { ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import type { MockedResponse } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import type { StripeError } from '@stripe/stripe-js'
import { CHECKOUT, GET_USER } from '../../../lib/apollo/graphQL/queries'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { useUpgrade } from '../useUpgrade'
import type { CheckoutRedirect, LoadCheckout } from '../checkout'

const checkoutSession = (session: string): MockedResponse => ({
  request: { query: CHECKOUT },
  result: { data: { checkout: { session } } }
})

/** The user query fails (so not pro), then one CHECKOUT result per press. */
const wrapperFor =
  (sessions: string[]) =>
  ({ children }: { children: ReactNode }) =>
    (
      <MockedProvider
        mocks={[
          { request: { query: GET_USER }, error: new Error('offline') },
          ...sessions.map(checkoutSession)
        ]}
        addTypename={false}
      >
        <MemoryRouter>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )

/** Stripe navigates away on success, so its promise never settles. */
const navigatingStripe = (): CheckoutRedirect => ({
  redirectToCheckout: jest.fn((): Promise<never> => new Promise(() => null))
})

const STRIPE_ERROR: StripeError = {
  type: 'invalid_request_error',
  message: 'No such checkout.session: cs_test_2'
}

const failedLoad = () => Promise.reject(new Error('Failed to load Stripe.js'))

/** Renders the hook with this Stripe.js loader and one session per expected press. */
const renderUpgrade = (load: LoadCheckout, sessions = ['cs_test_2']) => {
  const loader = jest.fn(load)
  const hook = renderHook(() => useUpgrade(loader), {
    wrapper: wrapperFor(sessions)
  })
  expect(hook.result.current.checkoutFailed).toBe(false)
  return { ...hook, loader }
}

/** Presses Upgrade once and waits until checkout reports it did not open. */
const pressAndFail = async (result: {
  current: ReturnType<typeof useUpgrade>
}) => {
  await act(async () => {
    await result.current.startCheckout()
  })
  expect(result.current.checkoutFailed).toBe(true)
  expect(result.current.pro).toBe(false)
}

describe('useUpgrade', () => {
  it('stays not-pro when the user query fails, and fails checkout when Stripe.js gives nothing', async () => {
    const { result } = renderUpgrade(() => Promise.resolve(null))
    expect(result.current.loggedIn).toBe(false)
    await pressAndFail(result)
  })

  it('fails checkout when Stripe.js does not load (404 or 500 for the script)', async () => {
    const { result } = renderUpgrade(failedLoad)
    await pressAndFail(result)
  })

  it('fails checkout when there is no session', async () => {
    const { result, loader } = renderUpgrade(failedLoad, [])
    await pressAndFail(result)
    expect(loader).not.toHaveBeenCalled()
  })

  it('redirects to the new session once Stripe.js loads', async () => {
    const stripe = navigatingStripe()
    const { result } = renderUpgrade(() => Promise.resolve(stripe))
    act(() => {
      void result.current.startCheckout()
    })
    await waitFor(() => {
      expect(stripe.redirectToCheckout).toHaveBeenCalledWith({
        sessionId: 'cs_test_2'
      })
    })
    expect(result.current.checkoutFailed).toBe(false)
  })

  it('retries the load on the next press after a failed load, and redirects when it succeeds', async () => {
    const stripe = navigatingStripe()
    const { result, loader } = renderUpgrade(failedLoad, [
      'cs_test_2',
      'cs_test_3'
    ])
    await pressAndFail(result)
    expect(stripe.redirectToCheckout).not.toHaveBeenCalled()

    loader.mockImplementation(() => Promise.resolve(stripe))
    act(() => {
      void result.current.startCheckout()
    })
    // the alert goes while the retry runs
    expect(result.current.checkoutFailed).toBe(false)
    await waitFor(() => {
      expect(stripe.redirectToCheckout).toHaveBeenCalledWith({
        sessionId: 'cs_test_3'
      })
    })
    expect(loader).toHaveBeenCalledTimes(2)
    expect(result.current.checkoutFailed).toBe(false)
  })

  it('fails checkout when redirectToCheckout resolves with an error', async () => {
    const redirectToCheckout = jest.fn(() =>
      Promise.resolve({ error: STRIPE_ERROR })
    )
    const { result } = renderUpgrade(() =>
      Promise.resolve({ redirectToCheckout })
    )
    await pressAndFail(result)
    expect(redirectToCheckout).toHaveBeenCalledWith({ sessionId: 'cs_test_2' })
  })
})
