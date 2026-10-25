import type { StripeError } from '@stripe/stripe-js'
import { oneAtATime, runCheckout, sessionFrom } from '../checkout'
import type { CheckoutFailure, CheckoutRedirect } from '../checkout'

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

  it('stops at the redirect when redirectToCheckout rejects, so it never rejects', async () => {
    const redirectToCheckout = jest.fn(() =>
      Promise.reject(new Error('network down'))
    )
    await expect(
      runCheckout(session, () => Promise.resolve({ redirectToCheckout }))
    ).resolves.toBe('redirect')
  })
})

/** A promise and the function that settles it, for an attempt still in flight. */
const inFlight = () => {
  const settlers: ((step: CheckoutFailure) => void)[] = []
  const promise = new Promise<CheckoutFailure>((resolve) => {
    settlers.push(resolve)
  })
  const settle = (step: CheckoutFailure): number => {
    settlers.forEach((resolve) => resolve(step))
    return settlers.length
  }
  return { promise, settle }
}

describe('oneAtATime', () => {
  it('joins the attempt in flight instead of starting a second one', async () => {
    const one = oneAtATime().run
    const first = inFlight()
    const start = jest.fn(() => first.promise)
    const press = one(start)
    expect(one(start)).toBe(press)
    expect(one(start)).toBe(press)
    expect(start).toHaveBeenCalledTimes(1)
    first.settle('stripe-js')
    await expect(press).resolves.toBe('stripe-js')
  })

  it('starts a new attempt once the last one has settled', async () => {
    const one = oneAtATime().run
    const start = jest.fn(() => Promise.resolve<CheckoutFailure>('session'))
    await expect(one(start)).resolves.toBe('session')
    await expect(one(start)).resolves.toBe('session')
    expect(start).toHaveBeenCalledTimes(2)
  })

  it('starts a new attempt after one rejects', async () => {
    const one = oneAtATime().run
    const start = jest.fn(() => Promise.reject(new Error('boom')))
    await expect(one(start)).rejects.toThrow('boom')
    await expect(one(start)).rejects.toThrow('boom')
    expect(start).toHaveBeenCalledTimes(2)
  })

  it('starts a new attempt once the one in flight is forgotten, and the old one settling later does not free the new one', async () => {
    const { run, forget } = oneAtATime()
    const old = inFlight()
    const newer = inFlight()
    const oldPress = run(() => old.promise)
    expect(forget()).toBeNull()
    const newPress = run(() => newer.promise)
    expect(newPress).not.toBe(oldPress)

    old.settle('redirect')
    await expect(oldPress).resolves.toBe('redirect')
    // the newer attempt is still the one in flight
    const start = jest.fn(() => Promise.resolve<CheckoutFailure>('session'))
    expect(run(start)).toBe(newPress)
    expect(start).not.toHaveBeenCalled()
    newer.settle('stripe-js')
    await expect(newPress).resolves.toBe('stripe-js')
  })
})
