import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import {
  DAHL,
  box,
  chevron,
  chip,
  explore,
  exploreRow,
  hideX,
  openExplore,
  openPantry,
  pageTop,
  panel,
  pickRows,
  recipesRegion,
  searchBox
} from './page'

/* #181 Search / Explore: one scenario per behaviour, on the phone and desktop projects. */

const RECIPE_COUNT = 14
const group = (page: Page, name: string): Locator =>
  explore(page)
    .locator('div')
    .filter({
      has: page.getByRole('heading', { level: 3, name, exact: true })
    })
    .last()
const rowNames = (scope: Locator) =>
  scope
    .getByRole('button', { name: /^See recipe: / })
    .evaluateAll((els) =>
      els.map((el) =>
        (el.getAttribute('aria-label') ?? '').replace('See recipe: ', '')
      )
    )
const ingredientNames = (scope: Locator) =>
  scope
    .getByRole('button', { name: /^Add |, on your list$/ })
    .evaluateAll((els) =>
      els.map((el) =>
        (el.getAttribute('aria-label') ?? '')
          .replace(/^Add /, '')
          .replace(/, on your list$/, '')
          .toLowerCase()
      )
    )
const typeQuery = async (page: Page, text: string) => {
  await openExplore(page)
  await searchBox(page).fill(text)
}
/** The ranking rule from the issue: starts with, then a word starts with, then contains. */
const tier = (name: string, q: string) => {
  const text = name.toLowerCase()
  if (text.startsWith(q)) return 0
  if (text.split(/[\s,()]+/).some((w) => w.startsWith(q))) return 1
  return text.includes(q) ? 2 : 3
}
const expectRanked = (names: string[], q: string) => {
  const sorted = [...names].sort(
    (a, b) => tier(a, q) - tier(b, q) || a.localeCompare(b)
  )
  expect(names).toEqual(sorted)
}

