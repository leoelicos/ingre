import type { Page } from '@playwright/test'
import { accountMenu, expect, newAccount, signUp, test } from './fixtures'
import { DAHL, ingredientsRegion, pickRows } from './page'
import { clearStripeCalls, stripeCalls } from './wiremock'
import { urls } from './env'

/*
 * #208 Tiers behind a feature flag. Stripe is WireMock (test mode only, no real charges).
 * Stripe's public test card is typed into the stand-in checkout page.
 */

const TEST_CARD = '4242 4242 4242 4242'

const menuItems = async (page: Page): Promise<(string | null)[]> => {
  await page.getByRole('button', { name: 'Account' }).click()
  const items = await page.getByRole('menuitem').allTextContents()
  await page.keyboard.press('Escape')
  return items
}

/** Crosses off every chip in Ingredients, which is the first end-to-end with a picked recipe. */
const crossOffEverything = async (page: Page) => {
  const toggles = ingredientsRegion(page)
    .locator('[data-scope="chip"]')
    .getByRole('button', { name: /, / })
  const count = await toggles.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) await toggles.nth(i).click()
}

test.describe('tiers behind the flag (#208)', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page, request }) => {
    await clearStripeCalls(request)
    await signUp(page, newAccount())
  })

  test('flag off: no Plans anywhere and /upgrade is the old PRO page', async ({
    page
  }) => {
    await page.goto('/')
    await pickRows(page, DAHL)
    await crossOffEverything(page)
    expect(await menuItems(page)).toEqual(['Saved', 'Set-up', 'Log out'])
    await page.goto('/upgrade')
    await expect(page.getByText('Why upgrade?')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Plans' })).toHaveCount(0)
  })

  test('flag on: Plans appears only after the first end-to-end, then buys a tier through Stripe (test mode)', async ({
    page,
    request
  }) => {
    // a whole journey: sign-up, a shop, then checkout
    test.setTimeout(90_000)
    await page.goto('/?flags=tiers')
    expect(await menuItems(page)).toEqual(['Saved', 'Set-up', 'Log out'])
    // before the first end-to-end, Plans says when it opens
    await page.goto('/upgrade')
    await expect(
      page.getByText(/plans open after your first shop/i)
    ).toBeVisible()
    await expect(page.getByRole('button', { name: /^Choose/ })).toHaveCount(0)

    await page.goto('/')
    await pickRows(page, DAHL)
    expect(await menuItems(page)).toEqual(['Saved', 'Set-up', 'Log out'])
    await crossOffEverything(page)
    expect(await menuItems(page)).toEqual(['Saved', 'Set-up', 'Plans', 'Log out'])

    await accountMenu(page, 'Plans')
    await expect(page).toHaveURL('/upgrade')
    await expect(
      page.getByRole('heading', { name: 'Plans', level: 1 })
    ).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Explorer' }).getByText('4 USD')
    ).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Manager' }).getByText('8 USD')
    ).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Leader' }).getByText('16 USD')
    ).toBeVisible()

    await page.getByRole('button', { name: 'Choose Manager' }).click()
    await expect(page).toHaveURL(`${urls.wiremock}/c/pay/cs_test_e2e`)
    const calls = await stripeCalls(request)
    expect(calls[0]?.form).toMatchObject({ name: 'ingré Manager' })
    expect(calls[1]?.form).toMatchObject({
      unit_amount: '800',
      currency: 'usd'
    })
    expect(
      calls.every((c) => c.authorization.startsWith('Bearer sk_test_'))
    ).toBe(true)

    // Stripe's public test card, any future expiry, any 3-digit CVC
    await page.getByLabel('Card number').fill(TEST_CARD)
    await page.getByLabel('Expiry').fill('12 / 34')
    await page.getByLabel('CVC').fill('123')
    await page.getByRole('link', { name: 'Pay' }).click()
    await expect(page.getByText('Success!')).toBeVisible()

    // back on Plans, the server remembers the tier
    await expect(page).toHaveURL('/upgrade', { timeout: 10_000 })
    await expect(page.getByText('Your plan')).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Manager' }).getByText('Your plan')
    ).toBeVisible()
    await page.reload()
    await expect(
      page.getByRole('region', { name: 'Manager' }).getByText('Your plan')
    ).toBeVisible()
  })

  test('the tiers flag turns off again with ?flags=', async ({ page }) => {
    await page.goto('/?flags=tiers')
    await pickRows(page, DAHL)
    await crossOffEverything(page)
    expect(await menuItems(page)).toContain('Plans')
    await page.goto('/?flags=')
    expect(await menuItems(page)).toEqual(['Saved', 'Set-up', 'Log out'])
  })
})
