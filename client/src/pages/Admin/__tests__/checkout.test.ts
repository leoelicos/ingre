import type { StripeError } from '@stripe/stripe-js'
import { runCheckout, sessionFrom } from '../checkout'
import type { CheckoutRedirect } from '../checkout'

const STRIPE_ERROR: StripeError = {
  type: 'invalid_request_error',
  message: 'No such checkout.session: cs_test_1'
}

const session = () => Promise.resolve('cs_test_1')

/** Stripe.js whose redirectToCheckout reports this error. */
const stripeWithError = (): CheckoutRedirect => ({
  redirectToCheckout: jest.fn(() => Promise.resolve({ error: STRIPE_ERROR }))
})

describe('sessionFrom', () => {
  it('gives the session id from a CHECKOUT result', () => {
    expect(sessionFrom({ data: { checkout: { session: 'cs_test_1' } } })).toBe(
      'cs_test_1'
    )
  })

  it('gives null when the query gave no data', () => {
    expect(sessionFrom({ data: undefined })).toBeNull()
    expect(sessionFrom({})).toBeNull()
  })
})

describe('runCheckout', () => {
  it('stops at the session when there is none, before loading Stripe.js', async () => {
    const load = jest.fn(() => Promise.resolve(stripeWithError()))
    await expect(runCheckout(() => Promise.resolve(null), load)).resolves.toBe(
      'session'
    )
    await expect(
      runCheckout(() => Promise.reject(new Error('offline')), load)
    ).resolves.toBe('session')
    expect(load).not.toHaveBeenCalled()
  })

  it('stops at Stripe.js when it does not load or gives nothing', async () => {
    await expect(
      runCheckout(session, () =>
        Promise.reject(new Error('Failed to load Stripe.js'))
      )
    ).resolves.toBe('stripe-js')
    await expect(
      runCheckout(session, () => Promise.resolve(null))
    ).resolves.toBe('stripe-js')
  })

  it('stops at the redirect when redirectToCheckout resolves with an error', async () => {
    const stripe = stripeWithError()
    await expect(
      runCheckout(session, () => Promise.resolve(stripe))
    ).resolves.toBe('redirect')
    expect(stripe.redirectToCheckout).toHaveBeenCalledWith({
      sessionId: 'cs_test_1'
    })
  })
})
