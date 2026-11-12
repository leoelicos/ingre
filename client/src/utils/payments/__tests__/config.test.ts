import {
  PAYMENT_SETTINGS,
  PRICE_KEYS,
  parsePriceIds,
  paymentSettingsOf,
  priceKey
} from '../config'

/* Paddle + RevenueCat: checkout is on only with a safe token and all six prices. */

const PRICES = Object.fromEntries(PRICE_KEYS.map((key) => [key, `pri_${key}`]))

const raw = {
  mode: 'test',
  token: 'test_abc',
  environment: 'sandbox',
  priceIds: JSON.stringify(PRICES),
  revenueCatKey: 'rcb_sb_abc'
}

describe('payment settings', () => {
  it('are off in unit tests (nothing injected)', () => {
    expect(PAYMENT_SETTINGS).toEqual({ paddle: null, revenueCatKey: null })
  })

  it('turn on with a sandbox token and every price', () => {
    expect(paymentSettingsOf(raw)).toEqual({
      paddle: { token: 'test_abc', environment: 'sandbox', prices: PRICES },
      revenueCatKey: 'rcb_sb_abc'
    })
    expect(
      paymentSettingsOf({
        ...raw,
        mode: 'production',
        environment: 'production',
        token: 'live_abc'
      }).paddle?.environment
    ).toBe('production')
  })

  it('stay off without a token, with a missing price, or with an unsafe key', () => {
    expect(paymentSettingsOf({ ...raw, token: '' }).paddle).toBeNull()
    expect(paymentSettingsOf({ ...raw, priceIds: '{}' }).paddle).toBeNull()
    expect(
      paymentSettingsOf({ ...raw, revenueCatKey: '' }).revenueCatKey
    ).toBeNull()
    expect(paymentSettingsOf({ ...raw, token: 'live_abc' })).toEqual({
      paddle: null,
      revenueCatKey: null
    })
  })
})

describe('parsePriceIds', () => {
  it('needs all six ids as non-empty strings', () => {
    expect(parsePriceIds(JSON.stringify(PRICES))).toEqual(PRICES)
    expect(
      parsePriceIds(JSON.stringify({ ...PRICES, LEADER_year: '' }))
    ).toBeNull()
    expect(
      parsePriceIds(JSON.stringify({ ...PRICES, LEADER_year: 1 }))
    ).toBeNull()
    expect(parsePriceIds('null')).toBeNull()
    expect(parsePriceIds('')).toBeNull()
    expect(priceKey('MANAGER', 'year')).toBe('MANAGER_year')
  })
})
