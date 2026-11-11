import type { Locator } from '@playwright/test'
import { expect, test } from './fixtures'
import { DAHL, pickRows } from './page'

/*
 * #181 Section headers, as #192 leaves them: one workspace with no accordions, so Recipes and
 * Ingredients are plain outlined headings at every width, with no button or chevron.
 */

/** The heading's raised outline: its own, or (Recipes) the raised section's under it. */
const outlineShadow = (row: Locator) =>
  row.evaluate((el) => {
    const own = getComputedStyle(el).boxShadow
    const section = el.closest('section')
    return own === 'none' && section !== null
      ? getComputedStyle(section, '::before').boxShadow
      : own
  })

test('Ingredients and Recipes are plain outlined headings with no button or chevron (#181, #192)', async ({
  page
}) => {
  await page.goto('/')
  await pickRows(page, DAHL)
  for (const name of ['Ingredients', 'Recipes']) {
    const heading = page.getByRole('heading', { level: 2, name, exact: true })
    await expect(heading).toBeVisible()
    await expect(heading.getByRole('button')).toHaveCount(0)
    await expect(heading.locator('[aria-expanded]')).toHaveCount(0)
    expect(await outlineShadow(heading.locator('span').first())).not.toBe(
      'none'
    )
  }
})
