import type { Page } from '@playwright/test'
import { accountMenu, expect, newAccount, signUp, test } from './fixtures'
import { mockPaddle } from './paddle'
import { DAHL, ingredientsRegion, pickRows } from './page'

/*
 * #208 Tiers behind a feature flag. Web payment is Paddle on /checkout
 * (see checkout-localization.spec.ts).
 */

const menuItems = async (page: Page): Promise<(string | null)[]> => {
  await page.getByRole('button', { name: 'Account' }).click()
  const items = await page.getByRole('menuitem').allTextContents()
  await page.keyboard.press('Escape')
  return items
}

/** Crosses off every chip in Ingredients, which is the first end-to-end with a picked recipe. */
const crossOffEverything = async (page: Page) => {
  /* a tap on each chip's row, the way a shopper does (#192: the row is a checkbox's label) */
  const rows = ingredientsRegion(page).locator('[data-scope="chip"] label')
  const count = await rows.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) await rows.nth(i).click()
}

test.describe('tiers behind the flag (#208)', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
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

  test('flag on: Plans appears only after the first end-to-end, then continues to Paddle checkout', async ({
    page
  }) => {
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
    expect(await menuItems(page)).toEqual([
      'Saved',
      'Set-up',
      'Plans',
      'Log out'
    ])

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

    await mockPaddle(page)
    await page.getByRole('button', { name: 'Choose Manager' }).click()
    await expect(page).toHaveURL('/checkout')
    await expect(
      page.getByRole('heading', { name: /plans in your currency/i })
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
