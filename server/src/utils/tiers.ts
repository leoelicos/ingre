/** #208: the three tiers, in order. Names and prices are the owner's, from the issue. */
export const TIERS = ['EXPLORER', 'MANAGER', 'LEADER'] as const

export type Tier = (typeof TIERS)[number]

export const isTier = (value: unknown): value is Tier =>
  TIERS.some((tier) => tier === value)

/**
 * Product ids shared by the App Store, Google Play and RevenueCat. One id names
 * a tier everywhere.
 */
export const LOOKUP_KEYS: Readonly<Record<Tier, string>> = {
  EXPLORER: 'ingre_explorer_monthly',
  MANAGER: 'ingre_manager_monthly',
  LEADER: 'ingre_leader_monthly'
}

/** The tier a product id stands for, or null for any other id. */
export const tierOfLookupKey = (key: string | null | undefined): Tier | null =>
  TIERS.find((tier) => LOOKUP_KEYS[tier] === key) ?? null

/** A subscription in one of these states gives its tier: the user is active. */
export const isActiveStatus = (status: string | null | undefined): boolean =>
  status === 'active' || status === 'trialing'
