import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import {
  DAHL,
  box,
  chevron,
  chip,
  drawer,
  explore,
  exploreRow,
  ingredientsRegion,
  openExplore,
  pageTop,
  panel,
  pickRows,
  rail,
  recipesRegion,
  searchBox
} from './page'

/* #181 Search / Explore: one scenario per behaviour, on the phone and desktop projects. */

const RECIPE_COUNT = 14
const closeX = (page: Page) =>
  explore(page).getByRole('button', { name: 'Close Explore' })
const exploreHeader = (page: Page) =>
  explore(page)
    .getByRole('heading', { level: 2, name: 'Explore', exact: true })
    .getByRole('button')
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

  test('opens on load when nothing is selected, as a labelled region with a neumorphic outline', async ({
    page
  }) => {
    await expect(explore(page)).toBeVisible()
    expect(
      await explore(page).evaluate((el) => getComputedStyle(el).boxShadow)
    ).not.toBe('none')
  })

  test('on load with something selected it starts closed', async ({ page }) => {
    await pickRows(page, DAHL)
    await page.reload()
    await expect(row(page)).toBeVisible()
    await expect(explore(page)).toHaveCount(0)
  })

  test('opens on search focus by click or tap', async ({ page }) => {
    await pickRows(page, DAHL)
    await page.reload()
    await expect(explore(page)).toHaveCount(0)
    if (await rail(page).isVisible()) await rail(page).click()
    else await searchBox(page).click()
    await expect(explore(page)).toBeVisible()
    await expect(searchBox(page)).toBeFocused()
  })

  test('opens on search focus by keyboard', async ({ page }) => {
    await pickRows(page, DAHL)
    await page.reload()
    await expect(explore(page)).toHaveCount(0)
    const wide = await rail(page).isVisible()
    // the drawer strip is last on the page, the header search bar first
    const target = wide ? rail(page) : searchBox(page)
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press(wide ? 'Shift+Tab' : 'Tab')
      if (await target.evaluate((el) => el === document.activeElement)) break
    }
    await expect(target).toBeFocused()
    if (await rail(page).isVisible()) await page.keyboard.press('Enter')
    await expect(explore(page)).toBeVisible()
    await expect(searchBox(page)).toBeFocused()
  })

  test('always populated: browse every recipe; typing shows matches; clearing restores browse', async ({
    page
  }) => {
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

  test('pushes content down; never an overlay', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openExplore(page)
    const region = await explore(page).evaluate((el) => {
      const r = el.getBoundingClientRect()
      return {
        bottom: r.bottom + window.scrollY,
        position: getComputedStyle(el).position
      }
    })
    expect(['static', 'relative']).toContain(region.position)
    expect(await pageTop(ingredientsRegion(page))).toBeGreaterThanOrEqual(
      region.bottom
    )
    await expect(
      page.locator('[aria-modal="true"], [role="dialog"]')
    ).toHaveCount(0)
  })

  test('clicking outside and Escape do not close it; Escape clears the text and restores browse', async ({
    page
  }) => {
    await typeQuery(page, 'dahl')
    await page.keyboard.press('Escape')
    await expect(explore(page)).toBeVisible()
    await expect(searchBox(page)).toHaveValue('')
    await expect(
      explore(page).getByRole('heading', { name: 'Browse recipes' })
    ).toBeVisible()
    await page.mouse.click(2, 300)
    await recipesRegion(page)
      .getByText(/No recipes picked yet/)
      .click()
    await page.keyboard.press('Escape')
    await expect(explore(page)).toBeVisible()
  })

  test('only its X closes it, and it reappears on search focus', async ({
    page
  }) => {
    await closeX(page).click()
    await expect(explore(page)).toHaveCount(0)
    if (await rail(page).isVisible()) await rail(page).click()
    else await searchBox(page).click()
    await expect(explore(page)).toBeVisible()
  })

  test('it reappears on typing', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await searchBox(page).focus()
    await closeX(page).click()
    await expect(explore(page)).toHaveCount(0)
    await searchBox(page).pressSequentially('dahl')
    await expect(explore(page)).toBeVisible()
    expect(await rowNames(explore(page))).toEqual([DAHL])
  })

  test('collapsible: its header row hides and shows the results', async ({
    page
  }) => {
    await expect(exploreHeader(page)).toHaveAttribute('aria-expanded', 'true')
    await exploreHeader(page).click()
    await expect(exploreHeader(page)).toHaveAttribute('aria-expanded', 'false')
    await expect(exploreRow(page, DAHL)).toBeHidden()
    await expect(explore(page)).toBeVisible()
    await exploreHeader(page).click()
    await expect(exploreRow(page, DAHL)).toBeVisible()
  })

  test('smaller screens: search bar at the top, Explore inline below it', async ({
    page
  }) => {
    await page.setViewportSize({ width: 800, height: 900 })
    const banner = page.getByRole('banner')
    await expect(banner.getByRole('searchbox')).toBeVisible()
    await expect(drawer(page)).toHaveCount(0)
    expect(await pageTop(explore(page))).toBeGreaterThan(
      (await box(banner)).height - 1
    )
    expect(await pageTop(explore(page))).toBeLessThan(
      await pageTop(ingredientsRegion(page))
    )
  })

  test('from 992px: a push drawer column on the right holds the search bar and squeezes the layout', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(page.getByRole('banner').getByRole('searchbox')).toHaveCount(0)
    await expect(drawer(page).getByRole('searchbox')).toBeVisible()
    await expect(
      drawer(page).getByRole('region', { name: 'Explore' })
    ).toBeVisible()
    const open = await box(drawer(page))
    const main = await box(page.getByRole('main'))
    expect(open.width).toBeGreaterThan(340)
    expect(open.width).toBeLessThan(380)
    expect(open.x).toBeGreaterThanOrEqual(main.x + main.width)
    await closeX(page).click()
    await expect
      .poll(async () => (await box(page.getByRole('main'))).width)
      .toBeGreaterThan(main.width + 250)
  })

  test('from 992px: the closed drawer leaves a strip whose search button reopens it and focuses search', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await closeX(page).click()
    await expect(rail(page)).toBeVisible()
    await expect
      .poll(async () => (await box(drawer(page))).width)
      .toBeLessThan(80)
    await rail(page).click()
    await expect(explore(page)).toBeVisible()
    await expect(searchBox(page)).toBeFocused()
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
    await expect(chip(page, 'banana', 'extra')).toHaveCount(1)
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
    await expect(chip(page, 'butter', 'extra')).toContainText('1 g')
    await expect(chevron(page, 'butter')).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    await expect(chip(page, 'butter')).toBeInViewport()
    const details = panel(page, 'Butter')
    await expect(details).toBeVisible()
    await expect(details.getByText('Total: 16 g')).toBeVisible()
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

  test('motion: the drawer opens and closes in about 0.2 s', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    expect(
      await drawer(page).evaluate(
        (el) => getComputedStyle(el).transitionDuration
      )
    ).toBe('0.2s')
  })
})

test.describe('Explore with reduced motion (#181)', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the drawer opens and closes instantly', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    expect(
      await drawer(page).evaluate(
        (el) => getComputedStyle(el).transitionDuration
      )
    ).toBe('0s')
  })
})

const row = (page: Page) =>
  recipesRegion(page).getByRole('button', { name: DAHL, exact: true })