test.describe('Explore (#181)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('search bar: placeholder "Search ingredients and recipes" and a max width', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1400, height: 800 })
    await openExplore(page)
    await expect(searchBox(page)).toHaveAttribute(
      'placeholder',
      'Search ingredients and recipes'
    )
    expect(
      await page
        .getByRole('search')
        .evaluate((el) => getComputedStyle(el).maxWidth)
    ).toBe('576px')
  })

  test('stays off the page until Find recipes, then search is focused', async ({
    page
  }) => {
    await expect(explore(page)).toHaveCount(0)
    await expect(page.getByRole('searchbox')).toHaveCount(0)
    await openExplore(page)
    await expect(
      page.getByRole('dialog', { name: 'Find recipes' })
    ).toBeVisible()
    await expect(searchBox(page)).toBeFocused()
    await expect(explore(page)).toBeVisible()
  })

  test('Escape clears a search first, then closes and returns focus', async ({
    page
  }) => {
    const find = page.getByRole('button', { name: 'Find recipes' })
    await find.click()
    await searchBox(page).fill('dahl')
    await page.keyboard.press('Escape')
    await expect(searchBox(page)).toHaveValue('')
    await expect(explore(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(find).toBeFocused()
  })

  test('Close and the backdrop dismiss it; there is no drawer at desktop width', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1328, height: 800 })
    await expect(page.getByRole('complementary')).toHaveCount(0)
    await expect(page.getByRole('banner').getByRole('searchbox')).toHaveCount(0)
    await openExplore(page)
    await hideX(page).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await openExplore(page)
    await page.mouse.click(8, 8)
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('always populated: browse every recipe; typing shows matches; clearing restores browse', async ({
    page
  }) => {
    await openExplore(page)
    const browse = group(page, 'Browse recipes')
    await expect(
      browse.getByRole('button', { name: /^See recipe: / })
    ).toHaveCount(RECIPE_COUNT)
    await typeQuery(page, 'dahl')
    await expect(
      explore(page).getByRole('heading', { name: 'Browse recipes' })
    ).toHaveCount(0)
    expect(await rowNames(explore(page))).toEqual([DAHL])
    await searchBox(page).fill('')
    await expect(
      browse.getByRole('button', { name: /^See recipe: / })
    ).toHaveCount(RECIPE_COUNT)
  })

  test('results are full recipe rows: tick to pick; "See recipe" expands in place without scrolling away', async ({
    page
  }) => {
    await openExplore(page)
    await exploreRow(page, DAHL).click()
    await expect(exploreRow(page, DAHL)).toHaveAttribute('aria-pressed', 'true')
    await expect(
      recipesRegion(page).getByRole('button', { name: DAHL, exact: true })
    ).toBeVisible()
    const see = explore(page).getByRole('button', {
      name: `See recipe: ${DAHL}`
    })
    await expect(see).toContainText('See recipe')
    const url = page.url()
    const top = await pageTop(see)
    await see.click()
    await expect(see).toHaveAttribute('aria-expanded', 'true')
    await expect(
      explore(page).getByRole('heading', { name: 'Method' })
    ).toBeVisible()
    expect(page.url()).toBe(url)
    expect(Math.abs((await pageTop(see)) - top)).toBeLessThan(2)
  })

  test('discovery is a dialog on a phone too, not a push-down region', async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openExplore(page)
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('banner').getByRole('searchbox')).toHaveCount(0)
  })

  test('ranking: starts with, then a word starts with, then contains; alphabetical in each tier', async ({
    page
  }) => {
    await typeQuery(page, 'chicken')
    const recipes = await rowNames(group(page, 'Recipes'))
    expect(recipes.slice(0, 3)).toEqual([
      'Chicken korma',
      'Butter chicken',
      'Lemongrass chilli chicken'
    ])
    await typeQuery(page, 'rice')
    const ingredients = await ingredientNames(group(page, 'Ingredients'))
    expect(ingredients.length).toBeGreaterThan(1)
    expectRanked(ingredients, 'rice')
    expect(
      new Set(ingredients.map((n) => tier(n, 'rice'))).size
    ).toBeGreaterThan(1)
  })

  test('recipes and ingredients are grouped separately; side by side from 768px, ingredients left', async ({
    page
  }) => {
    await page.setViewportSize({ width: 900, height: 900 })
    await typeQuery(page, 'rice')
    const ingredients = await box(
      explore(page).getByRole('heading', { level: 3, name: 'Ingredients' })
    )
    const recipes = await box(
      explore(page).getByRole('heading', { level: 3, name: 'Recipes' })
    )
    expect(Math.abs(ingredients.y - recipes.y)).toBeLessThan(2)
    expect(ingredients.x).toBeLessThan(recipes.x)
    await page.setViewportSize({ width: 700, height: 900 })
    await expect
      .poll(
        async () =>
          (
            await box(
              explore(page).getByRole('heading', { level: 3, name: 'Recipes' })
            )
          ).y
      )
      .toBeGreaterThan(ingredients.y + 20)
  })

  test('every word must match; recipes containing a matching ingredient count', async ({
    page
  }) => {
    await typeQuery(page, 'beef salad')
    expect(await rowNames(explore(page))).toEqual([
      'Lemongrass beef noodle salad'
    ])
    await typeQuery(page, 'turmeric')
    const names = await rowNames(group(page, 'Recipes'))
    expect(names).toContain(DAHL)
    expect(await ingredientNames(group(page, 'Ingredients'))).toContain(
      'ground turmeric'
    )
  })

  test('no Enter-to-search and no query param', async ({ page }) => {
    await typeQuery(page, 'dahl')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/$/)
    await page.goto('/?q=dahl')
    await openExplore(page)
    await expect(searchBox(page)).toHaveValue('')
    await expect(
      explore(page).getByRole('heading', { name: 'Browse recipes' })
    ).toBeVisible()
  })

  test('"No matches for \'x\'" inside Explore, then the browse list', async ({
    page
  }) => {
    await typeQuery(page, 'zzzqqq')
    await expect(explore(page).getByRole('status')).toHaveText(
      'No matches for ‘zzzqqq’'
    )
    await expect(
      group(page, 'Browse recipes').getByRole('button', {
        name: /^See recipe: /
      })
    ).toHaveCount(RECIPE_COUNT)
  })

  test('a misspelling shows close matches (Fuse.js) before the browse list', async ({
    page
  }) => {
    await typeQuery(page, 'chiken')
    await expect(explore(page).getByRole('status')).toHaveText(
      'No matches for ‘chiken’'
    )
    const close = explore(page).getByRole('heading', { name: 'Close matches' })
    await expect(close).toBeVisible()
    const browse = explore(page).getByRole('heading', {
      name: 'Browse recipes'
    })
    expect(await pageTop(close)).toBeLessThan(await pageTop(browse))
    expect(await ingredientNames(explore(page))).toEqual(
      expect.arrayContaining([expect.stringContaining('chicken')])
    )
  })

  test('an ingredient result adds an extra, in Extra and in Ingredients (#182)', async ({
    page
  }) => {
    await typeQuery(page, 'banana')
    await explore(page).getByRole('button', { name: 'Add banana' }).click()
    await expect(chip(page, 'banana')).toHaveCount(1)
    await openPantry(page)
    await expect(chip(page, 'banana', 'extra')).toHaveCount(1)
    await openExplore(page)
    await expect(
      explore(page).getByRole('button', { name: 'Banana, on your list' })
    ).toBeVisible()
  })

  test('an ingredient already on the list adds an Extra source at 1, then scrolls to its chip and opens it (#182, answer 8)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await typeQuery(page, 'butter')
    await explore(page)
      .getByRole('button', { name: 'Butter, on your list' })
      .click()
    await expect(chip(page, 'butter')).toHaveCount(1)
    await expect(chevron(page, 'butter')).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    await expect(chip(page, 'butter')).toBeInViewport()
    const details = panel(page, 'Butter')
    await expect(details).toBeVisible()
    await expect(details.getByText('Total: 16 g')).toBeVisible()
    await openPantry(page)
    await expect(chip(page, 'butter', 'extra')).toContainText('1 g')
  })

  test('ingredient results show their allergen tags', async ({ page }) => {
    await typeQuery(page, 'butter')
    const item = explore(page)
      .getByRole('listitem')
      .filter({ has: page.getByRole('button', { name: 'Add butter' }) })
    await expect(
      item.getByRole('list', { name: 'Allergens' }).getByRole('listitem')
    ).toHaveText(['milk'])
  })

  test('there is no Explore drawer', async ({ page }) => {
    await page.setViewportSize({ width: 1328, height: 800 })
    await expect(page.getByRole('complementary')).toHaveCount(0)
    await openExplore(page)
    await expect(
      page.getByRole('dialog', { name: 'Find recipes' })
    ).toBeVisible()
  })
})

test.describe('Explore with reduced motion (#181)', () => {
  test.use({ reducedMotion: 'reduce' })

  test('discovery still opens', async ({ page }) => {
    await page.setViewportSize({ width: 1328, height: 800 })
    await page.goto('/')
    await openExplore(page)
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
