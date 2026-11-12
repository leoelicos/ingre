import type { Tier } from '../../tier/tiers'
import {
  REGIONS,
  allowedIntervals,
  billingPolicy,
  defaultInterval,
  enforceInterval,
  feeShare,
  listPrice,
  pppDiscount,
  regionOf,
  usdCents
} from '../pricing'

/* Paddle + RevenueCat: the pricing engine (currency, tax mode, PPP, billing policy). */

describe('regionOf', () => {
  it('maps countries to regions, with the US price anywhere else', () => {
    expect(regionOf('US').currency).toBe('USD')
    expect(regionOf('CA')).toMatchObject({
      currency: 'CAD',
      taxMode: 'exclusive'
    })
    expect(regionOf('GB')).toMatchObject({
      currency: 'GBP',
      taxMode: 'inclusive'
    })
    expect(regionOf('DE')).toMatchObject({
      id: 'EU',
      currency: 'EUR',
      taxName: 'vat'
    })
    expect(regionOf('FR').id).toBe('EU')
    expect(regionOf('AU')).toMatchObject({ currency: 'AUD', taxName: 'gst' })
    expect(regionOf('IN')).toMatchObject({ currency: 'INR', ppp: 0.35 })
    expect(regionOf('BR')).toBe(REGIONS.US)
  })
})

describe('listPrice', () => {
  it('keeps the owner’s US prices', () => {
    expect(listPrice('EXPLORER', 'month', REGIONS.US)).toBe(400)
    expect(listPrice('LEADER', 'year', REGIONS.US)).toBe(16000)
  })

  it('rounds converted prices to local price points', () => {
    expect(listPrice('EXPLORER', 'month', REGIONS.EU)).toBe(399)
    expect(listPrice('MANAGER', 'month', REGIONS.GB)).toBe(699)
    expect(listPrice('LEADER', 'month', REGIONS.CA)).toBe(2299)
    expect(listPrice('EXPLORER', 'year', REGIONS.AU)).toBe(6199)
  })

  it('applies the PPP discount in India, in whole rupees ending in 9', () => {
    expect(listPrice('EXPLORER', 'month', REGIONS.IN)).toBe(11900)
    expect(listPrice('EXPLORER', 'year', REGIONS.IN)).toBe(117900)
    expect(listPrice('MANAGER', 'year', REGIONS.IN)).toBe(235900)
    expect(pppDiscount(REGIONS.IN)).toBe(0.65)
    expect(pppDiscount(REGIONS.US)).toBe(0)
  })

  it('prices a year at ten months', () => {
    expect(usdCents('MANAGER', 'year')).toBe(8000)
    expect(usdCents('NOPE' as Tier, 'month')).toBe(0)
  })
})

describe('billing policy', () => {
  it('works out Paddle’s fee share (5% + 50¢)', () => {
    expect(feeShare(400)).toBeCloseTo(0.175)
    expect(feeShare(140)).toBeCloseTo(0.407, 3)
  })

  it('enforces yearly for low PPP prices and defaults to it for other PPP prices', () => {
    expect(billingPolicy('EXPLORER', REGIONS.IN)).toBe('annual-only')
    expect(billingPolicy('MANAGER', REGIONS.IN)).toBe('annual-default')
    expect(billingPolicy('LEADER', REGIONS.IN)).toBe('annual-default')
    expect(billingPolicy('EXPLORER', REGIONS.US)).toBe('monthly-default')
    expect(billingPolicy('EXPLORER', REGIONS.EU)).toBe('monthly-default')
  })

  it('allows and defaults intervals by policy', () => {
    expect(allowedIntervals('annual-only')).toEqual(['year'])
    expect(allowedIntervals('annual-default')).toEqual(['month', 'year'])
    expect(defaultInterval('monthly-default')).toBe('month')
    expect(defaultInterval('annual-default')).toBe('year')
    expect(enforceInterval('annual-only', 'month')).toBe('year')
    expect(enforceInterval('annual-default', 'month')).toBe('month')
    expect(enforceInterval('monthly-default', null)).toBe('month')
  })
})
