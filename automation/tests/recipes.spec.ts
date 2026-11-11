import { expect, test } from './fixtures'
import {
  DAHL,
  chevron,
  chipToggle,
  explore,
  openExplore,
  panel,
  pickRows,
  recipesRegion,
  setBox,
  sourceBox,
  crossOff,
  chip
} from './page'

/* #181 Recipes: every ingredient inline, no recipe page, no tags; allergens from ingredients. */

const DAHL_INGREDIENTS = [
  'red-lentils',
  'onion',
  'garlic',
  'ginger',
  'tomato',
  'ground-turmeric',
  'cumin-seeds',
  'garam-masala',
  'butter',
  'fresh-coriander',
  'basmati-rice',
  'salt'
]

test.describe('recipes (#181)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('an expanded row lists all its ingredients as editable chips, not just the top 3 (#182)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await recipesRegion(page)
      .getByRole('button', { name: `${DAHL} details` })
      .click()
    const chips = page.locator('[data-scope="row-dahl"][data-chip]')
    await expect(chips).toHaveCount(DAHL_INGREDIENTS.length)
    expect(
      (
        await chips.evaluateAll((els) =>
          els.map((el) => el.getAttribute('data-chip'))
        )
      ).sort()
    ).toEqual([...DAHL_INGREDIENTS].sort())
    // a tap crosses off; the chevron opens the recipe's box (#182, answer 27)
    await crossOff(page, 'tomato', 'row-dahl')
    await expect(chipToggle(page, 'tomato')).toBeChecked()
    await chevron(page, 'tomato', 'row-dahl').click()
    await expect(
      sourceBox(panel(page, 'Tomatoes', 'row-dahl'), DAHL)
    ).toHaveValue('1')
  })

  test('row chips and edits scale with whole-number portions; Explore is fixed at 2 (#182, answers 30-32)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await recipesRegion(page)
      .getByRole('button', { name: `${DAHL} details` })
      .click()
    const lentils = chip(page, 'red-lentils', 'row-dahl')
      .locator('label')
      .first()
    await expect(lentils).toContainText('150 g')
    await chevron(page, 'butter', 'row-dahl').click()
    await setBox(sourceBox(panel(page, 'Butter', 'row-dahl'), DAHL), '30')
    await expect(
      recipesRegion(page).getByText('Butter 15 g → 30 g')
    ).toBeVisible()
    const portions = recipesRegion(page).getByRole('textbox', {
      name: 'Portions'
    })
    await expect(portions).toHaveValue('2')
    await setBox(portions, '4')
    await expect(lentils).toContainText('300 g')
    await expect(
      recipesRegion(page).getByText('Butter 30 g → 60 g')
    ).toBeVisible()
    await expect(recipesRegion(page).getByText('Portions 2 → 4')).toBeVisible()
    await expect(chip(page, 'red-lentils')).toContainText('300 g')
    await openExplore(page)
    await explore(page)
      .getByRole('button', { name: `See recipe: ${DAHL}` })
      .click()
    const original = explore(page).locator('[data-ingredient="red-lentils"]')
    await expect(original).toContainText('150 g')
    await expect(
      explore(page).getByRole('textbox', { name: 'Portions' })
    ).toHaveCount(0)
  })

  test('the recipe page is gone: /recipe/... is Not Found', async ({
    page
  }) => {
    await page.goto('/recipe/dahl')
    await expect(page).toHaveURL(/\/recipe\/dahl$/)
    await expect(page.getByText('Page Not Found')).toBeVisible()
    await expect(page.getByRole('link', { name: /recipe/i })).toHaveCount(0)
  })

  test('no recipe tags: no cuisine, meal or diet labels anywhere', async ({
    page
  }) => {
    await openExplore(page)
    await explore(page)
      .getByRole('button', { name: `See recipe: ${DAHL}` })
      .click()
    for (const tag of [
      /\bIndian\b/,
      /\bVegetarian\b/,
      /\bVegan\b/,
      /\bDinner\b/,
      /\bGluten[- ]free\b/
    ])
      await expect(page.getByText(tag)).toHaveCount(0)
    await expect(page.locator('[data-tag], [aria-label="Tags"]')).toHaveCount(0)
  })

  test('a recipe shows the allergens worked out from its ingredients', async ({
    page
  }) => {
    await openExplore(page)
    await explore(page)
      .getByRole('button', { name: `See recipe: ${DAHL}` })
      .click()
    await expect(explore(page).getByText('Contains: milk')).toBeVisible()
  })
})
