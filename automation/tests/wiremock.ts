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

/** Makes the Stripe.js script itself fail with this status; returns a function that removes the stub. */
export const failStripeJs = (
  request: APIRequestContext,
  status: 404 | 500
): Promise<() => Promise<void>> =>
  addStub(request, {
    request: { method: 'GET', urlPath: '/stripe-js/v3' },
    response: {
      status,
      headers: { 'Content-Type': 'text/plain' },
      body: status === 404 ? 'Not Found' : 'Internal Server Error'
    }
  })
