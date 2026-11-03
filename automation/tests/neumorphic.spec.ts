import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import {
  DAHL,
  chevron,
  chip,
  chipToggle,
  ingredientsRegion,
  pickRows,
  recipesRegion,
  row
} from './page'

/*
 * Neumorphic hierarchy: the Recipes section is raised, each recipe row is recessed into it
 * and each chip is raised again. Edges never rely on the shadow alone: every outline is at
 * least 3:1 against the page (WCAG 1.4.11), measured from the computed colours.
 */

type Rgb = readonly [number, number, number]

const rgb = (css: string): Rgb => {
  const [r = 0, g = 0, b = 0] = (css.match(/\d+(\.\d+)?/g) ?? []).map(Number)
  return [r, g, b]
}

const channel = (c: number): number => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

const luminance = ([r, g, b]: Rgb): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

/** WCAG 2.x contrast ratio between two computed colours. */
const contrast = (a: string, b: string): number => {
  const [hi = 0, lo = 0] = [luminance(rgb(a)), luminance(rgb(b))].sort(
    (x, y) => y - x
  )
  return (hi + 0.05) / (lo + 0.05)
}

const css = (l: Locator, property: string) =>
  l.evaluate(
    (el, name) => getComputedStyle(el).getPropertyValue(name),
    property
  )

/** The raised section's outline and shadow are drawn on its ::before. */
const outlineCss = (l: Locator, property: string) =>
  l.evaluate(
    (el, name) => getComputedStyle(el, '::before').getPropertyValue(name),
    property
  )

const pageBackground = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor)

const recipeItem = (page: Page) =>
  recipesRegion(page)
    .getByRole('listitem')
    .filter({ has: page.getByRole('button', { name: DAHL, exact: true }) })

/** Shows the dahl's chips in its Recipes row. */
const openDahl = async (page: Page) => {
  await recipesRegion(page)
    .getByRole('button', { name: `${DAHL} details` })
    .click()
  await expect(chip(page, 'tomato', 'row-dahl')).toBeVisible()
}

const SCHEMES = ['light', 'dark'] as const

test.describe('neumorphic hierarchy', () => {
  for (const scheme of SCHEMES) {
    test(`${scheme}: raised section, recessed rows, raised chips, each with a 3:1 edge`, async ({
      page
    }) => {
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto('/')
      await pickRows(page, DAHL)
      await openDahl(page)
      const bg = await pageBackground(page)

      const section = recipesRegion(page)
      expect(await outlineCss(section, 'box-shadow')).not.toBe('none')
      expect(await outlineCss(section, 'box-shadow')).not.toContain('inset')
      expect(await outlineCss(section, 'background-color')).toBe(
        'rgba(0, 0, 0, 0)'
      )
      expect(await outlineCss(section, 'background-image')).toBe('none')
      await expect(section).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      expect(
        contrast(await outlineCss(section, 'border-top-color'), bg)
      ).toBeGreaterThanOrEqual(3)
      expect(await outlineCss(section, 'border-top-width')).toBe('1px')

      const item = recipeItem(page)
      expect(await css(item, 'box-shadow')).toContain('inset')
      await expect(item).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      expect(
        contrast(await css(item, 'border-top-color'), bg)
      ).toBeGreaterThanOrEqual(3)

      for (const c of [
        chip(page, 'tomato'),
        chip(page, 'tomato', 'row-dahl')
      ]) {
        expect(await css(c, 'box-shadow')).not.toBe('none')
        expect(await css(c, 'box-shadow')).not.toContain('inset')
        await expect(c).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
        await expect(c).toHaveCSS('background-image', 'none')
        expect(
          contrast(await css(c, 'border-top-color'), bg)
        ).toBeGreaterThanOrEqual(3)
        expect(contrast(await css(c, 'color'), bg)).toBeGreaterThanOrEqual(4.5)
      }
    })
  }

  test('Ingredients keeps its section outline as it was', async ({ page }) => {
    await page.goto('/')
    await pickRows(page, DAHL)
    const ingredients = ingredientsRegion(page)
    expect(await css(ingredients, 'box-shadow')).toBe('none')
    expect(await outlineCss(ingredients, 'content')).toBe('none')
  })

  test('chips, their chevrons and recipe rows show a clear focus ring', async ({
    page
  }) => {
    await page.goto('/')
    await pickRows(page, DAHL)
    await openDahl(page)
    const bg = await pageBackground(page)
    for (const target of [
      chipToggle(page, 'tomato'),
      chevron(page, 'tomato'),
      chipToggle(page, 'tomato', 'row-dahl'),
      row(page, DAHL)
    ]) {
      /* reach it from the keyboard, so React Aria shows its focus-visible ring */
      await target.focus()
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Tab')
      await expect(target).toBeFocused()
      const visible =
        (await target.evaluate((el) => el.tagName)) === 'INPUT'
          ? target.locator('xpath=..')
          : target
      if (visible === target) {
        await expect(target).toHaveAttribute('data-focus-visible', 'true')
      }
      await expect(visible).toHaveCSS('outline-style', 'solid')
      await expect(visible).toHaveCSS('outline-width', '3px')
      expect(
        contrast(await css(visible, 'outline-color'), bg)
      ).toBeGreaterThanOrEqual(3)
    }
  })
})
