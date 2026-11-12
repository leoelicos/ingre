import type { PricePreviewResponse } from '@paddle/paddle-js'
import { loadPaddle, openCheckout, previewPrice, quoteFrom } from '../paddle'
import type { PaddleCheckout } from '../paddle'

/*
 * Paddle + RevenueCat: Paddle.js for prices, tax and the overlay checkout. No module mocks
 * (#169): Paddle.js is put on window before the real loader looks for it, so the loader
 * uses it instead of fetching the script from Paddle's CDN.
 */

/** A Paddle.PricePreview answer, trimmed to what the app reads. */
export const preview = (
  lineItems: unknown[] = [
    {
      price: { id: 'pri_1' },
      taxRate: '0.19',
      totals: { subtotal: '335', discount: '0', tax: '64', total: '399' }
    }
  ]
) =>
  ({
    data: { currencyCode: 'EUR', details: { lineItems } }
  } as unknown as PricePreviewResponse)

const fakePaddle = (): PaddleCheckout & {
  PricePreview: jest.Mock
  Checkout: { open: jest.Mock }
} =>
  ({
    PricePreview: jest.fn(async () => preview()),
    Checkout: { open: jest.fn() }
  } as unknown as PaddleCheckout & {
    PricePreview: jest.Mock
    Checkout: { open: jest.Mock }
  })

describe('Paddle', () => {
  it('loads Paddle.js with the environment, token and an event callback', async () => {
    const paddleJs = {
      Initialized: false,
      Environment: { set: jest.fn() },
      Initialize: jest.fn(),
      Update: jest.fn()
    }
    Object.assign(window, { PaddleBillingV1: paddleJs })
    const onEvent = jest.fn()
    const loaded = await loadPaddle(
      {
        token: 'test_abc',
        environment: 'sandbox',
        prices: {} as never
      },
      onEvent
    )
    expect(loaded).toBe(paddleJs)
    expect(paddleJs.Environment.set).toHaveBeenCalledWith('sandbox')
    expect(paddleJs.Initialize).toHaveBeenCalledWith({
      token: 'test_abc',
      eventCallback: onEvent
    })
    expect(document.querySelector('script[src*="cdn.paddle.com"]')).toBeNull()
    Reflect.deleteProperty(window, 'PaddleBillingV1')
  })

  it('reads a price preview as a quote', () => {
    expect(quoteFrom(preview())).toEqual({
      priceId: 'pri_1',
      currency: 'EUR',
      subtotal: 335,
      tax: 64,
      total: 399,
      taxRate: 0.19
    })
    expect(quoteFrom(preview([]))).toBeNull()
  })

  it('previews one price for a country', async () => {
    const paddle = fakePaddle()
    expect((await previewPrice(paddle, 'pri_1', 'DE'))?.total).toBe(399)
    expect(paddle.PricePreview).toHaveBeenCalledWith({
      items: [{ priceId: 'pri_1', quantity: 1 }],
      address: { countryCode: 'DE' }
    })
  })

  it('opens the overlay tied to the user, with the email when known', () => {
    const paddle = fakePaddle()
    openCheckout(paddle, {
      priceId: 'pri_1',
      countryCode: 'IN',
      userId: 'u1',
      email: 'ada@example.com',
      locale: 'en-IN'
    })
    expect(paddle.Checkout.open).toHaveBeenCalledWith({
      items: [{ priceId: 'pri_1', quantity: 1 }],
      customData: { ingre_user_id: 'u1' },
      customer: { email: 'ada@example.com', address: { countryCode: 'IN' } },
      settings: { displayMode: 'overlay', locale: 'en', allowLogout: false }
    })
    openCheckout(paddle, {
      priceId: 'pri_1',
      countryCode: 'DE',
      userId: 'u1',
      email: null,
      locale: 'de-DE'
    })
    expect(paddle.Checkout.open).toHaveBeenLastCalledWith({
      items: [{ priceId: 'pri_1', quantity: 1 }],
      customData: { ingre_user_id: 'u1' },
      settings: { displayMode: 'overlay', locale: 'de', allowLogout: false }
    })
  })
})
