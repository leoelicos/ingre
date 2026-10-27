import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { chooseLayout, layoutToggle } from './page'

/*
 * #193: 25/75 and 75/25 are offered only from 1328px, with the Explore drawer and 33/33/33.
 * Below 1328px the toggle offers vertical and 50/50; a saved 25/75 or 75/25 shows as 50/50
 * there and comes back, selected, when the window is 1328px wide again.
 * The widths are set per test, so the phone project skips these.
 */

const HEIGHT = 800
const VERTICAL = 'Vertical'
const HALVES = 'Ingredients 50%, Recipes 50%'
const QUARTER = 'Ingredients 25%, Recipes 75%'
const THIRDS = 'Ingredients 33%, Recipes 33%, Explore 33%'
const THREE_QUARTERS = 'Ingredients 75%, Recipes 25%'
const TWO = [VERTICAL, HALVES]
const ALL = [VERTICAL, HALVES, QUARTER, THIRDS, THREE_QUARTERS]

const resize = (page: Page, width: number) =>
  page.setViewportSize({ width, height: HEIGHT })
const split = (page: Page) =>
  page.locator('[data-split]').getAttribute('data-split')
const radio = (page: Page, name: string) =>
  layoutToggle(page).getByRole('radio', { name, exact: true })
/** The toggle's choices, in order, by accessible name; only the visible ones. */
const visibleChoices = (page: Page) =>
  layoutToggle(page)
    .locator('label')
    .filter({ visible: true })
    .getByRole('radio')
    .evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')))

test.describe('25/75 and 75/25 from 1328px (#193)', () => {
  test.skip(({ isMobile }) => isMobile, 'sets its own desktop widths')

  for (const width of [991, 1100, 1327])
    test(`${width}px: the toggle shows only vertical and 50/50`, async ({
      page
    }) => {
      await resize(page, width)
      await page.goto('/')
      await expect(layoutToggle(page)).toBeVisible()
      await expect.poll(() => visibleChoices(page)).toEqual(TWO)
      await expect(radio(page, QUARTER)).toHaveCount(0)
      await expect(radio(page, THREE_QUARTERS)).toHaveCount(0)
    })

  test('1328px: the toggle shows all five, in order', async ({ page }) => {
    await resize(page, 1328)
    await page.goto('/')
    await expect.poll(() => visibleChoices(page)).toEqual(ALL)
  })

  for (const [text, name] of [
    ['25/75', QUARTER],
    ['75/25', THREE_QUARTERS]
  ] as const)
    test(`a saved ${text} falls back to 50/50 at 1100px and comes back, selected, at 1328px`, async ({
      page
    }) => {
      await resize(page, 1328)
      await page.goto('/')
      await chooseLayout(page, text)
      await expect.poll(() => split(page)).toBe(text)
      await resize(page, 1100)
      await expect.poll(() => split(page)).toBe('50/50')
      await expect(radio(page, name)).toHaveCount(0)
      await expect(radio(page, HALVES)).toBeChecked()
      await resize(page, 1328)
      await expect.poll(() => split(page)).toBe(text)
      await expect(radio(page, name)).toBeChecked()
    })
})
