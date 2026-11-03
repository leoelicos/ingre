import { readStored, writeStored } from '../storage/storage'
import type { Tier } from './tiers'
import { parseTier } from './tiers'

/**
 * The tier a checkout is for, kept for this tab until Stripe sends the buyer back (#208).
 * Stripe's hosted page returns to the Success page, which then records the purchase.
 */
export const PENDING_TIER_KEY = 'ingre.tier.pending'

export const savePendingTier = (
  tier: Tier,
  storage: Storage = sessionStorage
): void => writeStored(PENDING_TIER_KEY, tier, storage)

export const readPendingTier = (
  storage: Storage = sessionStorage
): Tier | null =>
  readStored<Tier | null>(PENDING_TIER_KEY, parseTier, null, storage)

export const clearPendingTier = (storage: Storage = sessionStorage): void =>
  storage.removeItem(PENDING_TIER_KEY)
