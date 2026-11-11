import type { Tier } from '../../lib/apollo/graphQL/typedefs'

/**
 * The tiers (#208). Names and prices are the owner's: Explorer $4, Manager $8, Leader $16.
 * The "free tier" is a name only: everything is included, and tiers are opt-in.
 */
export type { Tier }

export type TierFeature =
  | 'suggestions'
  | 'capture'
  | 'triage'
  | 'budget'
  | 'calendar'
  | 'composedMenus'
  | 'guestProfiles'
  | 'riskHandling'
  | 'preciseExecution'
  | 'multiDayPrep'
  | 'dietarySeparation'
  | 'haccp'
  | 'exactTechnique'

export interface TierInfo {
  readonly id: Tier
  readonly priceUsd: number
}

export const TIERS: readonly TierInfo[] = [
  { id: 'EXPLORER', priceUsd: 4 },
  { id: 'MANAGER', priceUsd: 8 },
  { id: 'LEADER', priceUsd: 16 }
]

/** What each tier adds to the one below it (the issue's table). */
export const FEATURES_BY_TIER: Readonly<Record<Tier, readonly TierFeature[]>> =
  {
    EXPLORER: ['suggestions', 'capture', 'triage'],
    MANAGER: [
      'budget',
      'calendar',
      'composedMenus',
      'guestProfiles',
      'riskHandling'
    ],
    LEADER: [
      'preciseExecution',
      'multiDayPrep',
      'dietarySeparation',
      'haccp',
      'exactTechnique'
    ]
  }

export const parseTier = (value: unknown): Tier | null =>
  TIERS.find(({ id }) => id === value)?.id ?? null

export const tierRank = (tier: Tier): number =>
  TIERS.findIndex(({ id }) => id === tier)

/** Every feature a tier has: its own and all the tiers below. */
export const featuresOf = (tier: Tier | null): ReadonlySet<TierFeature> =>
  new Set(
    tier === null
      ? []
      : TIERS.filter(({ id }) => tierRank(id) <= tierRank(tier)).flatMap(
          ({ id }) => FEATURES_BY_TIER[id]
        )
  )

export const includesFeature = (
  tier: Tier | null,
  feature: TierFeature
): boolean => featuresOf(tier).has(feature)

/** Opt-in, not a lock: a feature is on only when the tier has it and the user chose it. */
export const activeFeatures = (
  tier: Tier | null,
  optedIn: ReadonlySet<TierFeature>
): ReadonlySet<TierFeature> =>
  new Set([...featuresOf(tier)].filter((feature) => optedIn.has(feature)))
