import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { box, ingredientsRegion, layoutToggle, recipesRegion } from './page'

/* #192: Recipes and Ingredients. Stacked below 576px, 50/50 from 576px. No layout toggle. */

const workspace = (page: Page) => page.locator('[data-workspace]')

test.describe('workspace layout (#192)', () => {
  test('below 576px: Recipes above Ingredients, no layout toggle', async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await page.goto('/')
    await expect(layoutToggle(page)).toHaveCount(0)
    await expect(workspace(page)).toBeVisible()
    const recipes = await box(recipesRegion(page))
    const ingredients = await box(ingredientsRegion(page))
    expect(recipes.y).toBeLessThan(ingredients.y)
    expect(recipes.x).toBe(ingredients.x)
  })

  test('from 576px: Recipes on the left, Ingredients on the right, about 50/50', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await page.goto('/')
    await expect(layoutToggle(page)).toHaveCount(0)
    const recipes = await box(recipesRegion(page))
    const ingredients = await box(ingredientsRegion(page))
    expect(recipes.x).toBeLessThan(ingredients.x)
    expect(Math.abs(recipes.y - ingredients.y)).toBeLessThan(8)
    const share = ingredients.width / (ingredients.width + recipes.width)
    expect(share).toBeCloseTo(0.5, 1)
  })
})
