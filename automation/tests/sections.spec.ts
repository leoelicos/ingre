import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { explore, openExplore, searchBox } from './page'

/* #226 Explore groups or filters by supermarket section, with a colour per section. */

const result = (page: Page, name: string): Locator =>
  explore(page).getByRole('button', { name: `Add ${name}`, exact: true })
const filter = (page: Page): Locator =>
  explore(page).getByRole('group', { name: 'Filter ingredients by section' })
const search = async (page: Page, text: string) => {
  await openExplore(page)
  await searchBox(page).fill(text)
}
/** The hue, in degrees, of the left accent bar. */
const hueOf = (button: Locator): Promise<number> =>
  button.evaluate((el) => {
    const [r = 0, g = 0, b = 0] = (
      getComputedStyle(el).borderLeftColor.match(/\d+/g) ?? []
    ).map(Number)
    const max = Math.max(r, g, b)
    const d = max - Math.min(r, g, b)
    if (d === 0) return 0
    const h =
      max === r
        ? ((g - b) / d) % 6
        : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4
    return (Math.round(h * 60) + 360) % 360
  })

test.describe('Explore sections (#226)', () => {
  test('green is vegetables, orange fruit, pink meat and blue seafood', async ({
    page
  }) => {
    await page.goto('/')
    await search(page, 'a')
    const hue = async (name: string) => hueOf(result(page, name))
    expect(await hue('carrot')).toBeGreaterThan(100)
    expect(await hue('carrot')).toBeLessThan(160)
    expect(await hue('banana')).toBeGreaterThan(15)
    expect(await hue('banana')).toBeLessThan(40)
    const meat = await hue('beef mince')
    expect(meat).toBeGreaterThan(320)
    expect(meat).toBeLessThan(350)
    expect(await hue('cooked prawns')).toBeGreaterThan(200)
    expect(await hue('cooked prawns')).toBeLessThan(230)
  })

  test('toggling a section narrows the results to it, and toggling it off brings them all back', async ({
    page
  }) => {
    await page.goto('/')
    await search(page, 'a')
    const all = await explore(page).locator('[data-section]').count()
    const fruit = filter(page).getByRole('button', {
      name: 'Fruit',
      exact: true
    })
    await fruit.click()
    await expect(fruit).toHaveAttribute('aria-pressed', 'true')
    await expect(result(page, 'banana')).toBeVisible()
    await expect(result(page, 'carrot')).toHaveCount(0)
    await expect(explore(page).locator('[data-section]')).not.toHaveCount(all)
    await fruit.click()
    await expect(explore(page).locator('[data-section]')).toHaveCount(all)
  })

  test('the section toggles are reachable by keyboard and tall enough to tap', async ({
    page
  }) => {
    await page.goto('/')
    await search(page, 'a')
    const seafood = filter(page).getByRole('button', {
      name: 'Seafood',
      exact: true
    })
    await seafood.focus()
    await page.keyboard.press('Space')
    await expect(seafood).toHaveAttribute('aria-pressed', 'true')
    await expect(result(page, 'cooked prawns')).toBeVisible()
    await expect(result(page, 'banana')).toHaveCount(0)
    const box = await seafood.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })
})
