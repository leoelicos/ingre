import type { Page, Request } from '@playwright/test'

/*
 * Paddle + RevenueCat stand-ins for the checkout-localisation tests. Nothing here talks to
 * Paddle or RevenueCat: the client dev server runs with `--mode test`, so it reads the
 * sandbox placeholders in client/.env.test, and these routes answer every call it makes.
 *
 * - Paddle.js (cdn.paddle.com/paddle/v2/paddle.js) is a small stub with the same surface the
 *   loader in @paddle/paddle-js uses: Environment.set, Initialize, Update, PricePreview and
 *   Checkout.open. Its PricePreview really calls the pricing-preview API (sandbox-api when the
 *   app set the sandbox environment), so the app goes through Paddle's request and response.
 * - The pricing-preview API answers in the shape Paddle's sandbox returns, from the price
 *   book below (what the six sandbox prices would hold, with country price overrides).
 * - Checkout.open draws a stand-in overlay (a dialog named "Paddle checkout") with Paddle's
 *   own totals for the country, so a test can read the tax line the customer would see.
 * - RevenueCat's web SDK asks api.revenuecat.com for the customer; it gets a customer with
 *   no entitlements yet. The SDK's usage events (e.revenue.cat) are accepted and dropped.
 */

export const PADDLE_CDN = 'https://cdn.paddle.com/paddle/v2/paddle.js'
export const PADDLE_SANDBOX_API = 'https://sandbox-api.paddle.com'
const PADDLE_LIVE_API = 'https://api.paddle.com'
const REVENUECAT_API = /^https:\/\/api\.revenuecat\.com\//
/** the web SDK's own usage events */
const REVENUECAT_EVENTS = /^https:\/\/e\.revenue\.cat\//

type Interval = 'month' | 'year'
type Tier = 'explorer' | 'manager' | 'leader'
type Country = 'US' | 'DE' | 'IN'

interface CountryTax {
  currency: string
  /** Paddle's tax rate for the address, as Paddle writes it ("0.19") */
  rate: string
  /** external: tax on top (US, CA); internal: tax inside the price (UK, EU, AU, IN) */
  taxMode: 'external' | 'internal'
}

const TAX: Record<Country, CountryTax> = {
  US: { currency: 'USD', rate: '0.08875', taxMode: 'external' },
  DE: { currency: 'EUR', rate: '0.19', taxMode: 'internal' },
  IN: { currency: 'INR', rate: '0.18', taxMode: 'internal' }
}

/** Unit prices in minor units, as the sandbox prices would hold them (country overrides). */
const PRICE_BOOK: Record<Tier, Record<Interval, Record<Country, number>>> = {
  explorer: {
    month: { US: 400, DE: 399, IN: 11900 },
    year: { US: 4000, DE: 3699, IN: 117900 }
  },
  manager: {
    month: { US: 800, DE: 799, IN: 23900 },
    year: { US: 8000, DE: 7399, IN: 235900 }
  },
  leader: {
    month: { US: 1600, DE: 1499, IN: 47900 },
    year: { US: 16000, DE: 14799, IN: 470900 }
  }
}

const TIERS: readonly Tier[] = ['explorer', 'manager', 'leader']
const INTERVALS: readonly Interval[] = ['month', 'year']

/** The placeholder price ids in client/.env.test */
export const priceId = (tier: Tier, interval: Interval): string =>
  `pri_placeholder_${tier}_${interval}`

const priceOf = (id: string): { tier: Tier; interval: Interval } | null => {
  for (const tier of TIERS)
    for (const interval of INTERVALS)
      if (priceId(tier, interval) === id) return { tier, interval }
  return null
}

const isCountry = (code: unknown): code is Country =>
  code === 'US' || code === 'DE' || code === 'IN'

const capitalised = (word: string): string =>
  `${word.charAt(0).toUpperCase()}${word.slice(1)}`

/** Paddle's maths: tax on top, or the tax inside a tax-inclusive price. */
const totalsOf = (unit: number, tax: CountryTax) => {
  const rate = Number(tax.rate)
  if (tax.taxMode === 'external') {
    const taxAmount = Math.round(unit * rate)
    return { subtotal: unit, tax: taxAmount, total: unit + taxAmount }
  }
  const subtotal = Math.round(unit / (1 + rate))
  return { subtotal, tax: unit - subtotal, total: unit }
}

const formatted = (minor: number, currency: string): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    minor / 100
  )

interface PreviewRequest {
  items?: { price_id?: unknown; quantity?: unknown }[]
  address?: { country_code?: unknown }
}

