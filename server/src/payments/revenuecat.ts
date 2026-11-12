/*
 * RevenueCat: its webhooks bring App Store, Google Play (and other store) purchases,
 * normalised here into the same shape as Paddle's; and new Paddle subscriptions are posted
 * to RevenueCat's REST API (v1 /receipts, X-Platform: paddle) so RevenueCat's customer
 * record (and the web SDK's entitlements) match what the server granted.
 */
import { z } from 'zod'
import {
  ENTITLEMENT_SOURCES,
  firstUserId,
  highestTier,
  ignored,
  intervalOfProduct,
  looseTier,
  tierOfProduct,
  type EntitlementSource,
  type EntitlementStatus,
  type Normalised
} from './entitlement'
import type { Env } from './keyGuard'

/** Milliseconds as a number or a numeric string (RevenueCat sends numbers; proxies stringify). */
const millis = z
  .union([z.number(), z.string().regex(/^\d+$/)])
  .nullish()
  .transform((value) =>
    value === null || value === undefined ? null : new Date(Number(value))
  )

const eventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  app_user_id: z.string().nullish(),
  original_app_user_id: z.string().nullish(),
  aliases: z.array(z.string()).nullish(),
  product_id: z.string().nullish(),
  entitlement_ids: z.array(z.string()).nullish(),
  entitlement_id: z.string().nullish(),
  period_type: z.string().nullish(),
  expiration_at_ms: millis,
  event_timestamp_ms: millis,
  purchased_at_ms: millis,
  store: z.string().nullish(),
  environment: z.string().nullish(),
  original_transaction_id: z.string().nullish(),
  transaction_id: z.string().nullish(),
  cancel_reason: z.string().nullish()
})

const bodySchema = z.object({ event: eventSchema })

/** Events that grant access for the current period. */
const GRANTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'NON_RENEWING_PURCHASE',
  'SUBSCRIPTION_EXTENDED',
  'TEMPORARY_ENTITLEMENT_GRANT'
])
const HANDLED = new Set([
  ...GRANTS,
  'CANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE'
])

/** RevenueCat's store names, folded into ours. */
const sourceOf = (store: string | null | undefined): EntitlementSource => {
  if (store === 'MAC_APP_STORE') return 'APP_STORE'
  return ENTITLEMENT_SOURCES.find((source) => source === store) ?? 'OTHER'
}

type Event = z.infer<typeof eventSchema>

const statusOf = (event: Event, now: Date): EntitlementStatus => {
  const paidUp = event.expiration_at_ms === null || event.expiration_at_ms > now
  if (event.type === 'EXPIRATION') return 'canceled'
  // a refund through support ends access now; a cancelled renewal keeps the paid period
  if (event.type === 'CANCELLATION')
    return event.cancel_reason === 'CUSTOMER_SUPPORT' || !paidUp
      ? 'canceled'
      : 'active'
  // in a grace period the store keeps access until expiration_at_ms
  if (event.type === 'BILLING_ISSUE') return paidUp ? 'active' : 'past_due'
  return event.period_type === 'TRIAL' ? 'trialing' : 'active'
}

/** One RevenueCat webhook body, normalised. */
export const normaliseRevenueCatEvent = (
  payload: unknown,
  { now = new Date(), testing = false }: { now?: Date; testing?: boolean } = {}
): Normalised => {
  const body = bodySchema.safeParse(payload)
  if (!body.success)
    return { kind: 'invalid', reason: 'not a RevenueCat webhook' }
  const event = body.data.event
  const eventId = `revenuecat:${event.id}`
  if (!HANDLED.has(event.type))
    return ignored(eventId, `${event.type} does not change an entitlement`)
  // Paddle's own (signed) webhooks are the source of truth for Paddle purchases
  if (event.store === 'PADDLE')
    return ignored(eventId, 'Paddle purchases come from the Paddle webhook')
  const environment = event.environment === 'SANDBOX' ? 'sandbox' : 'production'
  if (testing && environment === 'production')
    return ignored(eventId, 'a production purchase sent to a test server')
  const entitlementIds = [
    ...(event.entitlement_ids ?? []),
    ...(event.entitlement_id ? [event.entitlement_id] : [])
  ]
  const tier =
    highestTier(entitlementIds.map(looseTier)) ??
    tierOfProduct(event.product_id)
  return {
    kind: 'entitlement',
    syncRevenueCat: false,
    state: {
      eventId,
      source: sourceOf(event.store),
      userId: firstUserId([
        event.app_user_id,
        event.original_app_user_id,
        ...(event.aliases ?? [])
      ]),
      subscriptionId:
        event.original_transaction_id ?? event.transaction_id ?? null,
      customerId: null,
      productId: event.product_id ?? null,
      tier,
      interval: intervalOfProduct(event.product_id),
      status: statusOf(event, now),
      expiresAt: event.expiration_at_ms,
      occurredAt: event.event_timestamp_ms ?? event.purchased_at_ms ?? now,
      environment
    }
  }
}

/** Posts a purchase to RevenueCat. */
export interface RevenueCatSync {
  syncPaddle(appUserId: string, fetchToken: string): Promise<void>
}

export type Fetch = (url: string, init: RequestInit) => Promise<Response>

export class RevenueCatSyncError extends Error {
  constructor(readonly status: number) {
    super(`RevenueCat answered ${status}`)
    this.name = 'RevenueCatSyncError'
  }
}

/**
 * RevenueCat's v1 receipts endpoint with the Paddle app's public API key
 * (REVENUECAT_API_KEY); null (nothing is posted) until that key is set.
 */
export const revenueCatSync = (
  env: Env,
  fetchImpl: Fetch = (url, init) => fetch(url, init)
): RevenueCatSync | null => {
  const key = env['REVENUECAT_API_KEY']
  if (!key) return null
  const base = (
    env['REVENUECAT_API_URL'] || 'https://api.revenuecat.com'
  ).replace(/\/$/, '')
  return {
    syncPaddle: async (appUserId, fetchToken) => {
      const response = await fetchImpl(`${base}/v1/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform': 'paddle',
          Authorization: `Bearer ${key}`
        },
        body: JSON.stringify({
          app_user_id: appUserId,
          fetch_token: fetchToken
        })
      })
      if (!response.ok) throw new RevenueCatSyncError(response.status)
    }
  }
}
