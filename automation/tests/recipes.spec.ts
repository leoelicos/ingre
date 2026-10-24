import { expect, test } from './fixtures'
import { DAHL, explore, openExplore, pickRows, recipesRegion } from './page'

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

  test('an expanded row lists all its ingredients as chips, not just the top 3', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await recipesRegion(page)
      .getByRole('button', { name: `${DAHL} details` })
      .click()
    const chips = recipesRegion(page).locator('[data-ingredient]')
    await expect(chips).toHaveCount(DAHL_INGREDIENTS.length)
    expect(
      (
        await chips.evaluateAll((els) =>
          els.map((el) => el.getAttribute('data-ingredient'))
        )
      ).sort()
    ).toEqual([...DAHL_INGREDIENTS].sort())
    // read-only for now: no buttons on the chips
    await expect(chips.getByRole('button')).toHaveCount(0)
  })

  test('row chips scale with servings', async ({ page }) => {
    await openExplore(page)
    await explore(page)
      .getByRole('button', { name: `See recipe: ${DAHL}` })
      .click()
    const chips = explore(page).locator('[data-ingredient]')
    const serves = (n: string) =>
      explore(page)
        .locator('.segmented label')
        .filter({ hasText: new RegExp(`^${n}$`) })
        .click()
    const amounts = () => chips.allTextContents()
    await serves('1')
    const one = await amounts()
    await serves('3')
    await expect.poll(amounts).not.toEqual(one)
    await serves('1')
    await expect.poll(amounts).toEqual(one)
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
