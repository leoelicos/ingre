import type { Locator, Page } from '@playwright/test'
import { expect, newAccount, signUp, test } from './fixtures'
import {
  mockPaddle,
  paddleSeen,
  PADDLE_SANDBOX_API,
  priceId,
  type PaddleCalls
} from './paddle'

/*
 * Paddle + RevenueCat: checkout prices in the customer's currency, with tax the way their
 * country expects. Each block is a customer somewhere else (locale, time zone and a granted
 * location). Paddle.js, Paddle's pricing-preview API and RevenueCat are stand-ins (see
 * paddle.ts); the app, the server and the sign-up are real.
 */

/** A space or the no-break space Intl puts between a number and a symbol. */
const S = '[\\s\\u00a0\\u202f]'

/** The order summary's rows: terms and their values, in order. */
const summaryOf = (scope: Locator | Page, name: string) => {
  // a <dl>: its rows are terms and definitions
  const list = scope.getByLabel(name, { exact: true })
  return {
    list,
    terms: list.getByRole('term'),
    values: list.getByRole('definition')
  }
}

/** Signs up, opens the checkout with tiers on, and waits for the country to be worked out. */
const openCheckout = async (page: Page, country: string) => {
  await signUp(page, newAccount())
  await page.goto('/checkout?flags=tiers')
  await page
    .getByRole('heading', { name: 'Plans in your currency', level: 1 })
    .waitFor()
  const where = page.getByRole('heading', { name: `Prices for ${country}` })
  await where.waitFor()
  await expect(page.getByText('Worked out from your location.')).toBeVisible()
}

/** Chooses a tier and waits for Paddle's price for it. */
const choose = async (page: Page, calls: PaddleCalls, tier: string) => {
  const previewed = page.waitForResponse(
    (response) =>
      response.url() === `${PADDLE_SANDBOX_API}/pricing-preview` &&
      response.request().method() === 'POST'
  )
  await page
    .getByRole('region', { name: tier, exact: true })
    .getByRole('button', { name: `Choose ${tier}` })
    .click()
  expect((await previewed).ok()).toBe(true)
  const order = page.getByRole('region', { name: `Your order: ${tier}` })
  await order.waitFor()
  expect(calls.previews.length).toBeGreaterThan(0)
  return order
}

/** Presses Continue to payment and waits for the (stand-in) Paddle overlay. */
const pay = async (page: Page, order: Locator) => {
  await order.getByRole('button', { name: 'Continue to payment' }).click()
  const overlay = page.getByRole('dialog', { name: 'Paddle checkout' })
  await overlay.waitFor({ state: 'visible' })
  return overlay
}

/**
 * The sandbox client token reached Paddle.js, every preview went to the sandbox API, and
 * RevenueCat's web SDK looked up the signed-in customer with the sandbox web key.
 */
const expectSandbox = async (page: Page, calls: PaddleCalls) => {
  const { setup } = await paddleSeen(page)
  expect(setup).toEqual({
    environment: 'sandbox',
    token: 'test_placeholder_not_a_real_token'
  })
  for (const request of calls.previews) {
    expect(request.url()).toBe(`${PADDLE_SANDBOX_API}/pricing-preview`)
    expect(request.headers()['authorization']).toBe(
      'Bearer test_placeholder_not_a_real_token'
    )
  }
  await expect.poll(() => calls.revenueCat.length).toBeGreaterThan(0)
  for (const request of calls.revenueCat) {
    expect(request.url()).toMatch(
      /^https:\/\/api\.revenuecat\.com\/v1\/subscribers\/[0-9a-f]{24}/
    )
    expect(request.headers()['authorization']).toBe(
      'Bearer rcb_sb_placeholder_not_a_real_key'
    )
  }
}

test.beforeEach(() => {
  // sign-up, then the checkout page, then Paddle's overlay
  test.setTimeout(45_000)
})

test.describe('US customer: tax-exclusive prices', () => {
  test.use({
    locale: 'en-US',
    timezoneId: 'America/New_York',
    geolocation: { latitude: 40.7128, longitude: -74.006 },
    permissions: ['geolocation']
  })

  test('shows the base price, and Paddle adds sales tax as its own line', async ({
    page
  }) => {
    const calls = await mockPaddle(page)
    await openCheckout(page, 'United States')
    await expect(
      page.getByText(
        'Prices are before tax. Sales tax is added at checkout where it applies.'
      )
    ).toBeVisible()
    await expect(page.getByText(/Regional price/)).toHaveCount(0)

    const explorer = page.getByRole('region', { name: 'Explorer', exact: true })
    await expect(explorer.getByText('$4.00 a month')).toBeVisible()
    await expect(explorer.getByText('Yearly billing only')).toHaveCount(0)

    const order = await choose(page, calls, 'Explorer')
    const monthly = order.getByRole('radio', { name: 'Monthly, $4.00' })
    await expect(monthly).toBeChecked()
    await expect(monthly).toBeEnabled()

    const summary = summaryOf(order, 'Order summary')
    await summary.list.waitFor()
    await expect(summary.terms).toHaveText([
      'Price',
      'Sales tax (8.875%)',
      'Total due today'
    ])
    await expect(summary.values).toHaveText(['$4.00', '$0.36', '$4.36'])

    const overlay = await pay(page, order)
    const paddle = summaryOf(overlay, 'Paddle order summary')
    await expect(paddle.terms).toHaveText(['Subtotal', 'Tax (8.875%)', 'Total'])
    await expect(paddle.values).toHaveText(['$4.00', '$0.36', '$4.36'])

    const { checkouts } = await paddleSeen(page)
    expect(checkouts).toEqual([
      expect.objectContaining({
        items: [{ priceId: priceId('explorer', 'month'), quantity: 1 }],
        customData: { ingre_user_id: expect.any(String) },
        customer: expect.objectContaining({
          address: { countryCode: 'US' }
        }),
        settings: expect.objectContaining({
          displayMode: 'overlay',
          locale: 'en'
        })
      })
    ])
    await expectSandbox(page, calls)
  })
})