/** A pricing-preview response the way Paddle's sandbox writes it (snake_case, string amounts). */
export const pricingPreview = (body: PreviewRequest) => {
  const country = body.address?.country_code
  if (!isCountry(country)) return null
  const tax = TAX[country]
  const lineItems = []
  for (const item of body.items ?? []) {
    const id = typeof item.price_id === 'string' ? item.price_id : ''
    const price = priceOf(id)
    if (price === null) return null
    const quantity = typeof item.quantity === 'number' ? item.quantity : 1
    const unit = PRICE_BOOK[price.tier][price.interval][country]
    const one = totalsOf(unit, tax)
    const all = totalsOf(unit * quantity, tax)
    const money = (t: typeof one) => ({
      subtotal: String(t.subtotal),
      discount: '0',
      tax: String(t.tax),
      total: String(t.total)
    })
    const pretty = (t: typeof one) => ({
      subtotal: formatted(t.subtotal, tax.currency),
      discount: formatted(0, tax.currency),
      tax: formatted(t.tax, tax.currency),
      total: formatted(t.total, tax.currency)
    })
    lineItems.push({
      price: {
        id,
        product_id: `pro_placeholder_${price.tier}`,
        description: `${capitalised(price.tier)} (${price.interval}ly)`,
        name: `${capitalised(price.tier)} ${price.interval}ly`,
        type: 'standard',
        billing_cycle: { interval: price.interval, frequency: 1 },
        trial_period: null,
        tax_mode: 'account_setting',
        unit_price: { amount: String(unit), currency_code: tax.currency },
        unit_price_overrides: [],
        quantity: { minimum: 1, maximum: 1 },
        status: 'active',
        custom_data: { ingre_tier: price.tier.toUpperCase() },
        import_meta: null
      },
      quantity,
      tax_rate: tax.rate,
      unit_totals: money(one),
      formatted_unit_totals: pretty(one),
      totals: money(all),
      formatted_totals: pretty(all),
      product: {
        id: `pro_placeholder_${price.tier}`,
        name: `ingre ${capitalised(price.tier)}`,
        type: 'standard',
        tax_category: 'standard',
        status: 'active'
      },
      discounts: []
    })
  }
  return {
    data: {
      customer_id: null,
      address_id: null,
      business_id: null,
      currency_code: tax.currency,
      discount_id: null,
      address: { country_code: country, postal_code: null },
      customer_ip_address: null,
      details: { line_items: lineItems },
      available_payment_methods: ['card', 'paypal', 'apple_pay', 'google_pay']
    },
    meta: { request_id: `placeholder-${Date.now()}` }
  }
}

/*
 * The Paddle.js stand-in. Plain browser JavaScript, served as the CDN script. Tax-exclusive
 * prices show Subtotal, Tax and Total; tax-inclusive ones show Total with the tax included,
 * the way Paddle's overlay does.
 */
