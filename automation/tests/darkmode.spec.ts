import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

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
    const dahl = page.getByRole('button', {
      name: 'Red lentil dahl',
      exact: true
    })
    await dahl.click()
    await expect(dahl.getByTestId('row-check')).toHaveText('✓')
    const item = page.getByRole('listitem').filter({ has: dahl })
    await expect(item).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)')
  })
})
