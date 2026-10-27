import { expect, test } from './fixtures'

/*
 * #192: the layout toggle is gone at every width, including the old #193
 * breakpoints. Recipes and Ingredients stay on the page; search is a dialog.
 */

const HEIGHT = 800

test.describe('no layout toggle (#192)', () => {
  test.skip(({ isMobile }) => isMobile, 'sets its own desktop widths')

  for (const width of [991, 1100, 1327, 1328])
    test(`${width}px: Recipes and Ingredients, and no layout toggle`, async ({
      page
    }) => {
      await page.setViewportSize({ width, height: HEIGHT })
      await page.goto('/')
      await expect(
        page.getByRole('radiogroup', { name: 'Layout' })
      ).toHaveCount(0)
      await expect(page.locator('[data-split]')).toHaveCount(0)
      await expect(
        page.getByRole('heading', { level: 2, name: 'Recipes' })
      ).toBeVisible()
      await expect(
        page.getByRole('heading', { level: 2, name: 'Ingredients' })
      ).toBeVisible()
      await page.getByRole('button', { name: 'Find recipes' }).click()
      await expect(
        page.getByRole('dialog', { name: 'Find recipes' })
      ).toBeVisible()
    })
})