const PADDLE_STUB = `(() => {
  const state = { environment: 'production', token: '', eventCallback: null }
  const camel = (value) =>
    Array.isArray(value)
      ? value.map(camel)
      : value !== null && typeof value === 'object'
      ? Object.fromEntries(
          Object.entries(value).map(([key, inner]) => [
            key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
            camel(inner)
          ])
        )
      : value
  const api = () =>
    state.environment === 'sandbox' ? '${PADDLE_SANDBOX_API}' : '${PADDLE_LIVE_API}'
  const preview = async (request) => {
    const response = await fetch(api() + '/pricing-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + state.token
      },
      body: JSON.stringify({
        items: request.items.map((item) => ({
          price_id: item.priceId,
          quantity: item.quantity ?? 1
        })),
        address: request.address
          ? { country_code: request.address.countryCode }
          : undefined
      })
    })
    if (!response.ok) throw new Error('pricing-preview ' + response.status)
    return camel(await response.json())
  }
  const money = (minor, currency, locale) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
      Number(minor) / 100
    )
  const percent = (rate, locale) =>
    new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 3
    }).format(Number(rate))
  const row = (list, term, value) => {
    const wrap = document.createElement('div')
    const dt = document.createElement('dt')
    dt.textContent = term
    const dd = document.createElement('dd')
    dd.textContent = value
    wrap.append(dt, dd)
    list.append(wrap)
  }
  const close = () => {
    document.querySelector('[data-paddle-stub="overlay"]')?.remove()
  }
  const open = async (options) => {
    window.__paddleCheckouts.push(JSON.parse(JSON.stringify(options)))
    const country = options.customer?.address?.countryCode
    const { data } = await preview({
      items: options.items,
      address: country ? { countryCode: country } : undefined
    })
    const locale = navigator.language
    const item = data.details.lineItems[0]
    const currency = data.currencyCode
    const exclusive = ['US', 'CA'].includes(data.address.countryCode)
    close()
    const overlay = document.createElement('div')
    overlay.dataset.paddleStub = 'overlay'
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')
    overlay.setAttribute('aria-label', 'Paddle checkout')
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:2147483647;background:#fff;color:#111;padding:24px;overflow:auto'
    const heading = document.createElement('h2')
    heading.textContent = item.product.name
    const list = document.createElement('dl')
    list.setAttribute('aria-label', 'Paddle order summary')
    const rate = percent(item.taxRate, locale)
    if (exclusive) {
      row(list, 'Subtotal', money(item.totals.subtotal, currency, locale))
      row(list, 'Tax (' + rate + ')', money(item.totals.tax, currency, locale))
      row(list, 'Total', money(item.totals.total, currency, locale))
    } else {
      row(list, 'Total', money(item.totals.total, currency, locale))
      row(
        list,
        'Includes tax (' + rate + ')',
        money(item.totals.tax, currency, locale)
      )
    }
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Close checkout'
    button.addEventListener('click', close)
    overlay.append(heading, list, button)
    document.body.append(overlay)
    state.eventCallback?.({ name: 'checkout.loaded', data: { items: [item] } })
  }
  const paddle = {
    Initialized: false,
    Status: { libraryVersion: 'stub' },
    Environment: {
      set: (environment) => {
        state.environment = environment
      }
    },
    Initialize: (options) => {
      state.token = options.token
      state.eventCallback = options.eventCallback ?? null
      paddle.Initialized = true
      window.__paddleSetup = { environment: state.environment, token: state.token }
    },
    Update: (options) => {
      if (options.eventCallback) state.eventCallback = options.eventCallback
    },
    PricePreview: preview,
    Checkout: {
      open: (options) => {
        void open(options)
      },
      close
    }
  }
  window.__paddleCheckouts = []
  window.Paddle = paddle
  window.PaddleBillingV1 = paddle
})()
`

/** What the app sent: the pricing-preview calls and the setup Paddle.js was given. */
export interface PaddleCalls {
  previews: Request[]
  revenueCat: Request[]
}

/** Routes Paddle.js, Paddle's pricing-preview API and RevenueCat's API to the stand-ins. */
export const mockPaddle = async (page: Page): Promise<PaddleCalls> => {
  const calls: PaddleCalls = { previews: [], revenueCat: [] }
  await page.route(PADDLE_CDN, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: PADDLE_STUB
    })
  )
  await page.route(`${PADDLE_SANDBOX_API}/pricing-preview`, async (route) => {
    const request = route.request()
    if (request.method() === 'OPTIONS')
      return route.fulfill({
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'POST'
        }
      })
    calls.previews.push(request)
    const body: unknown = request.postDataJSON()
    const preview =
      body !== null && typeof body === 'object' ? pricingPreview(body) : null
    return route.fulfill({
      status: preview === null ? 400 : 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(
        preview ?? {
          error: {
            type: 'request_error',
            code: 'bad_request',
            detail: 'unknown price or country in the stand-in'
          }
        }
      )
    })
  })
  await page.route(REVENUECAT_API, (route) => {
    const request = route.request()
    calls.revenueCat.push(request)
    const userId = decodeURIComponent(
      new URL(request.url()).pathname.split('/').pop() ?? ''
    )
    const now = new Date()
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        request_date: now.toISOString(),
        request_date_ms: now.getTime(),
        subscriber: {
          entitlements: {},
          subscriptions: {},
          non_subscriptions: {},
          other_purchases: {},
          first_seen: now.toISOString(),
          original_app_user_id: userId,
          original_application_version: null,
          original_purchase_date: null,
          management_url: null
        }
      })
    })
  })
  await page.route(REVENUECAT_EVENTS, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: '{}'
    })
  )
  return calls
}

/** What Paddle.js was set up with, and every Checkout.open the app made. */
export const paddleSeen = (page: Page) =>
  page.evaluate(() => {
    const seen = window as unknown as {
      __paddleSetup?: { environment: string; token: string }
      __paddleCheckouts?: unknown[]
    }
    return {
      setup: seen.__paddleSetup ?? null,
      checkouts: seen.__paddleCheckouts ?? []
    }
  })
