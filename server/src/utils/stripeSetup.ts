/* #312: the body of scripts/stripe-setup.ts, kept here so it is unit-tested. */
import Stripe from 'stripe'
import { BillingApi } from '../datasources/billing'
import { requireTestKey } from '../datasources/stripe'

/** A stripe-node client for api.stripe.com with this (test-mode) key. */
export const makeStripe = (key: string): Stripe =>
  new Stripe(key, { apiVersion: '2020-08-27' })

export const setupStripe = async (
  env: Readonly<Record<string, string | undefined>>,
  log: (line: string) => void,
  make: (key: string) => Stripe = makeStripe
): Promise<number> => {
  const key = env['STRIPE_SECRET_KEY']
  if (!key) {
    log('Set STRIPE_SECRET_KEY to a test-mode secret key (sk_test_...) first.')
    return 1
  }
  const results = await new BillingApi(make(requireTestKey(key)), env).setUp()
  results.forEach(({ tier, productId, priceId, created }) =>
    log(`${created ? 'created' : 'exists '} ${tier}: ${productId} ${priceId}`)
  )
  log('Optional: pin these in the server env:')
  results.forEach(({ tier, priceId }) => log(`STRIPE_PRICE_${tier}=${priceId}`))
  return 0
}
