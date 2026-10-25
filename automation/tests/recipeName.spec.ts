import type { Locator, Page } from '@playwright/test'
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

/*
 * #191: a closed recipe row shows its name and every ingredient as a read-only chip; open,
 * the editable chips replace them. Never a key-ingredient preview or three-letter badges.
 */

const DAHL_NAMES = [
  'Red lentils',
  'Brown onion',
  'Garlic',
  'Ginger',
  'Tomatoes',
  'Ground turmeric',
  'Cumin seeds',
  'Garam masala',
  'Butter',
  'Fresh coriander',
  'Basmati rice',
  'Salt'
]
/** Elements anywhere on the page whose whole text is a badge code (or the "?" placeholder). */
const codes = (page: Page): Promise<string[]> =>
  page
    .locator('body *')
    .evaluateAll((els) =>
      els
        .map((el) => (el.textContent ?? '').trim())
        .filter((text) => /^([A-Z]{3}|\?)$/.test(text))
    )
const names = (item: Locator): Locator =>
  item.getByRole('list', { name: `Ingredients in ${DAHL}` })

const expectNameToggle = async (toggle: Locator) => {
  await expect(toggle).toHaveText(new RegExp(`^✓?\\s*${DAHL}$`))
  await expect(toggle).not.toHaveAttribute('aria-describedby', /.+/)
  await expect(toggle.locator('ul, li')).toHaveCount(0)
}

/** Closed: every name as a plain list item; nothing to tick, open or focus. */
const expectReadOnlyNames = async (page: Page, item: Locator) => {
  const list = names(item)
  await expect(list.getByRole('listitem')).toHaveText(DAHL_NAMES)
  await expect(
    list.locator('button, input, svg, [tabindex], [role="checkbox"]')
  ).toHaveCount(0)
  await list.getByRole('listitem').first().click()
  await expect(
    page.locator('[data-name-chip]:focus, [data-name-chip] :focus')
  ).toHaveCount(0)
}

test.describe('recipe rows: name and read-only ingredient chips (#191)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Recipes: closed shows every ingredient by name; open shows the editable chips once', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const item = recipesRegion(page).locator('li[data-recipe="dahl"]')
    await expectNameToggle(row(page, DAHL))
    await expectReadOnlyNames(page, item)
    expect(await codes(page)).toEqual([])
    await recipesRegion(page)
      .getByRole('button', { name: `${DAHL} details` })
      .click()
    await expect(names(item)).toHaveCount(0)
    await expect(
      item.locator('[data-scope="row-dahl"][data-chip]')
    ).toHaveCount(DAHL_NAMES.length)
    await expectNameToggle(row(page, DAHL))
    expect(await codes(page)).toEqual([])
  })

  test('Explore: closed shows every ingredient by name; See recipe shows them once', async ({
    page
  }) => {
    await openExplore(page)
    const item = explore(page).locator('li[data-recipe="dahl"]')
    await expectNameToggle(exploreRow(page, DAHL))
    await expectReadOnlyNames(page, item)
    expect(await codes(page)).toEqual([])
    await explore(page)
      .getByRole('button', { name: `See recipe: ${DAHL}` })
      .click()
    await expect(names(item)).toHaveCount(0)
    await expect(item.locator('[data-ingredient]')).toHaveCount(
      DAHL_NAMES.length
    )
    await expectNameToggle(exploreRow(page, DAHL))
    expect(await codes(page)).toEqual([])
  })
})
