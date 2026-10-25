import type { Locator } from '@playwright/test'
import { expect, test } from './fixtures'
import {
  DAHL,
  explore,
  exploreRow,
  openExplore,
  pickRows,
  recipesRegion,
  row
} from './page'

/* #191: a recipe row shows just its name; no key-ingredient preview or three-letter badges. */

const DAHL_INGREDIENTS = 12
/** Any span whose whole text is a badge code (three capitals, or the "?" placeholder). */
const codes = (scope: Locator): Locator =>
  scope.locator('span').filter({ hasText: /^([A-Z]{3}|\?)$/ })

const expectNameOnly = async (toggle: Locator, rowItem: Locator) => {
  await expect(toggle).toHaveText(new RegExp(`^✓?\\s*${DAHL}$`))
  await expect(toggle).not.toHaveAttribute('aria-describedby', /.+/)
  await expect(toggle.locator('ul, li')).toHaveCount(0)
  await expect(codes(rowItem)).toHaveCount(0)
}

test.describe('recipe rows show just the name (#191)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Recipes: collapsed is the name only; expanded shows chips and no preview', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const item = recipesRegion(page).locator('li[data-recipe="dahl"]')
    await expectNameOnly(row(page, DAHL), item)
    await expect(item).toHaveText(new RegExp(`^✓\\s*${DAHL}$`))
    await recipesRegion(page)
      .getByRole('button', { name: `${DAHL} details` })
      .click()
    await expect(
      item.locator('[data-scope="row-dahl"][data-chip]')
    ).toHaveCount(DAHL_INGREDIENTS)
    await expectNameOnly(row(page, DAHL), item)
  })

  test('Explore: a result is the name only; See recipe shows ingredients and no preview', async ({
    page
  }) => {
    await openExplore(page)
    const item = explore(page).locator('li[data-recipe="dahl"]')
    await expectNameOnly(exploreRow(page, DAHL), item)
    await expect(item).toHaveText(new RegExp(`^${DAHL}\\s*See recipe$`))
    await explore(page)
      .getByRole('button', { name: `See recipe: ${DAHL}` })
      .click()
    await expect(item.locator('[data-ingredient]')).toHaveCount(
      DAHL_INGREDIENTS
    )
    await expectNameOnly(exploreRow(page, DAHL), item)
  })
})
