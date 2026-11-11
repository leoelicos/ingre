import {
  LOOKUP_KEYS,
  TIERS,
  isActiveStatus,
  isTier,
  tierOfLookupKey,
  tierProduct
} from './tiers'

describe('tiers (#208)', () => {
  it('has three tiers, cheapest first', () => {
    expect(TIERS).toEqual(['EXPLORER', 'MANAGER', 'LEADER'])
  })

  it('prices them at $4, $8 and $16 in cents', () => {
    expect(TIERS.map((tier) => tierProduct(tier).productCost)).toEqual([
      400, 800, 1600
    ])
  })

  it('names each Stripe product after its tier', () => {
    expect(tierProduct('MANAGER')).toEqual({
      productName: 'ingré Manager',
      productDescription: 'The Manager tier of ingré',
      productCost: 800
    })
  })

  it('isTier accepts only the three names', () => {
    expect(isTier('LEADER')).toBe(true)
    expect(isTier('leader')).toBe(false)
    expect(isTier(null)).toBe(false)
  })
})

describe('Stripe prices for the tiers (#312)', () => {
  it('has one lookup key per tier and reads it back', () => {
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
