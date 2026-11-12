/*
 * Paddle + RevenueCat: Paddle.js through its official loader (@paddle/paddle-js). Prices
 * and tax for a country come from Paddle.PricePreview; payment happens in Paddle's overlay
 * checkout, tied to the user by custom data so the webhook can find them.
 */
import { initializePaddle } from '@paddle/paddle-js'
import type {
  Paddle,
  PaddleEventData,
  PricePreviewResponse
} from '@paddle/paddle-js'
import type { PaddleConfig } from './config'

export type { Paddle }

/** The parts of Paddle.js this app uses. */
export type PaddleCheckout = Pick<Paddle, 'PricePreview' | 'Checkout'>

export type LoadPaddle = (
  config: PaddleConfig,
  onEvent: (event: PaddleEventData) => void
) => Promise<PaddleCheckout | undefined>

/** Loads Paddle.js from Paddle's CDN once, and sets the environment and client token. */
export const loadPaddle: LoadPaddle = ({ environment, token }, onEvent) =>
  initializePaddle({ environment, token, eventCallback: onEvent })

/** What Paddle says one item costs in a country, in minor units. */
export interface CheckoutQuote {
  readonly priceId: string
  readonly currency: string
  readonly subtotal: number
  readonly tax: number
  readonly total: number
  /** "0.19" from Paddle, as a number */
  readonly taxRate: number
}

export const quoteFrom = ({
  data
}: PricePreviewResponse): CheckoutQuote | null => {
  const item = data.details.lineItems[0]
  if (item === undefined) return null
  return {
    priceId: item.price.id,
    currency: data.currencyCode,
    subtotal: Number(item.totals.subtotal),
    tax: Number(item.totals.tax),
    total: Number(item.totals.total),
    taxRate: Number(item.taxRate)
  }
}

export const previewPrice = async (
  paddle: PaddleCheckout,
  priceId: string,
  countryCode: string
): Promise<CheckoutQuote | null> =>
  quoteFrom(
    await paddle.PricePreview({
      items: [{ priceId, quantity: 1 }],
      address: { countryCode }
    })
  )

export interface CheckoutRequest {
  readonly priceId: string
  readonly countryCode: string
  readonly userId: string
  readonly email: string | null
  /** the customer's locale (de-DE); Paddle takes the language part */
  readonly locale: string
}

/** Opens Paddle's overlay checkout for one subscription. */
export const openCheckout = (
  paddle: PaddleCheckout,
  { priceId, countryCode, userId, email, locale }: CheckoutRequest
): void =>
  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customData: { ingre_user_id: userId },
    ...(email === null
      ? {}
      : { customer: { email, address: { countryCode } } }),
    settings: {
      displayMode: 'overlay',
      locale: locale.replace(/[-_].*$/, ''),
      allowLogout: false
    }
  })
