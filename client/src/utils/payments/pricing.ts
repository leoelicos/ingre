/*
 * Paddle + RevenueCat: the global pricing engine. A country decides the region: its
 * currency, whether tax is shown on top (US, Canada) or inside the price (UK, EU,
 * Australia, India), and its purchasing power parity (PPP) share of the US price.
 * List prices are worked out from the owner's USD prices (#208) and rounded to local
 * price points; Paddle's price overrides should be set to the same figures (see
 * docs/PADDLE_REVENUECAT.md). Tax itself always comes from Paddle at checkout.
 */
import type { Tier } from '../tier/tiers'
import { TIERS } from '../tier/tiers'

export type BillingInterval = 'month' | 'year'
export const INTERVALS: readonly BillingInterval[] = ['month', 'year']

export type TaxMode = 'exclusive' | 'inclusive'
export type TaxName = 'salesTax' | 'vat' | 'gst'
export type RegionId = 'US' | 'CA' | 'GB' | 'EU' | 'AU' | 'IN'

export interface Region {
  readonly id: RegionId
  readonly currency: 'USD' | 'CAD' | 'GBP' | 'EUR' | 'AUD' | 'INR'
  readonly taxMode: TaxMode
  readonly taxName: TaxName
  /** the share of the US price charged here; 1 is full price */
  readonly ppp: number
  /** reference rate for setting list prices (units per US dollar), not a live FX rate */
  readonly usdRate: number
  /** local price points: x.99, or whole tens less one (₹119, ₹1,179) */
  readonly rounding: 'cents' | 'tens'
}

export const REGIONS: Readonly<Record<RegionId, Region>> = {
  US: {
    id: 'US',
    currency: 'USD',
    taxMode: 'exclusive',
    taxName: 'salesTax',
    ppp: 1,
    usdRate: 1,
    rounding: 'cents'
  },
  CA: {
    id: 'CA',
    currency: 'CAD',
    taxMode: 'exclusive',
    taxName: 'salesTax',
    ppp: 1,
    usdRate: 1.38,
    rounding: 'cents'
  },
  GB: {
    id: 'GB',
    currency: 'GBP',
    taxMode: 'inclusive',
    taxName: 'vat',
    ppp: 1,
    usdRate: 0.79,
    rounding: 'cents'
  },
  EU: {
    id: 'EU',
    currency: 'EUR',
    taxMode: 'inclusive',
    taxName: 'vat',
    ppp: 1,
    usdRate: 0.92,
    rounding: 'cents'
  },
  AU: {
    id: 'AU',
    currency: 'AUD',
    taxMode: 'inclusive',
    taxName: 'gst',
    ppp: 1,
    usdRate: 1.55,
    rounding: 'cents'
  },
  IN: {
    id: 'IN',
    currency: 'INR',
    taxMode: 'inclusive',
    taxName: 'gst',
    ppp: 0.35,
    usdRate: 84,
    rounding: 'tens'
  }
}

/** EU member states, all priced in euros through Paddle. */
export const EU_COUNTRIES: readonly string[] = [
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'HU',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK'
]

/** The countries the page offers in its country picker. */
export const COUNTRIES: readonly string[] = [
  'US',
  'CA',
  'GB',
  'DE',
  'FR',
  'ES',
  'IT',
  'NL',
  'IE',
  'AU',
  'IN'
]

/** The region a country buys in; anywhere else pays the US price in USD, tax on top. */
export const regionOf = (country: string): Region => {
  if (EU_COUNTRIES.includes(country)) return REGIONS.EU
  return Object.values(REGIONS).find(({ id }) => id === country) ?? REGIONS.US
}

/** A year costs ten months: two months free. */
export const MONTHS_PER_YEAR_PAID = 10

const priceUsd = (tier: Tier): number =>
  TIERS.find(({ id }) => id === tier)?.priceUsd ?? 0

/** The US price in cents. */
export const usdCents = (tier: Tier, interval: BillingInterval): number =>
  priceUsd(tier) * 100 * (interval === 'year' ? MONTHS_PER_YEAR_PAID : 1)

/** The list price in the region's minor units (cents, paise). */
export const listPrice = (
  tier: Tier,
  interval: BillingInterval,
  region: Region
): number => {
  const raw = Math.round(usdCents(tier, interval) * region.ppp * region.usdRate)
  if (region.ppp === 1 && region.usdRate === 1) return raw
  return region.rounding === 'tens'
    ? Math.ceil(raw / 1000) * 1000 - 100
    : Math.ceil(raw / 100) * 100 - 1
}

/** The PPP discount off the US price: 0.65 is 65% off. */
export const pppDiscount = (region: Region): number =>
  Math.round((1 - region.ppp) * 100) / 100

/** Paddle's fee per transaction: 5% plus a flat 50 US cents. */
export const PADDLE_FEE = { share: 0.05, flatUsdCents: 50 } as const

/** Monthly billing is not offered when the fee would take more than this share. */
export const MAX_FEE_SHARE = 0.25

/** The share of a charge (in US cents) that goes to Paddle's fee. */
export const feeShare = (chargeUsdCents: number): number =>
  (PADDLE_FEE.share * chargeUsdCents + PADDLE_FEE.flatUsdCents) / chargeUsdCents

/**
 * How a tier is billed in a region. A PPP price so low that the flat fee would eat more
 * than a quarter of each monthly payment is yearly only; other PPP prices start on yearly
 * (one fee a year instead of twelve) but monthly stays available.
 */
export type BillingPolicy = 'monthly-default' | 'annual-default' | 'annual-only'

export const billingPolicy = (tier: Tier, region: Region): BillingPolicy => {
  if (feeShare(usdCents(tier, 'month') * region.ppp) > MAX_FEE_SHARE)
    return 'annual-only'
  return region.ppp < 1 ? 'annual-default' : 'monthly-default'
}

export const allowedIntervals = (
  policy: BillingPolicy
): readonly BillingInterval[] =>
  policy === 'annual-only' ? ['year'] : INTERVALS

export const defaultInterval = (policy: BillingPolicy): BillingInterval =>
  policy === 'monthly-default' ? 'month' : 'year'

/** The interval to use: the one asked for when allowed, else the policy's default. */
export const enforceInterval = (
  policy: BillingPolicy,
  wanted: BillingInterval | null
): BillingInterval =>
  wanted !== null && allowedIntervals(policy).includes(wanted)
    ? wanted
    : defaultInterval(policy)
