/*
 * Paddle + RevenueCat: every payment source (Paddle on the web; the App Store, Google
 * Play and others through RevenueCat) is boiled down to this one shape before it touches
 * a user. Statuses use Stripe's words (#312) so `activationFields` decides `active` and
 * `tier` for every route the same way.
 */
import { publicIdOf } from '../utils/publicId'
import { LOOKUP_KEYS, TIERS, isTier, type Tier } from '../utils/tiers'

export const ENTITLEMENT_SOURCES = [
  'PADDLE',
  'APP_STORE',
  'PLAY_STORE',
  'AMAZON',
  'STRIPE',
  'RC_BILLING',
  'PROMOTIONAL',
  'OTHER'
] as const
export type EntitlementSource = (typeof ENTITLEMENT_SOURCES)[number]

export type EntitlementStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'

export type BillingInterval = 'month' | 'year'

/** One payment event, normalised. */
export interface EntitlementState {
  /** `<provider>:<the provider's event id>`, the idempotency key */
  readonly eventId: string
  readonly source: EntitlementSource
  /** the ingré user (public id) the purchase was tied to, if any */
  readonly userId: string | null
  /** Paddle subscription id, or the store's original transaction id */
  readonly subscriptionId: string | null
  /** Paddle customer id (ctm_…), when Paddle sent one */
  readonly customerId: string | null
  readonly productId: string | null
  readonly tier: Tier | null
  readonly interval: BillingInterval | null
  readonly status: EntitlementStatus
  /** end of the paid period (or when a scheduled cancellation takes effect) */
  readonly expiresAt: Date | null
  /** when the provider says it happened; older events never overwrite newer ones */
  readonly occurredAt: Date
  readonly environment: 'sandbox' | 'production'
}

/** What a normaliser made of one payload. */
export type Normalised =
  | {
      readonly kind: 'entitlement'
      readonly state: EntitlementState
      /** Paddle: also record the purchase with RevenueCat (new subscriptions only) */
      readonly syncRevenueCat: boolean
    }
  | {
      readonly kind: 'ignored'
      readonly eventId: string
      readonly reason: string
    }
  | { readonly kind: 'invalid'; readonly reason: string }

export const ignored = (eventId: string, reason: string): Normalised => ({
  kind: 'ignored',
  eventId,
  reason
})

/** A user's public id, lower-cased; null for anything else (anonymous ids, emails). */
export const userIdOf = (value: unknown): string | null => publicIdOf(value)

/** The first value that is a user id. */
export const firstUserId = (values: readonly unknown[]): string | null =>
  values.map(userIdOf).find((id): id is string => id !== null) ?? null

/** Annual product ids sit beside the monthly lookup keys from #312: ingre_manager_annual. */
export const ANNUAL_PRODUCT_IDS: Readonly<Record<Tier, string>> = {
  EXPLORER: 'ingre_explorer_annual',
  MANAGER: 'ingre_manager_annual',
  LEADER: 'ingre_leader_annual'
}

/**
 * The tier a product id sells: the #312 lookup keys, their annual twins, with or without
 * a Google Play base plan (`ingre_manager_monthly:monthly`), in any case.
 */
export const tierOfProduct = (
  productId: string | null | undefined
): Tier | null => {
  if (typeof productId !== 'string') return null
  const id = productId.split(':')[0]?.trim().toLowerCase() ?? ''
  return (
    TIERS.find(
      (tier) => LOOKUP_KEYS[tier] === id || ANNUAL_PRODUCT_IDS[tier] === id
    ) ?? null
  )
}

/** The interval a product id is billed at, from its name. */
export const intervalOfProduct = (
  productId: string | null | undefined
): BillingInterval | null => {
  if (typeof productId !== 'string') return null
  if (/(annual|year)/i.test(productId)) return 'year'
  return /month/i.test(productId) ? 'month' : null
}

/** A tier written loosely: "MANAGER", "manager", "ingre_manager", "Manager ". */
export const looseTier = (value: unknown): Tier | null => {
  if (typeof value !== 'string') return null
  const upper = value
    .trim()
    .toUpperCase()
    .replace(/^INGRE_/, '')
  return isTier(upper) ? upper : null
}

/** The highest tier among several. */
export const highestTier = (tiers: readonly (Tier | null)[]): Tier | null =>
  [...TIERS].reverse().find((tier) => tiers.includes(tier)) ?? null
