import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import {
  DAHL,
  box,
  chevron,
  chip,
  closeSheet,
  explore,
  openExtra,
  exploreRow,
  fab,
  openExplore,
  pageTop,
  panel,
  pickRows,
  recipesRegion,
  searchBox
} from './page'

/* #181 Search / Explore, in its sheet from #192: one scenario per behaviour, on the phone and desktop projects. */

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

  test('search bar: placeholder "Search ingredients and recipes", at the top of the sheet, focused', async ({
    page
  }) => {
    await expect(page.getByRole('search')).toHaveCount(0)
    await openExplore(page)
    await expect(searchBox(page)).toHaveAttribute(
      'placeholder',
      'Search ingredients and recipes'
    )
    await expect(searchBox(page)).toBeFocused()
    expect(await pageTop(page.getByRole('search'))).toBeLessThan(
      await pageTop(
        explore(page).getByRole('heading', { name: 'Browse recipes' })
      )
    )
  })

  test('opens from "+ Recipe" by keyboard; Escape closes it and focus goes back to the FAB (#192)', async ({
    page
  }) => {
    await fab(page).focus()
    await page.keyboard.press('Enter')
    await expect(explore(page)).toBeVisible()
    await expect(searchBox(page)).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(explore(page)).toHaveCount(0)
    await expect(fab(page)).toBeFocused()
  })

  test('keeps focus inside while open (#192)', async ({ page }) => {
    await openExplore(page)
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab')
      expect(
        await explore(page).evaluate((el) =>
          el.contains(document.activeElement)
        )
      ).toBe(true)
    }
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
    await closeSheet(page)
    await expect(
      recipesRegion(page).getByRole('button', { name: DAHL, exact: true })
    ).toBeVisible()
  })

  test('is a modal dialog over the dimmed page; a press on the dimmed page closes it (#192)', async ({
    page
  }) => {
    await openExplore(page)
    const scrim = await explore(page).evaluate((el) => {
      const overlay = el.parentElement?.parentElement
      return overlay === null || overlay === undefined
        ? ''
        : getComputedStyle(overlay).backgroundColor
    })
    expect(scrim).toMatch(/^rgba\(.*0\.\d+\)$/)
    await page.mouse.click(5, 5)
    await expect(explore(page)).toHaveCount(0)
  })

  test('Escape clears the text first and keeps it open; a second Escape closes it', async ({
    page
  }) => {
    await typeQuery(page, 'dahl')
    await page.keyboard.press('Escape')
    await expect(explore(page)).toBeVisible()
    await expect(searchBox(page)).toHaveValue('')
    await expect(
      explore(page).getByRole('heading', { name: 'Browse recipes' })
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(explore(page)).toHaveCount(0)
  })

  test('the ✕ closes it; the query is still there when it opens again', async ({
    page
  }) => {
    await typeQuery(page, 'dahl')
    await closeSheet(page)
    await expect(fab(page)).toBeFocused()
    await openExplore(page)
    await expect(searchBox(page)).toHaveValue('dahl')
    expect(await rowNames(explore(page))).toEqual([DAHL])
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
    await expect(
      explore(page).getByText('No matches for ‘zzzqqq’')
    ).toBeVisible()
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
    await expect(
      explore(page).getByText('No matches for ‘chiken’')
    ).toBeVisible()
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
    await expect(
      explore(page).getByText('Banana added to Extra')
    ).toBeAttached()
    await expect(
      explore(page).getByRole('button', { name: 'Banana, on your list' })
    ).toBeVisible()
    await closeSheet(page)
    await expect(chip(page, 'banana')).toHaveCount(1)
    await openExtra(page)
    await expect(chip(page, 'banana', 'extra')).toHaveCount(1)
  })

  test('an ingredient already on the list adds an Extra source at 1 and stays in the sheet (#182, #192)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await typeQuery(page, 'butter')
    await explore(page)
      .getByRole('button', { name: 'Butter, on your list' })
      .click()
    await expect(
      explore(page).getByText('Butter added to Extra')
    ).toBeAttached()
    await explore(page)
      .getByRole('button', { name: 'Butter, on your list' })
      .click()
    await expect(
      explore(page).getByText('Butter is already in Extra')
    ).toBeAttached()
    await closeSheet(page)
    await expect(chip(page, 'butter')).toHaveCount(1)
    await chevron(page, 'butter').click()
    await expect(panel(page, 'Butter').getByText('Total: 16 g')).toBeVisible()
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

  test('motion: the sheet slides up (phone) or fades in (desktop) over 0.2 s (#192)', async ({
    page
  }) => {
    await openExplore(page)
    const motion = await enteringMotion(page)
    expect(motion.duration).toBe('0.2s')
    expect(motion.name).toBe(
      (page.viewportSize()?.width ?? 0) < 576 ? 'sheet-in' : 'fade-in'
    )
  })
})

test.describe('Explore with reduced motion (#181, #192)', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the sheet opens with no animation', async ({ page }) => {
    await page.goto('/')
    await openExplore(page)
    expect((await enteringMotion(page)).name).toBe('none')
  })
})

/**
 * The animation the sheet's panel runs while it enters. It is over in 0.2 s, so this asks a
 * stand-in with the panel's classes, marked as entering, instead of racing the real one.
 */
const enteringMotion = (page: Page) =>
  explore(page)
    .locator('xpath=..')
    .evaluate((el) => {
      const probe = document.createElement('div')
      probe.className = el.className
      probe.setAttribute('data-entering', '')
      document.body.append(probe)
      const style = getComputedStyle(probe)
      const motion = {
        name: style.animationName,
        duration: style.animationDuration
      }
      probe.remove()
      return motion
    })
