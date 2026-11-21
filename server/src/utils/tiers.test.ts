import {
  LOOKUP_KEYS,
  TIERS,
  isActiveStatus,
  isTier,
  tierOfLookupKey
} from './tiers'

describe('tiers (#208)', () => {
  it('has three tiers, cheapest first', () => {
    expect(TIERS).toEqual(['EXPLORER', 'MANAGER', 'LEADER'])
  })

  it('isTier accepts only the three names', () => {
    expect(isTier('LEADER')).toBe(true)
    expect(isTier('leader')).toBe(false)
    expect(isTier(null)).toBe(false)
  })
})

describe('product ids for the tiers', () => {
  it('has one product id per tier and reads it back', () => {
    TIERS.forEach((tier) =>
      expect(tierOfLookupKey(LOOKUP_KEYS[tier])).toBe(tier)
    )
    expect(tierOfLookupKey('something_else')).toBeNull()
    expect(tierOfLookupKey(null)).toBeNull()
  })

  it('counts active and trialing subscriptions as active', () => {
    expect(isActiveStatus('active')).toBe(true)
    expect(isActiveStatus('trialing')).toBe(true)
    ;['incomplete', 'past_due', 'canceled', 'unpaid', null].forEach((status) =>
      expect(isActiveStatus(status)).toBe(false)
    )
  })
})
