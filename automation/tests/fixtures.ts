import { expect, test as base, type Page } from '@playwright/test'
import { urls } from './env'

const STRIPE_JS = /^https:\/\/js\.stripe\.com\//

const isLocal = (url: string): boolean =>
  /^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/|data:|blob:)/.test(url)

/**
 * Every test: Stripe.js comes from WireMock, and any other request that leaves
 * localhost fails the test (fonts are self-hosted, #176; no analytics in dev, #177).
 */
export const test = base.extend<{ outsideRequests: string[] }>({
  outsideRequests: [
    async ({ context }, use) => {
      const outside: string[] = []
      await context.route(STRIPE_JS, async (route) => {
        const response = await route.fetch({
          url: `${urls.wiremock}/stripe-js/v3`
        })
        await route.fulfill({ response })
      })
      await context.route(
        (url) => !isLocal(url.href) && !STRIPE_JS.test(url.href),
        async (route) => {
          outside.push(route.request().url())
          await route.abort()
        }
      )
      await use(outside)
      expect(outside, 'requests that left localhost').toEqual([])
    },
    { auto: true }
  ]
})

export { expect }

/** A new account each time; the database is fresh per run, so emails never clash. */
export const newAccount = () => {
  const id = `${Date.now()}${Math.floor(Math.random() * 1e6)}`
  return {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: `ada.${id}@example.com`,
    password: 'correct horse battery'
  }
}

export type Account = ReturnType<typeof newAccount>

/** Opens the account menu and chooses an item. */
export const accountMenu = async (page: Page, item: string) => {
  await page.getByRole('button', { name: 'Account' }).click()
  await page.getByRole('menuitem', { name: item }).click()
}

/** Signs up through the real form (Account → Sign up) and waits until logged in. */
export const signUp = async (page: Page, account: Account) => {
  await page.goto('/')
  await accountMenu(page, 'Sign up')
  await expect(
    page.getByRole('heading', { name: 'Sign up', level: 1 })
  ).toBeVisible()
  await page.getByLabel('First name').fill(account.firstName)
  await page.getByLabel('Last name').fill(account.lastName)
  await page.getByLabel('Email').fill(account.email)
  await page.locator('#password').fill(account.password)
  await page.getByRole('button', { name: 'Sign up' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expectLoggedIn(page)
}

/** Logged in: the account menu offers Log out. */
export const expectLoggedIn = async (page: Page) => {
  await page.getByRole('button', { name: 'Account' }).click()
  await expect(page.getByRole('menuitem', { name: 'Log out' })).toBeVisible()
  await page.keyboard.press('Escape')
}
