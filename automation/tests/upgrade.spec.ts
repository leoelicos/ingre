import { accountMenu, expect, newAccount, signUp, test } from './fixtures'
import {
  clearStripeCalls,
  failStripe,
  failStripeJs,
  stripeCalls
} from './wiremock'
import { urls } from './env'

const STRIPE_JS = /^https:\/\/js\.stripe\.com\//

/** Stripe.js script failures, each its own test (the 200 stand-in is the default mapping). */
const SCRIPT_FAILURES: (404 | 500)[] = [404, 500]

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
