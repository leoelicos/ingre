import {
  FEATURES_BY_TIER,
  TIERS,
  activeFeatures,
  featuresOf,
  includesFeature,
  parseTier,
  tierRank
} from '../tiers'

describe('tiers (#208)', () => {
  it('are Explorer, Manager, Leader at $4, $8 and $16', () => {
    expect(TIERS.map(({ id, priceUsd }) => [id, priceUsd])).toEqual([
      ['EXPLORER', 4],
      ['MANAGER', 8],
      ['LEADER', 16]
    ])
  })

  it('adds what the issue table says at each tier', () => {
    expect(FEATURES_BY_TIER.EXPLORER).toEqual([
      'suggestions',
      'capture',
      'triage'
    ])
    expect(FEATURES_BY_TIER.MANAGER).toEqual([
      'budget',
      'calendar',
      'composedMenus',
      'guestProfiles',
      'riskHandling'
    ])
    expect(FEATURES_BY_TIER.LEADER).toEqual([
      'preciseExecution',
      'multiDayPrep',
      'dietarySeparation',
      'haccp',
      'exactTechnique'
    ])
  })

  it('each tier includes every lower tier', () => {
    expect(featuresOf('EXPLORER').size).toBe(3)
    expect(featuresOf('MANAGER').size).toBe(8)
    expect(featuresOf('LEADER').size).toBe(13)
    for (const feature of featuresOf('EXPLORER')) {
      expect(featuresOf('MANAGER').has(feature)).toBe(true)
    }
    for (const feature of featuresOf('MANAGER')) {
      expect(featuresOf('LEADER').has(feature)).toBe(true)
    }
  })

  it('no tier, no features', () => {
    expect(featuresOf(null).size).toBe(0)
    expect(includesFeature(null, 'suggestions')).toBe(false)
  })

  it('guest profiles are Manager; HACCP is Leader', () => {
    expect(includesFeature('EXPLORER', 'guestProfiles')).toBe(false)
    expect(includesFeature('MANAGER', 'guestProfiles')).toBe(true)
    expect(includesFeature('MANAGER', 'haccp')).toBe(false)
    expect(includesFeature('LEADER', 'haccp')).toBe(true)
  })

  it('a feature is active only when the tier has it AND the user opted in', () => {
    expect([
      ...activeFeatures('MANAGER', new Set(['budget', 'haccp']))
    ]).toEqual(['budget'])
    expect(activeFeatures('MANAGER', new Set()).size).toBe(0)
    expect(activeFeatures(null, new Set(['budget'])).size).toBe(0)
  })

  it('parseTier accepts only the three ids', () => {
    expect(parseTier('LEADER')).toBe('LEADER')
    expect(parseTier('leader')).toBeNull()
    expect(parseTier(null)).toBeNull()
  })

  it('tierRank orders them', () => {
    expect(TIERS.map(({ id }) => tierRank(id))).toEqual([0, 1, 2])
  })
})
