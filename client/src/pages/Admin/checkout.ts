import { loadStripe } from '@stripe/stripe-js/pure'
import type { Stripe } from '@stripe/stripe-js'
import type { Checkout } from '../../lib/apollo/graphQL/typedefs'

const STRIPE_KEY = 'pk_test_TYooMQauvdEDq54NiTphI7jx'

/** The part of Stripe.js the upgrade uses. */
export type CheckoutRedirect = Pick<Stripe, 'redirectToCheckout'>

/** Gives Stripe.js (or null when the page has none). */
export type LoadCheckout = () => Promise<CheckoutRedirect | null>

/** Gives the new checkout session's id (or null when there is none). */
export type FetchSession = () => Promise<string | null>

/** The step that stopped checkout from opening. */
export type CheckoutFailure = 'session' | 'stripe-js' | 'redirect'

/**
 * Loads Stripe.js when checkout starts, not when the module is imported (the /pure entry
 * injects the script on the first call, where the main entry injects it on import).
 * A failed load is not cached: the loader forgets the failed promise and swaps the failed
 * script tag for a new one, so the next press retries in place, with no page reload.
 */
export const loadCheckout: LoadCheckout = () => loadStripe(STRIPE_KEY)

/** The session id in a CHECKOUT result; null when the query gave no data. */
export const sessionFrom = ({
  data
}: {
  data?: { checkout: Checkout } | undefined
}): string | null => data?.checkout.session ?? null

/** The promise's value, or null when it rejects. */
const settle = <T>(promise: Promise<T>): Promise<T | null> =>
  promise.catch(() => null)

/**
 * Creates a session, loads Stripe.js and opens Stripe's hosted checkout. Stripe navigates
 * away when checkout opens, so this only settles when it did not, with the step that failed.
 * redirectToCheckout resolves only with an error, so reaching the end means it failed; a
 * rejection is a failed redirect too, so this never rejects.
 */
export const runCheckout = async (
  fetchSession: FetchSession,
  load: LoadCheckout
): Promise<CheckoutFailure> => {
  const sessionId = await settle(fetchSession())
  if (sessionId === null) return 'session'
  const stripe = await settle(load())
  if (stripe === null) return 'stripe-js'
  await settle(stripe.redirectToCheckout({ sessionId }))
  return 'redirect'
}

/** Starts a checkout attempt, or joins the one already in flight. */
export type StartOnce = (
  start: () => Promise<CheckoutFailure>
) => Promise<CheckoutFailure>

/** One checkout attempt at a time, and a way to stop waiting for the one in flight. */
export interface OneAtATime {
  run: StartOnce
  /** Forgets the attempt in flight (it never settles once Stripe has navigated away). */
  forget: () => null
}

/**
 * Runs one checkout attempt at a time: a press while one is in flight (a double press, or
 * a press during a retry) gets that attempt's promise and starts nothing new. Once the
 * attempt settles, or is forgotten, the next press starts over.
 */
export const oneAtATime = (): OneAtATime => {
  let pending: Promise<CheckoutFailure> | null = null
  const forget = (): null => (pending = null)
  /** Forgets this attempt when it settles, unless a newer one has replaced it. */
  const settled =
    (attempt: () => Promise<CheckoutFailure> | null) => (): null =>
      attempt() === pending ? forget() : null
  const run: StartOnce = (start) => {
    if (pending !== null) return pending
    const attempt = start().finally(settled(() => attempt))
    pending = attempt
    return attempt
  }
  return { run, forget }
}
