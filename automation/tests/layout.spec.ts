import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import {
  DAHL,
  box,
  chooseLayout,
  ingredientsRegion,
  layoutToggle,
  pageTop,
  pickRows,
  recipesRegion,
  section
} from './page'

/* #181 Layout: mobile-first; stacked below 576px, side by side from 576px, more splits from 992px. */

const split = (page: Page) =>
  page.locator('[data-split]').getAttribute('data-split')
const choices = (page: Page) =>
  layoutToggle(page)
    .getByRole('radio')
    .evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')))
const widthShare = async (page: Page) => {
  const ingredients = await box(ingredientsRegion(page))
  const recipes = await box(recipesRegion(page))
  return ingredients.width / (ingredients.width + recipes.width)
}

test.describe('layout (#181)', () => {
  test('below 576px: stacked only, with no layout toggle', async ({ page }) => {
    await page.setViewportSize({ width: 575, height: 800 })
    await page.goto('/')
    expect(await split(page)).toBe('vertical')
    await expect(layoutToggle(page)).toHaveCount(0)
    const ingredients = await box(ingredientsRegion(page))
    expect(await pageTop(recipesRegion(page))).toBeGreaterThan(
      (await pageTop(ingredientsRegion(page))) + ingredients.height - 1
    )
  })

  test('from 576px: side by side, 50/50 by default; the toggle offers vertical and 50/50', async ({
    page
  }) => {
    await page.setViewportSize({ width: 576, height: 800 })
    await page.goto('/')
    expect(await split(page)).toBe('50/50')
    expect(await choices(page)).toEqual([
      'Vertical',
      'Ingredients 50%, Recipes 50%'
    ])
    expect(
      Math.abs(
        (await pageTop(ingredientsRegion(page))) -
          (await pageTop(recipesRegion(page)))
      )
    ).toBeLessThan(2)
    expect((await box(recipesRegion(page))).x).toBeGreaterThan(
      (await box(ingredientsRegion(page))).x
    )
    expect(await widthShare(page)).toBeCloseTo(0.5, 1)
    await chooseLayout(page, 'Vertical')
    expect(await split(page)).toBe('vertical')
  })

  test('from 992px: the toggle also offers 25/75 and 75/25, and 25/75 gives Ingredients a quarter', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    expect(await choices(page)).toEqual([
      'Vertical',
      'Ingredients 50%, Recipes 50%',
      'Ingredients 25%, Recipes 75%',
      'Ingredients 75%, Recipes 25%'
    ])
    await chooseLayout(page, '25/75')
    expect(await split(page)).toBe('25/75')
    expect(await widthShare(page)).toBeCloseTo(0.25, 1)
    await chooseLayout(page, '75/25')
    expect(await widthShare(page)).toBeCloseTo(0.75, 1)
  })

  test('the toggle sits above the sections, aligned right', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    const toggle = await box(layoutToggle(page))
    const recipes = await box(recipesRegion(page))
    expect(
      (await pageTop(layoutToggle(page))) + toggle.height
    ).toBeLessThanOrEqual(await pageTop(ingredientsRegion(page)))
    expect(
      Math.abs(toggle.x + toggle.width - (recipes.x + recipes.width))
    ).toBeLessThan(2)
  })

  test('the preferred split comes back when the width drops below 992px and grows again', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await chooseLayout(page, '25/75')
    await page.setViewportSize({ width: 800, height: 800 })
    await expect.poll(() => split(page)).toBe('50/50')
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect.poll(() => split(page)).toBe('25/75')
    // and it is saved on the device
    await page.reload()
    await expect.poll(() => split(page)).toBe('25/75')
  })

  test('collapse buttons exist only in the vertical layout', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await pickRows(page, DAHL)
    await expect(section(page, 'Ingredients')).toHaveCount(0)
    await expect(section(page, 'Recipes')).toHaveCount(0)
    await chooseLayout(page, 'Vertical')
    await expect(section(page, 'Ingredients')).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    await expect(section(page, 'Recipes')).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    await page.setViewportSize({ width: 390, height: 800 })
    await expect(section(page, 'Ingredients')).toHaveCount(1)
  })
})
