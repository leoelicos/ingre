import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import {
  DAHL,
  box,
  chooseLayout,
  drawer,
  explore,
  exploreHeader,
  exploreRow,
  extraRegion,
  hideX,
  ingredientsRegion,
  layoutToggle,
  pageTop,
  pickRows,
  rail,
  recipesRegion
} from './page'

/*
 * Explore, the search bar and 33/33/33 change at 1328px: inline below, drawer (or the third
 * column) from there. Each behaviour is checked either side of the line, at 1327px and 1328px.
 * The widths are set per test, so the phone project skips these.
 */

const NARROW = { width: 1327, height: 800 }
const WIDE = { width: 1328, height: 800 }
const THIRDS = 'Ingredients 33%, Recipes 33%, Explore 33%'

const split = (page: Page) =>
  page.locator('[data-split]').getAttribute('data-split')
const choices = (page: Page) =>
  layoutToggle(page)
    .getByRole('radio')
    .evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')))
const headerSearch = (page: Page) =>
  page.getByRole('banner').getByRole('searchbox')
const column = (page: Page) => page.locator('[data-explore-column]')
/** Explore's element, shown or hidden: it is always on the page. */
const exploreEl = (page: Page) => page.locator('#explore')

test.describe('1328px breakpoint', () => {
  test.skip(({ isMobile }) => isMobile, 'sets its own desktop widths')

  test('1327px: Explore inline below the header search bar, pushing the sections down; no drawer', async ({
    page
  }) => {
    await page.setViewportSize(NARROW)
    await page.goto('/')
    await expect(drawer(page)).toHaveCount(0)
    await expect(headerSearch(page)).toBeVisible()
    await expect(page.getByRole('main').locator('#explore')).toBeVisible()
    expect(await pageTop(explore(page))).toBeGreaterThan(
      (await box(page.getByRole('banner'))).height - 1
    )
    await expect
      .poll(async () => {
        const area = await box(explore(page))
        return (await pageTop(ingredientsRegion(page))) - (area.y + area.height)
      })
      .toBeGreaterThan(0)
  })

  test('1328px: Explore is the drawer on the right holding the search bar; none in the header', async ({
    page
  }) => {
    await page.setViewportSize(WIDE)
    await page.goto('/')
    await expect(headerSearch(page)).toHaveCount(0)
    await expect(drawer(page).getByRole('searchbox')).toBeVisible()
    await expect(drawer(page).locator('#explore')).toBeVisible()
    const aside = await box(drawer(page))
    const main = await box(page.getByRole('main'))
    expect(aside.x).toBeGreaterThanOrEqual(main.x + main.width)
  })

  test('1327px: the toggle does not offer 33/33/33', async ({ page }) => {
    await page.setViewportSize(NARROW)
    await page.goto('/')
    expect(await choices(page)).toEqual([
      'Vertical',
      'Ingredients 50%, Recipes 50%',
      'Ingredients 25%, Recipes 75%',
      'Ingredients 75%, Recipes 25%'
    ])
  })

  test('1328px: 33/33/33 sits next to 25/75; Ingredients | Recipes with Extra | Explore in equal columns', async ({
    page
  }) => {
    await page.setViewportSize(WIDE)
    await page.goto('/')
    await pickRows(page, DAHL)
    expect(await choices(page)).toEqual([
      'Vertical',
      'Ingredients 50%, Recipes 50%',
      'Ingredients 25%, Recipes 75%',
      THIRDS,
      'Ingredients 75%, Recipes 25%'
    ])
    await chooseLayout(page, '33/33/33')
    expect(await split(page)).toBe('33/33/33')
    await expect(drawer(page)).toHaveCount(0)
    await expect(headerSearch(page)).toHaveCount(0)
    await expect(column(page).getByRole('searchbox')).toBeVisible()
    await expect(exploreHeader(page)).toHaveAttribute('aria-expanded', 'true')
    const ingredients = await box(ingredientsRegion(page))
    const recipes = await box(recipesRegion(page))
    const extra = await box(extraRegion(page))
    const third = await box(column(page))
    expect(recipes.x).toBeGreaterThan(ingredients.x)
    expect(third.x).toBeGreaterThan(recipes.x)
    expect(Math.abs(extra.x - recipes.x)).toBeLessThan(2)
    expect(extra.y).toBeGreaterThan(recipes.y)
    for (const width of [recipes.width, third.width])
      expect(Math.abs(width - ingredients.width)).toBeLessThan(2)
  })

  test('a saved 33/33/33 shows as 50/50 at 1327px and comes back at 1328px, and after a reload', async ({
    page
  }) => {
    await page.setViewportSize(WIDE)
    await page.goto('/')
    await chooseLayout(page, '33/33/33')
    await page.setViewportSize(NARROW)
    await expect.poll(() => split(page)).toBe('50/50')
    await expect(column(page)).toHaveCount(0)
    await expect(headerSearch(page)).toBeVisible()
    await expect(page.getByRole('main').locator('#explore')).toBeVisible()
    await page.reload()
    await expect.poll(() => split(page)).toBe('50/50')
    await page.setViewportSize(WIDE)
    await expect.poll(() => split(page)).toBe('33/33/33')
    await expect(column(page)).toHaveCount(1)
  })

  test('1327px: X collapses Explore to its header row, which stays and expands it again', async ({
    page
  }) => {
    await page.setViewportSize(NARROW)
    await page.goto('/')
    await hideX(page).click()
    await expect(explore(page)).toBeVisible()
    await expect(exploreHeader(page)).toHaveAttribute('aria-expanded', 'false')
    await expect(exploreHeader(page)).toBeFocused()
    await expect(exploreRow(page, DAHL)).toBeHidden()
    await exploreHeader(page).click()
    await expect(exploreHeader(page)).toHaveAttribute('aria-expanded', 'true')
    await expect(exploreRow(page, DAHL)).toBeVisible()
  })

  test('1328px: X collapses the drawer to its strip, Explore still on the page; the strip expands it', async ({
    page
  }) => {
    await page.setViewportSize(WIDE)
    await page.goto('/')
    await hideX(page).click()
    await expect(rail(page)).toBeFocused()
    await expect(rail(page)).toHaveAttribute('aria-expanded', 'false')
    await expect
      .poll(async () => (await box(drawer(page))).width)
      .toBeLessThan(80)
    await expect(exploreEl(page)).toHaveCount(1)
    await rail(page).click()
    await expect(exploreHeader(page)).toHaveAttribute('aria-expanded', 'true')
    await expect(drawer(page).getByRole('searchbox')).toBeFocused()
  })

  test('1328px with 33/33/33: X collapses Explore to its header row in the column', async ({
    page
  }) => {
    await page.setViewportSize(WIDE)
    await page.goto('/')
    await chooseLayout(page, '33/33/33')
    await hideX(page).click()
    await expect(column(page).locator('#explore')).toBeVisible()
    await expect(exploreHeader(page)).toHaveAttribute('aria-expanded', 'false')
    await exploreHeader(page).click()
    await expect(exploreHeader(page)).toHaveAttribute('aria-expanded', 'true')
  })

  for (const size of [NARROW, WIDE]) {
    test(`${size.width}px: on load Explore is expanded with nothing selected, collapsed with a selection, and always there`, async ({
      page
    }) => {
      await page.setViewportSize(size)
      await page.goto('/')
      await expect(exploreHeader(page)).toHaveAttribute('aria-expanded', 'true')
      await pickRows(page, DAHL)
      await page.reload()
      await expect(
        recipesRegion(page).getByRole('button', { name: DAHL, exact: true })
      ).toBeVisible()
      await expect(exploreEl(page)).toHaveCount(1)
      await expect(exploreEl(page)).toHaveAttribute('data-expanded', 'false')
      if (size === NARROW) await expect(explore(page)).toBeVisible()
      else await expect(rail(page)).toBeVisible()
    })
  }

  test('the page is at most 1282px wide (--layout-max-width)', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1600, height: 800 })
    await page.goto('/')
    const layout = page.getByRole('main').locator('xpath=..')
    expect((await box(layout)).width).toBe(1282)
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--layout-max-width')
          .trim()
      )
    ).toBe('1282px')
  })
})
