import { accountMenu, expect, newAccount, signUp, test } from './fixtures'
import type { Locator, Page } from '@playwright/test'
import {
  clearStripeCalls,
  delayStripeJs,
  failRedirectToCheckout,
  failStripe,
  failStripeJs,
  failStripeJsOnce,
  stripeCalls
} from './wiremock'
import { urls } from './env'

const STRIPE_JS = /^https:\/\/js\.stripe\.com\//

/** Stripe.js script failures, each its own test (the 200 stand-in is the default mapping). */
const SCRIPT_FAILURES: (404 | 500)[] = [404, 500]

const FAILED = /couldn.t start the Stripe checkout\. You have not been charged/

/** The three Stripe API calls checkout.ts makes for one session. */
const ONE_SESSION = ['/v1/products', '/v1/prices', '/v1/checkout/sessions']

/** How long the slow Stripe.js stand-in takes, so checkout stays "starting". */
const SLOW_STRIPE_JS_MS = 2_500

const STARTING = 'Starting the Stripe checkout…'

const upgradeButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Checkout with Stripe' })

/** Counts the page's CHECKOUT queries (one per checkout attempt). */
const countCheckoutQueries = (page: Page): { count: () => number } => {
  const queries: string[] = []
  page.on('request', (r) => {
    if (
      r.method() === 'POST' &&
      /"operationName":"Checkout"/.test(r.postData() ?? '')
    )
      queries.push(r.url())
  })
  return { count: () => queries.length }
}

/**
 * Upgrade while checkout is starting: dimmed and announced as disabled (aria-disabled),
 * still focused, with a status message; another press (forced past Playwright's own
 * disabled check, as a fast double press would be) starts nothing.
 */
const expectStarting = async (page: Page) => {
  const button = upgradeButton(page)
  await expect(button).toBeDisabled()
  await expect(button).toHaveAttribute('aria-disabled', 'true')
  await expect(button).toBeFocused()
  await expect(
    page.getByRole('status').filter({ hasText: STARTING })
  ).toBeVisible()
  await button.click({ force: true })
}

/*
 * CRITICAL (#175): the Upgrade journey against the real server, with WireMock as Stripe.
 * Never skip these.
 */
