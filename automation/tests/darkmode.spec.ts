import { expect, test } from './fixtures'

const background = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor)

test.describe('dark mode', () => {
  test('follows the device setting', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    expect(await background(page)).toBe('rgb(255, 248, 240)')

    await page.emulateMedia({ colorScheme: 'dark' })
    expect(await background(page)).toBe('rgb(20, 24, 21)')
    await expect(
      page.getByRole('heading', { name: 'Pick', level: 1 })
    ).toBeVisible()
  })
})
