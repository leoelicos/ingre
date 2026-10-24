import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { DAHL, explore, exploreRow, openExplore } from './page'

const background = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor)

test.describe('dark mode', () => {
  test('follows the device setting', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    expect(await background(page)).toBe('rgb(255, 248, 240)')

    await page.emulateMedia({ colorScheme: 'dark' })
    expect(await background(page)).toBe('rgb(20, 24, 21)')
    await expect(
      page.getByRole('heading', { name: 'Ingredients', level: 2 })
    ).toBeVisible()
  })

  test('selected recipe rows keep a border and a check mark in dark mode', async ({
    page
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await openExplore(page)
    const dahl = exploreRow(page, DAHL)
    await dahl.click()
    await expect(dahl.getByTestId('row-check')).toHaveText('✓')
    const item = explore(page)
      .getByRole('listitem')
      .filter({ has: page.getByRole('button', { name: DAHL, exact: true }) })
    await expect(item).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)')
  })
})
