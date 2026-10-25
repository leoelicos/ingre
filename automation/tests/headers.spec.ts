import type { Locator } from '@playwright/test'
import { expect, test } from './fixtures'
import { DAHL, box, explore, pickRows, useVertical } from './page'

/* #181 Section headers: the whole row is the button, soft outline, chevron right, text left. */

const header = (scope: Locator, name: string) =>
  scope
    .getByRole('heading', { level: 2, name, exact: true })
    .getByRole('button')

/**
 * The header row's raised outline. Recipes is raised as a whole section, so its header lies
 * flat on it and the outline is the section's: only one raised level at a time.
 */
const outlineShadow = (row: Locator) =>
  row.evaluate((el) => {
    const own = getComputedStyle(el).boxShadow
    const section = el.closest('section')
    return own === 'none' && section !== null
      ? getComputedStyle(section, '::before').boxShadow
      : own
  })

test.describe('section headers (#181)', () => {
  test('Ingredients, Recipes and Explore: the whole row is the button, with an outline, chevron right and text left', async ({
    page
  }) => {
    await page.goto('/')
    await useVertical(page)
    await pickRows(page, DAHL)
    const main = page.locator('body')
    for (const button of [
      header(main, 'Ingredients'),
      header(main, 'Recipes'),
      header(explore(page), 'Explore')
    ]) {
      await expect(button).toHaveAttribute('aria-expanded', 'true')
      const heading = await box(button.locator('xpath=..'))
      const row = await box(button)
      // the button fills the heading row
      expect(row.width).toBeGreaterThan(heading.width - 2)
      expect(await outlineShadow(button)).not.toBe('none')
      expect(
        await button.evaluate((el) => getComputedStyle(el).textAlign)
      ).toBe('left')
      const title = await box(button.locator('span').first())
      const chevron = await box(button.locator('svg, [data-chevron]').last())
      expect(title.x).toBeLessThan(row.x + 24)
      expect(chevron.x + chevron.width).toBeGreaterThan(row.x + row.width - 40)
    }
  })

  test('side by side: Ingredients and Recipes are plain outlined headings with no chevron', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    for (const name of ['Ingredients', 'Recipes']) {
      const heading = page.getByRole('heading', {
        level: 2,
        name,
        exact: true
      })
      await expect(heading).toBeVisible()
      await expect(heading.getByRole('button')).toHaveCount(0)
      expect(await outlineShadow(heading.locator('span').first())).not.toBe(
        'none'
      )
    }
  })
})