test.describe('upgrade', () => {
  test.describe.configure({ mode: 'serial' })

  /** Stripe.js requests this test's page made, from sign-up on. */
  let stripeJsRequests: string[] = []

  test.beforeEach(async ({ page, request }) => {
    stripeJsRequests = []
    page.on('request', (r) => {
      if (STRIPE_JS.test(r.url())) stripeJsRequests.push(r.url())
    })
    await clearStripeCalls(request)
    await signUp(page, newAccount())
    await page.goto('/upgrade')
    await expect(page.getByText('Why upgrade?')).toBeVisible()
  })

  test('success: Stripe checkout, back on Success, then the user is pro', async ({
    page,
    request
  }) => {
    await page.getByRole('button', { name: 'Checkout with Stripe' }).click()

    // the stand-in hosted checkout, opened by (stand-in) Stripe.js for the new session
    await expect(page).toHaveURL(`${urls.wiremock}/c/pay/cs_test_e2e`)
    await expect(page.getByText('Session cs_test_e2e')).toBeVisible()

    // checkout.ts: product, then price, then the session, with the dummy key
    const calls = await stripeCalls(request)
    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual([
      'POST /v1/products',
      'POST /v1/prices',
      'POST /v1/checkout/sessions'
    ])
    expect(
      calls.every((c) => c.authorization === 'Bearer sk_test_e2e_dummy')
    ).toBe(true)
    expect(calls[0]?.form).toMatchObject({ name: 'ingré PRO' })
    expect(calls[1]?.form).toEqual({
      product: 'prod_e2e',
      unit_amount: '500',
      currency: 'usd'
    })
    expect(calls[2]?.form).toMatchObject({
      'line_items[0][price]': 'price_e2e',
      'line_items[0][quantity]': '1',
      mode: 'payment',
      success_url: `${urls.client}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${urls.client}/upgrade?checkout=cancelled`
    })

    // Pay returns to success_url with the session id filled in
    await page.getByRole('link', { name: 'Pay' }).click()
    await expect(page).toHaveURL('/success?session_id=cs_test_e2e')
    await expect(page.getByText('Success!')).toBeVisible()
    await expect(page.getByText('Thank you for your purchase!')).toBeVisible()

    // then back on Upgrade, upgraded (read from the server, not the token)
    await expect(page).toHaveURL('/upgrade', { timeout: 10_000 })
    await expect(page.getByText('You are pro')).toBeVisible()
    await page.reload()
    await expect(page.getByText('You are pro')).toBeVisible()
  })

  test('Stripe.js loads only when checkout starts, not with the page', async ({
    page
  }) => {
    // signed up, on Upgrade, page fully loaded: no Stripe.js yet
    await page.waitForLoadState('networkidle')
    expect(stripeJsRequests).toEqual([])

    await page.getByRole('button', { name: 'Checkout with Stripe' }).click()
    await expect(page).toHaveURL(`${urls.wiremock}/c/pay/cs_test_e2e`)
    expect(stripeJsRequests).toEqual(['https://js.stripe.com/v3'])
  })

  for (const status of SCRIPT_FAILURES) {
    test(`Stripe.js ${status}: a clear message and the user is not upgraded`, async ({
      page,
      request
    }) => {
      const restore = await failStripeJs(request, status)
      try {
        const script = page.waitForResponse(STRIPE_JS)
        await page.getByRole('button', { name: 'Checkout with Stripe' }).click()
        expect((await script).status()).toBe(status)
        await expect(page.getByRole('alert')).toHaveText(
          /couldn.t start the Stripe checkout\. You have not been charged/
        )
        await expect(page).toHaveURL('/upgrade')
        // the session was created, but Stripe.js never took the user to it
        expect((await stripeCalls(request)).map((c) => c.path)).toEqual([
          '/v1/products',
          '/v1/prices',
          '/v1/checkout/sessions'
        ])
      } finally {
        await restore()
      }
      await page.reload()
      await expect(
        page.getByRole('button', { name: 'Checkout with Stripe' })
      ).toBeVisible()
      await expect(page.getByText('You are pro')).toHaveCount(0)
    })
  }

  test('Stripe.js 500, then Upgrade again: the load is retried without a reload and checkout opens', async ({
    page,
    request
  }) => {
    /** Top-level navigations from here on (a reload would show up as /upgrade). */
    const navigations: string[] = []
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) navigations.push(frame.url())
    })
    const restore = await failStripeJsOnce(request, 500)
    try {
      const failed = page.waitForResponse(STRIPE_JS)
      await page.getByRole('button', { name: 'Checkout with Stripe' }).click()
      expect((await failed).status()).toBe(500)
      await expect(page.getByRole('alert')).toHaveText(FAILED)
      await expect(page).toHaveURL('/upgrade')

      // try again on the same page
      const retried = page.waitForResponse(STRIPE_JS)
      await page.getByRole('button', { name: 'Checkout with Stripe' }).click()
      expect((await retried).status()).toBe(200)
      await expect(page).toHaveURL(`${urls.wiremock}/c/pay/cs_test_e2e`)
      await expect(page.getByText('Session cs_test_e2e')).toBeVisible()
    } finally {
      await restore()
    }
    expect(stripeJsRequests).toEqual([
      'https://js.stripe.com/v3',
      'https://js.stripe.com/v3'
    ])
    expect(navigations).toEqual([`${urls.wiremock}/c/pay/cs_test_e2e`])
    // one session per press
    expect((await stripeCalls(request)).map((c) => c.path)).toEqual([
      ...ONE_SESSION,
      ...ONE_SESSION
    ])
  })

  test('double press while checkout starts: one checkout, Upgrade disabled meanwhile', async ({
    page,
    request
  }) => {
    const checkoutQueries = countCheckoutQueries(page)
    const restore = await delayStripeJs(request, SLOW_STRIPE_JS_MS)
    try {
      await upgradeButton(page).dblclick()
      await expectStarting(page)
      await expect(page).toHaveURL(`${urls.wiremock}/c/pay/cs_test_e2e`, {
        timeout: 15_000
      })
      await expect(page.getByText('Session cs_test_e2e')).toBeVisible()
    } finally {
      await restore()
    }
    // one attempt: one CHECKOUT query, one session, one Stripe.js load
    expect(checkoutQueries.count()).toBe(1)
    expect((await stripeCalls(request)).map((c) => c.path)).toEqual(ONE_SESSION)
    expect(stripeJsRequests).toEqual(['https://js.stripe.com/v3'])
  })

  test('slow Stripe.js 500 after a double press: one attempt, then Upgrade is enabled again and the retry opens checkout', async ({
    page,
    request
  }) => {
    const checkoutQueries = countCheckoutQueries(page)
    const restore = await failStripeJsOnce(request, 500, SLOW_STRIPE_JS_MS)
    try {
      const failed = page.waitForResponse(STRIPE_JS)
      await upgradeButton(page).dblclick()
      await expectStarting(page)
      expect((await failed).status()).toBe(500)
      await expect(page.getByRole('alert')).toHaveText(FAILED)
      // enabled again, focus kept, and only the first press started anything
      await expect(upgradeButton(page)).toBeEnabled()
      await expect(upgradeButton(page)).not.toHaveAttribute('aria-disabled')
      await expect(upgradeButton(page)).toBeFocused()
      await expect(page.getByText(STARTING)).toHaveCount(0)
      expect(checkoutQueries.count()).toBe(1)
      expect((await stripeCalls(request)).map((c) => c.path)).toEqual(
        ONE_SESSION
      )

      // the retry works
      const retried = page.waitForResponse(STRIPE_JS)
      await upgradeButton(page).click()
      expect((await retried).status()).toBe(200)
      await expect(page).toHaveURL(`${urls.wiremock}/c/pay/cs_test_e2e`)
    } finally {
      await restore()
    }
    expect(checkoutQueries.count()).toBe(2)
    expect(stripeJsRequests).toEqual([
      'https://js.stripe.com/v3',
      'https://js.stripe.com/v3'
    ])
    expect((await stripeCalls(request)).map((c) => c.path)).toEqual([
      ...ONE_SESSION,
      ...ONE_SESSION
    ])
  })

  test('redirectToCheckout error: a clear message and the user is not upgraded', async ({
    page,
    request
  }) => {
    const restore = await failRedirectToCheckout(
      request,
      'No such checkout.session: cs_test_e2e'
    )
    try {
      const script = page.waitForResponse(STRIPE_JS)
      await page.getByRole('button', { name: 'Checkout with Stripe' }).click()
      expect((await script).status()).toBe(200)
      await expect(page.getByRole('alert')).toHaveText(FAILED)
      await expect(page).toHaveURL('/upgrade')
      // the session was created, but Stripe did not open it
      expect((await stripeCalls(request)).map((c) => c.path)).toEqual(
        ONE_SESSION
      )
    } finally {
      await restore()
    }
    await page.reload()
    await expect(
      page.getByRole('button', { name: 'Checkout with Stripe' })
    ).toBeVisible()
    await expect(page.getByText('You are pro')).toHaveCount(0)
  })

  test('Stripe error: a clear message and the user is not upgraded', async ({
    page,
    request
  }) => {
    const restore = await failStripe(request, '/v1/checkout/sessions')
    try {
      await page.getByRole('button', { name: 'Checkout with Stripe' }).click()
      await expect(page.getByRole('alert')).toHaveText(
        /couldn.t start the Stripe checkout\. You have not been charged/
      )
      await expect(page).toHaveURL('/upgrade')
      const calls = await stripeCalls(request)
      expect(calls.map((c) => c.path)).toEqual([
        '/v1/products',
        '/v1/prices',
        '/v1/checkout/sessions'
      ])
    } finally {
      await restore()
    }
    await page.reload()
    await expect(
      page.getByRole('button', { name: 'Checkout with Stripe' })
    ).toBeVisible()
    await expect(page.getByText('You are pro')).toHaveCount(0)
  })

  test('cancel: back on Upgrade with a clear message, not upgraded', async ({
    page,
    request
  }) => {
    await page.getByRole('button', { name: 'Checkout with Stripe' }).click()
    await expect(page).toHaveURL(`${urls.wiremock}/c/pay/cs_test_e2e`)
    await page.getByRole('link', { name: 'Cancel' }).click()

    await expect(page).toHaveURL('/upgrade?checkout=cancelled')
    await expect(
      page.getByRole('status').filter({ hasText: /cancelled/ })
    ).toHaveText(/Checkout cancelled\. You have not been charged/)
    await expect(
      page.getByRole('button', { name: 'Checkout with Stripe' })
    ).toBeVisible()
    await expect(page.getByText('You are pro')).toHaveCount(0)
    // no payment was confirmed: the session was created, nothing else
    expect((await stripeCalls(request)).map((c) => c.path)).toEqual([
      '/v1/products',
      '/v1/prices',
      '/v1/checkout/sessions'
    ])
    // still logged in, still able to upgrade later
    await accountMenu(page, 'Saved')
    await expect(page).toHaveURL('/?saved=1')
  })
})
