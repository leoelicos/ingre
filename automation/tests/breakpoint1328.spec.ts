import { expect, test } from './fixtures'
import { box, openExplore } from './page'

/* #192: the 1328px drawer is gone. Search lives in discovery at every width. */

test.describe('no drawer (#192)', () => {
  test('1328px: no drawer, no header search; Find recipes opens a dialog', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1328, height: 800 })
    await page.goto('/')
    await expect(page.getByRole('complementary')).toHaveCount(0)
    await expect(page.getByRole('banner').getByRole('searchbox')).toHaveCount(0)
    await expect(page.getByRole('radiogroup', { name: 'Layout' })).toHaveCount(
      0
    )
    await openExplore(page)
    await expect(
      page.getByRole('dialog', { name: 'Find recipes' })
    ).toBeVisible()
  })

  test('the page is at most 1282px wide (--layout-max-width)', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1600, height: 800 })
    await page.goto('/')
    const layout = page.getByRole('main').locator('xpath=..')
    expect((await box(layout)).width).toBe(1282)
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--layout-max-width')
          .trim()
      )
    ).toBe('1282px')
  })
})
