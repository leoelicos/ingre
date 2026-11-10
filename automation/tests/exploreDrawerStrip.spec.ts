import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { DAHL, drawer, pickRows, rail, searchBox } from './page'

/*
 * Foldable and tablet plan, PR 1: the collapsed Explore drawer (1328px and up). Its content
 * had both the [hidden] attribute and a `flex` class; the class won, so the 56px strip
 * showed a clipped search box and "Exp…", and screen readers could still reach them.
 * 1376 x 1032 is an iPad Pro 13" in landscape; 1328 is where the drawer starts.
 */

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const violations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  return results.violations.map((v) => ({
    id: v.id,
    targets: v.nodes.map((n) => n.target.join(' '))
  }))
}

const content = (page: Page) => page.locator('#explore-drawer-content')

/** Picks a recipe, then reloads: with something selected the drawer starts as the strip. */
const collapsedStrip = async (page: Page) => {
  await page.goto('/')
  await pickRows(page, DAHL)
  await page.reload()
  await expect(drawer(page)).toHaveAttribute('data-open', 'false')
}

for (const [width, height] of [
  [1376, 1032],
  [1328, 800]
] as const)
  test.describe(`${width} x ${height}: the collapsed Explore strip`, () => {
    test.skip(({ isMobile }) => isMobile, 'sets its own desktop width')
    test.use({ viewport: { width, height } })

    test('shows only its search button: the content is not displayed, nothing overflows', async ({
      page
    }) => {
      await collapsedStrip(page)
      await expect(content(page)).toBeHidden()
      await expect(content(page)).toHaveCSS('display', 'none')
      await expect(rail(page)).toBeVisible()
      const strip = await drawer(page).evaluate((el) => ({
        scroll: el.scrollWidth,
        client: el.clientWidth
      }))
      expect(strip.scroll).toBeLessThanOrEqual(strip.client)
    })

    test('keeps the hidden search box and Explore out of the accessibility tree', async ({
      page
    }) => {
      await collapsedStrip(page)
      await expect(searchBox(page)).toHaveCount(0)
      await expect(
        drawer(page).getByRole('region', { name: 'Explore', exact: true })
      ).toHaveCount(0)
      const tree = await drawer(page).ariaSnapshot()
      expect(tree).not.toContain('searchbox')
      expect(await violations(page)).toEqual([])
    })

    test('the search button opens it: the search box shows, focused, with no axe violations', async ({
      page
    }) => {
      await collapsedStrip(page)
      await rail(page).click()
      await expect(drawer(page)).toHaveAttribute('data-open', 'true')
      await expect(content(page)).toHaveCSS('display', 'flex')
      await expect(searchBox(page)).toBeVisible()
      await expect(searchBox(page)).toBeFocused()
      expect(await violations(page)).toEqual([])
    })
  })
