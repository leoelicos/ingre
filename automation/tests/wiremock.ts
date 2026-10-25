import type { APIRequestContext } from '@playwright/test'
import { urls } from './env'

/* WireMock admin API: the Stripe stand-in's request journal and per-test stubs. */

export interface StripeCall {
  method: string
  path: string
  /** form fields stripe-node sent */
  form: Record<string, string>
  authorization: string
}

interface JournalEntry {
  request: {
    method: string
    url: string
    body: string
    headers: Record<string, string>
  }
}

const isJournal = (value: unknown): value is { requests: JournalEntry[] } =>
  typeof value === 'object' &&
  value !== null &&
  'requests' in value &&
  Array.isArray(value.requests)

/** Calls the server made to the Stripe API (/v1/...), oldest first. */
export const stripeCalls = async (
  request: APIRequestContext
): Promise<StripeCall[]> => {
  const response = await request.get(`${urls.wiremock}/__admin/requests`)
  const journal: unknown = await response.json()
  if (!isJournal(journal)) throw new Error('unexpected WireMock journal')
  return journal.requests
    .map(({ request: r }) => ({
      method: r.method,
      path: r.url,
      form: Object.fromEntries(new URLSearchParams(r.body)),
      authorization: r.headers['Authorization'] ?? ''
    }))
    .filter((call) => call.path.startsWith('/v1/'))
    .reverse()
}

export const clearStripeCalls = async (request: APIRequestContext) => {
  await request.delete(`${urls.wiremock}/__admin/requests`)
}

/** Adds a WireMock stub ahead of the mappings; returns a function that removes it. */
const addStub = async (
  request: APIRequestContext,
  mapping: Record<string, unknown>
): Promise<() => Promise<void>> => {
  const response = await request.post(`${urls.wiremock}/__admin/mappings`, {
    data: { priority: 1, ...mapping }
  })
  const stub: unknown = await response.json()
  const id =
    typeof stub === 'object' && stub !== null && 'id' in stub
      ? String(stub.id)
      : ''
  return async () => {
    await request.delete(`${urls.wiremock}/__admin/mappings/${id}`)
  }
}

/** Makes one Stripe endpoint fail (Stripe's error shape); returns a function that removes the stub. */
export const failStripe = (
  request: APIRequestContext,
  path: string
): Promise<() => Promise<void>> =>
  addStub(request, {
    request: { method: 'POST', urlPath: path },
    response: {
      status: 402,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.'
        }
      }
    }
  })

const STRIPE_JS_REQUEST = { method: 'GET', urlPath: '/stripe-js/v3' }

/** Stripe.js failing with this status. */
const stripeJsFailure = (status: 404 | 500) => ({
  status,
  headers: { 'Content-Type': 'text/plain' },
  body: status === 404 ? 'Not Found' : 'Internal Server Error'
})

/**
 * Serves the Stripe.js stand-in this many milliseconds late (WireMock fixed delay), so
 * checkout stays "starting" for a while; returns a function that removes the stub.
 */
export const delayStripeJs = (
  request: APIRequestContext,
  delayMs: number
): Promise<() => Promise<void>> =>
  addStub(request, {
    request: STRIPE_JS_REQUEST,
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/javascript' },
      bodyFileName: 'stripe-js-v3.js',
      transformerParameters: { redirectError: '' },
      fixedDelayMilliseconds: delayMs
    }
  })

/** Makes the Stripe.js script itself fail with this status; returns a function that removes the stub. */
export const failStripeJs = (
  request: APIRequestContext,
  status: 404 | 500
): Promise<() => Promise<void>> =>
  addStub(request, {
    request: STRIPE_JS_REQUEST,
    response: stripeJsFailure(status)
  })

/**
 * Makes only the next Stripe.js request fail with this status, after `delayMs` (a
 * WireMock scenario: the stub moves its scenario on, and then no longer matches, so the
 * default stand-in answers the retry); returns a function that removes the stub.
 */
export const failStripeJsOnce = (
  request: APIRequestContext,
  status: 404 | 500,
  delayMs = 0
): Promise<() => Promise<void>> =>
  addStub(request, {
    scenarioName: `stripe-js-fails-once-${Date.now()}`,
    requiredScenarioState: 'Started',
    newScenarioState: 'failed once',
    request: STRIPE_JS_REQUEST,
    response: { ...stripeJsFailure(status), fixedDelayMilliseconds: delayMs }
  })

/**
 * Serves the Stripe.js stand-in with redirectToCheckout resolving with a Stripe error
 * with this message (no quotes; WireMock HTML-escapes it); returns a function that
 * removes the stub.
 */
export const failRedirectToCheckout = (
  request: APIRequestContext,
  message: string
): Promise<() => Promise<void>> =>
  addStub(request, {
    request: STRIPE_JS_REQUEST,
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/javascript' },
      bodyFileName: 'stripe-js-v3.js',
      transformerParameters: { redirectError: message }
    }
  })
