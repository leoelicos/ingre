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
