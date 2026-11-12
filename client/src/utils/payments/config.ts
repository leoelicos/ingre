/*
 * Paddle + RevenueCat: build-time settings, injected by vite.config.mts from VITE_PADDLE_*
 * and VITE_REVENUECAT_WEB_API_KEY (.env, .env.test) like `__STRIPE_PUBLISHABLE_KEY__`.
 * Anything missing or unsafe leaves checkout off; prices still show.
 */
import type { Tier } from '../tier/tiers'
import { TIERS } from '../tier/tiers'
import type { BillingInterval } from './pricing'
import { INTERVALS } from './pricing'
import { paymentKeyProblems } from './keyGuard'

declare const __APP_MODE__: string
declare const __PADDLE_CLIENT_TOKEN__: string
declare const __PADDLE_ENVIRONMENT__: string
/** JSON: {"EXPLORER_month": "pri_…", …}, one Paddle price per tier and interval */
declare const __PADDLE_PRICE_IDS__: string
declare const __REVENUECAT_WEB_API_KEY__: string

export type PriceKey = `${Tier}_${BillingInterval}`
export type PriceIds = Readonly<Record<PriceKey, string>>

export interface PaddleConfig {
  readonly token: string
  readonly environment: 'sandbox' | 'production'
  readonly prices: PriceIds
}

export const priceKey = (tier: Tier, interval: BillingInterval): PriceKey =>
  `${tier}_${interval}`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/** Every tier and interval Paddle needs a price for. */
export const PRICE_KEYS: readonly PriceKey[] = TIERS.flatMap(({ id }) =>
  INTERVALS.map((interval) => priceKey(id, interval))
)

const isPriceIds = (value: Record<string, unknown>): value is PriceIds =>
  PRICE_KEYS.every((key) => {
    const id = value[key]
    return typeof id === 'string' && id !== ''
  })

/** All six price ids, or null when any is missing. */
export const parsePriceIds = (json: string): PriceIds | null => {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return null
  }
  return isRecord(parsed) && isPriceIds(parsed) ? parsed : null
}

export interface RawPaymentSettings {
  readonly mode: string
  readonly token: string
  readonly environment: string
  readonly priceIds: string
  readonly revenueCatKey: string
}

export interface PaymentSettings {
  /** null: no Paddle checkout (not set up, or unsafe keys) */
  readonly paddle: PaddleConfig | null
  /** RevenueCat Web Billing public key, or null */
  readonly revenueCatKey: string | null
}

export const paymentSettingsOf = (raw: RawPaymentSettings): PaymentSettings => {
  const unsafe =
    paymentKeyProblems({
      mode: raw.mode,
      paddleEnvironment: raw.environment,
      paddleToken: raw.token,
      revenueCatKey: raw.revenueCatKey
    }).length > 0
  const prices = parsePriceIds(raw.priceIds)
  return {
    paddle:
      unsafe || raw.token === '' || prices === null
        ? null
        : {
            token: raw.token,
            environment:
              raw.environment === 'production' ? 'production' : 'sandbox',
            prices
          },
    revenueCatKey: unsafe || raw.revenueCatKey === '' ? null : raw.revenueCatKey
  }
}

export const PAYMENT_SETTINGS: PaymentSettings = paymentSettingsOf({
  mode: __APP_MODE__,
  token: __PADDLE_CLIENT_TOKEN__,
  environment: __PADDLE_ENVIRONMENT__,
  priceIds: __PADDLE_PRICE_IDS__,
  revenueCatKey: __REVENUECAT_WEB_API_KEY__
})
