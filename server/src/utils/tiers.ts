/** #208: the three tiers, in order. Names and prices are the owner's, from the issue. */
export const TIERS = ['EXPLORER', 'MANAGER', 'LEADER'] as const

export type Tier = (typeof TIERS)[number]

const NAMES: Readonly<Record<Tier, string>> = {
  EXPLORER: 'Explorer',
  MANAGER: 'Manager',
  LEADER: 'Leader'
}

/** US cents, as the existing PRO checkout charges ($4, $8, $16). */
const PRICE_CENTS: Readonly<Record<Tier, number>> = {
  EXPLORER: 400,
  MANAGER: 800,
  LEADER: 1600
}

export const isTier = (value: unknown): value is Tier =>
  TIERS.some((tier) => tier === value)

/** What the Stripe checkout for a tier is called and costs. */
export const tierProduct = (tier: Tier) => ({
  productName: `ingré ${NAMES[tier]}`,
  productDescription: `The ${NAMES[tier]} tier of ingré`,
  productCost: PRICE_CENTS[tier]
})

/** #312: each tier's monthly Price in Stripe, found by lookup key (the setup script makes them). */
export const LOOKUP_KEYS: Readonly<Record<Tier, string>> = {
  EXPLORER: 'ingre_explorer_monthly',
  MANAGER: 'ingre_manager_monthly',
  LEADER: 'ingre_leader_monthly'
}

/** The Product metadata key that says which tier a Stripe Product is. */
export const TIER_METADATA_KEY = 'ingre_tier'

/** The tier a Price's lookup key stands for, or null for any other Price. */
export const tierOfLookupKey = (key: string | null | undefined): Tier | null =>
  TIERS.find((tier) => LOOKUP_KEYS[tier] === key) ?? null

/** A subscription in one of these states gives its tier: the user is active. */
export const isActiveStatus = (status: string | null | undefined): boolean =>
  status === 'active' || status === 'trialing'
