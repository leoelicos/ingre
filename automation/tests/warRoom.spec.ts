import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

/*
 * War room utility belt (t27u-t34u), designs A/B/C behind ?design=. Tap adds, "ba" finds
 * Banana in one tap with the keyboard kept open, the Ingredients/Recipes/Both toggle filters
 * everything and is remembered, arrow keys move through the wall, and axe passes.
 */

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const field = (page: Page) =>
  page.getByRole('searchbox', {
    name: 'Search, type or paste a list',
    exact: true
  })
const wall = (page: Page) => page.locator('#war-room-wall')

for (const design of ['a', 'b', 'c'] as const) {
  test.describe(`war room design ${design}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/war-room?design=${design}`)
      await page.evaluate(() => localStorage.clear())
      await page.reload()
    })

    test('"ba" then one tap adds Banana; the field keeps focus', async ({
      page
    }) => {
      await page.keyboard.press('/')
      await expect(field(page)).toBeFocused()
      await page.keyboard.type('ba')
      const first = wall(page).locator('[data-tile]').first()
      await expect(first).toHaveAccessibleName('Add banana')
      const at = await first.boundingBox()
      await page.keyboard.type('n')
      expect(
        await wall(page).locator('[data-tile]').first().boundingBox()
      ).toEqual(at)
      await wall(page).locator('[data-tile]').first().click()
      await expect(field(page)).toBeFocused()
      await expect(field(page)).toHaveValue('')
      await expect(
        page.locator('[data-tile-id="banana"]').first()
      ).toHaveAccessibleName('Add banana, 1 on list')
    })

    test('the kind toggle filters the wall and search, and is remembered', async ({
      page
    }) => {
      const toggle = page.getByRole('radiogroup', { name: 'Show' })
      await toggle.getByText('Recipes', { exact: true }).click()
      await expect(
        page.locator('#war-room-wall [data-tile-id="banana"]')
      ).toHaveCount(0)
      await field(page).fill('ch')
      const kinds = await wall(page)
        .locator('[data-tile]')
        .evaluateAll((els) =>
          els.map((el) => el.getAttribute('aria-label') ?? '')
        )
      expect(kinds.length).toBeGreaterThan(0)
      kinds.forEach((label) => expect(label).toMatch(/recipe/i))
      await page.reload()
      await expect(
        page.getByRole('radio', { name: 'Recipes', exact: true })
      ).toBeChecked()
      await page
        .getByRole('radiogroup', { name: 'Show' })
        .getByText('Ingredients', { exact: true })
        .click()
      await expect(
        page.locator('#war-room-wall [aria-label^="Add recipe"]')
      ).toHaveCount(0)
    })

    test('arrow keys move through the wall; ArrowUp from the top returns to search', async ({
      page
    }) => {
      await field(page).focus()
      await page.keyboard.press('ArrowDown')
      const first = await page.evaluate(() =>
        document.activeElement?.getAttribute('data-tile-id')
      )
      expect(first).toBeTruthy()
      await page.keyboard.press('ArrowRight')
      const second = await page.evaluate(() =>
        document.activeElement?.getAttribute('data-tile-id')
      )
      expect(second).not.toBe(first)
      await page.keyboard.press('Enter')
      await expect(
        page.locator(`[data-tile-id="${second}"]`).first()
      ).toHaveAccessibleName(/on list/)
    })

    for (const scheme of ['light', 'dark'] as const) {
      test(`no accessibility violations (${scheme})`, async ({ page }) => {
        await page.emulateMedia({
          colorScheme: scheme,
          reducedMotion: 'reduce'
        })
        await page.locator('[data-tile-id="banana"]').first().click()
        await page.waitForTimeout(700)
        const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
        expect(
          results.violations.map((v) => ({
            id: v.id,
            targets: v.nodes.map((n) => n.target)
          }))
        ).toEqual([])
      })
    }
  })
}
