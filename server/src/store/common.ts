/*
 * #314: what both stores share. The store product ids are the Stripe lookup keys from #312,
 * so one id names a tier everywhere. Store states are written in Stripe's status words
 * (active, past_due, canceled, incomplete) so `active` and `tier` follow one rule.
 */
import { Types } from 'mongoose'
import { tierOfLookupKey, LOOKUP_KEYS, type Tier } from '../utils/tiers'

export type StorePlatform = 'APPLE' | 'GOOGLE'

/** The store product id for a tier, e.g. ingre_manager_monthly. */
export const productIdOf = (tier: Tier): string => LOOKUP_KEYS[tier]

/** The tier a store product id sells, or null for anything else. */
export const tierOfProductId = (productId: string | null | undefined) =>
  tierOfLookupKey(productId)

/** What a store says about one subscription, after verification. */
export interface StoreState {
  readonly platform: StorePlatform
  readonly productId: string
  readonly tier: Tier | null
  /** Stripe's words: active, past_due, canceled, incomplete, incomplete_expired */
  readonly status: string
  readonly expiresAt: Date | null
  /** Apple: originalTransactionId; Google: the purchase token */
  readonly storeId: string
  /** Google: the token this one replaced on an upgrade or downgrade */
  readonly replacesStoreId: string | null
  /** The user the app tied the purchase to (obfuscated account id / appAccountToken), if any */
  readonly accountUserId: string | null
}

/** Apple wants a UUID for appAccountToken: the user's ObjectId, zero padded to 32 hex digits. */
export const appAccountTokenFor = (userId: string): string => {
  const hex = `${userId.toLowerCase()}00000000`
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** The user id inside an appAccountToken made by appAccountTokenFor, or null. */
export const userIdOfAppAccountToken = (
  token: string | null | undefined
): string | null => {
  if (typeof token !== 'string') return null
  const hex = token.replace(/-/g, '').toLowerCase()
  if (!/^[0-9a-f]{24}00000000$/.test(hex)) return null
  return hex.slice(0, 24)
}

/** An obfuscated account id that is a user id (Android sends the ObjectId as is). */
export const userIdOfAccountId = (
  id: string | null | undefined
): string | null =>
  typeof id === 'string' &&
  /^[0-9a-f]{24}$/i.test(id) &&
  Types.ObjectId.isValid(id)
    ? id.toLowerCase()
    : null

type Env = Readonly<Record<string, string | undefined>>
export type { Env }
