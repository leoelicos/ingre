/*
 * Paddle Billing webhooks (subscription.*), normalised. Paddle sends snake_case JSON with
 * many optional and nullable fields; only what decides the entitlement is read, and
 * anything malformed is refused rather than guessed. The signature is checked before this
 * (webhooks/paddle.ts).
 */
import { z } from 'zod'
import type { Tier } from '../utils/tiers'
import {
  firstUserId,
  highestTier,
  ignored,
  intervalOfProduct,
  looseTier,
  type BillingInterval,
  type EntitlementStatus,
  type Normalised
} from './entitlement'
import type { Env } from './keyGuard'

const record = z.record(z.string(), z.unknown())

const priceSchema = z.object({
  id: z.string(),
  product_id: z.string().nullish(),
  billing_cycle: z.object({ interval: z.string() }).nullish(),
  custom_data: record.nullish()
})

const subscriptionSchema = z.object({
  id: z.string(),
  status: z.string(),
  customer_id: z.string().nullish(),
  items: z
    .array(z.object({ price: priceSchema.nullish() }))
    .nullish()
    .transform((items) => items ?? []),
  custom_data: record.nullish(),
  current_billing_period: z.object({ ends_at: z.string().nullish() }).nullish(),
  scheduled_change: z
    .object({ action: z.string(), effective_at: z.string().nullish() })
    .nullish(),
  canceled_at: z.string().nullish()
})

const eventSchema = z.object({
  event_id: z.string().min(1),
  event_type: z.string().min(1),
  occurred_at: z.string().min(1),
  data: z.unknown()
})

/** The subscription events that move an entitlement. */
export const PADDLE_HANDLED = [
  'subscription.created',
  'subscription.activated',
  'subscription.trialing',
  'subscription.updated',
  'subscription.past_due',
  'subscription.paused',
  'subscription.resumed',
  'subscription.canceled'
] as const

/** New subscriptions are also posted to RevenueCat (once is enough; it tracks renewals). */
const SYNC_TO_REVENUECAT = new Set([
  'subscription.created',
  'subscription.activated'
])

/** Paddle's subscription statuses in Stripe's words; paused has no access, like past_due. */
const STATUS: Readonly<Record<string, EntitlementStatus>> = {
  active: 'active',
  trialing: 'trialing',
  past_due: 'past_due',
  paused: 'past_due',
  canceled: 'canceled'
}

/** The environment this server's Paddle notifications come from. */
export const paddleEnvironmentOf = (env: Env): 'sandbox' | 'production' =>
  env['PADDLE_ENVIRONMENT'] === 'production' ? 'production' : 'sandbox'

/** `PADDLE_PRICE_TIERS=pri_a=EXPLORER,pri_b=MANAGER`: for prices without ingre_tier custom data. */
export const priceTiersOf = (env: Env): ReadonlyMap<string, Tier> =>
  new Map(
    (env['PADDLE_PRICE_TIERS'] ?? '')
      .split(',')
      .map((pair) => pair.split('=').map((part) => part.trim()))
      .flatMap(([priceId, tier]): [string, Tier][] => {
        const parsed = looseTier(tier)
        return priceId && parsed ? [[priceId, parsed]] : []
      })
  )

const USER_KEYS = [
  'ingre_user_id',
  'ingreUserId',
  'user_id',
  'userId',
  'app_user_id'
]

const date = (value: string | null | undefined): Date | null => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const interval = (value: string | undefined): BillingInterval | null =>
  value === 'month' || value === 'year' ? value : null

/** One Paddle webhook payload (already signature-checked), normalised. */
export const normalisePaddleEvent = (
  payload: unknown,
  {
    priceTiers = new Map(),
    environment = 'sandbox'
  }: {
    priceTiers?: ReadonlyMap<string, Tier>
    /** a notification is signed by one environment's secret, so the server knows which */
    environment?: 'sandbox' | 'production'
  } = {}
): Normalised => {
  const event = eventSchema.safeParse(payload)
  if (!event.success) return { kind: 'invalid', reason: 'not a Paddle event' }
  const { event_id, event_type, occurred_at } = event.data
  const eventId = `paddle:${event_id}`
  if (!PADDLE_HANDLED.some((type) => type === event_type))
    return ignored(eventId, `${event_type} does not change an entitlement`)
  const parsed = subscriptionSchema.safeParse(event.data.data)
  const occurredAt = date(occurred_at)
  if (!parsed.success || occurredAt === null)
    return { kind: 'invalid', reason: `malformed ${event_type}` }
  const sub = parsed.data
  const status = STATUS[sub.status]
  if (status === undefined)
    return ignored(eventId, `unknown subscription status ${sub.status}`)
  const prices = sub.items.flatMap((item) => (item.price ? [item.price] : []))
  const tier = highestTier(
    prices.map(
      (price) =>
        looseTier(price.custom_data?.['ingre_tier']) ??
        priceTiers.get(price.id) ??
        null
    )
  )
  const first = prices[0]
  const userId = firstUserId(
    USER_KEYS.map((key) => sub.custom_data?.[key] ?? null)
  )
  const cancelsAt =
    sub.scheduled_change?.action === 'cancel'
      ? date(sub.scheduled_change.effective_at)
      : null
  return {
    kind: 'entitlement',
    syncRevenueCat: SYNC_TO_REVENUECAT.has(event_type) && userId !== null,
    state: {
      eventId,
      source: 'PADDLE',
      userId,
      subscriptionId: sub.id,
      customerId: sub.customer_id ?? null,
      productId: first?.id ?? null,
      tier,
      interval:
        interval(first?.billing_cycle?.interval) ??
        intervalOfProduct(first?.product_id),
      status,
      expiresAt:
        cancelsAt ??
        date(sub.current_billing_period?.ends_at) ??
        date(sub.canceled_at),
      occurredAt,
      environment
    }
  }
}