test.describe('EU customer: tax-inclusive prices in euros', () => {
  test.use({
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    geolocation: { latitude: 52.52, longitude: 13.405 },
    permissions: ['geolocation']
  })

  test('formats euros the German way, with VAT inside the price', async ({
    page
  }) => {
    const calls = await mockPaddle(page)
    await openCheckout(page, 'Deutschland')
    await expect(page.getByText('Prices include VAT.')).toBeVisible()

    const explorer = page.getByRole('region', { name: 'Explorer', exact: true })
    await expect(
      explorer.getByText(new RegExp(`^3,99${S}€ a month$`))
    ).toBeVisible()
    await expect(
      page
        .getByRole('region', { name: 'Leader', exact: true })
        .getByText(new RegExp(`^14,99${S}€ a month$`))
    ).toBeVisible()

    const order = await choose(page, calls, 'Explorer')
    await expect(
      order.getByRole('radio', { name: new RegExp(`^Monthly, 3,99${S}€$`) })
    ).toBeChecked()

    const summary = summaryOf(order, 'Order summary')
    await summary.list.waitFor()
    await expect(summary.terms).toHaveText([
      'Total due today',
      new RegExp(`^Includes VAT \\(19${S}%\\): 0,64${S}€$`)
    ])
    await expect(summary.values).toHaveText([new RegExp(`^3,99${S}€$`)])
    await expect(order.getByText('Price', { exact: true })).toHaveCount(0)
    await expect(order.getByText(/Sales tax/)).toHaveCount(0)

    const overlay = await pay(page, order)
    const paddle = summaryOf(overlay, 'Paddle order summary')
    await expect(paddle.terms).toHaveText([
      'Total',
      new RegExp(`^Includes tax \\(19${S}%\\)$`)
    ])
    await expect(paddle.values).toHaveText([
      new RegExp(`^3,99${S}€$`),
      new RegExp(`^0,64${S}€$`)
    ])
    await expect(overlay.getByText('Subtotal')).toHaveCount(0)

    const { checkouts } = await paddleSeen(page)
    expect(checkouts).toEqual([
      expect.objectContaining({
        items: [{ priceId: priceId('explorer', 'month'), quantity: 1 }],
        customer: expect.objectContaining({
          address: { countryCode: 'DE' }
        }),
        settings: expect.objectContaining({ locale: 'de' })
      })
    ])
    await expectSandbox(page, calls)
  })
})

test.describe('India customer: PPP prices in rupees', () => {
  test.use({
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    geolocation: { latitude: 19.076, longitude: 72.8777 },
    permissions: ['geolocation']
  })

  test('shows the regional discount in ₹ and bills the lowest tier yearly only', async ({
    page
  }) => {
    const calls = await mockPaddle(page)
    await openCheckout(page, 'India')
    await expect(page.getByText('Prices include GST.')).toBeVisible()
    await expect(
      page.getByText('Regional price: 65% less than the US price.')
    ).toBeVisible()

    // every tier defaults to yearly; the lowest one is yearly only
    const explorer = page.getByRole('region', { name: 'Explorer', exact: true })
    await expect(explorer.getByText('₹1,179.00 a year')).toBeVisible()
    await expect(explorer.getByText('Yearly billing only')).toBeVisible()
    const manager = page.getByRole('region', { name: 'Manager', exact: true })
    await expect(manager.getByText('₹2,359.00 a year')).toBeVisible()
    await expect(manager.getByText('Yearly billing only')).toHaveCount(0)

    const order = await choose(page, calls, 'Explorer')
    const monthly = order.getByRole('radio', { name: 'Monthly, ₹119.00' })
    const yearly = order.getByRole('radio', { name: 'Yearly, ₹1,179.00' })
    await expect(monthly).toBeDisabled()
    await expect(yearly).toBeChecked()
    await expect(
      order.getByText(
        'Explorer is billed yearly in India. Monthly payments this small would lose too much to fixed card fees.'
      )
    ).toBeVisible()
    // trying monthly anyway leaves it on yearly
    await monthly.click({ force: true })
    await expect(yearly).toBeChecked()

    const summary = summaryOf(order, 'Order summary')
    await summary.list.waitFor()
    await expect(summary.terms).toHaveText([
      'Total due today',
      'Includes GST (18%): ₹179.85'
    ])
    await expect(summary.values).toHaveText(['₹1,179.00'])

    const overlay = await pay(page, order)
    const paddle = summaryOf(overlay, 'Paddle order summary')
    await expect(paddle.terms).toHaveText(['Total', 'Includes tax (18%)'])
    await expect(paddle.values).toHaveText(['₹1,179.00', '₹179.85'])

    const { checkouts } = await paddleSeen(page)
    expect(checkouts).toEqual([
      expect.objectContaining({
        items: [{ priceId: priceId('explorer', 'year'), quantity: 1 }],
        customer: expect.objectContaining({
          address: { countryCode: 'IN' }
        })
      })
    ])
    // no monthly price was ever asked for or sold on the yearly-only tier
    for (const request of calls.previews)
      expect(request.postData()).not.toContain(priceId('explorer', 'month'))
    await expectSandbox(page, calls)
  })
})
