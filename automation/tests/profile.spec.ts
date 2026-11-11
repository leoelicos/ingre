import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { explore, openExplore, pickRows } from './page'
import { FIRST_A_TO_Z } from './library'

/* #224 Customer profiling: Explore ranks recipes against what the user selects, buys and keeps. */

const EGG_RICE = 'Egg fried rice'
const KEEMA = 'Beef keema with peas'
const DAHL = 'Red lentil dahl'
const SETTINGS_KEY = 'ingre.profile.settings'

const browse = (page: Page): Locator =>
  explore(page)
    .locator('div')
    .filter({
      has: page.getByRole('heading', {
        level: 3,
        name: 'Browse recipes',
        exact: true
      })
    })
    .last()
const browseNames = (page: Page) =>
  browse(page)
    .getByRole('button', { name: /^See recipe: / })
    .evaluateAll((els) =>
      els.map((el) =>
        (el.getAttribute('aria-label') ?? '').replace('See recipe: ', '')
      )
    )
/** Settings kept on the device, set before the page loads. */
const withSettings = (page: Page, settings: Record<string, unknown>) =>
  page.addInitScript(
    ({ key, value }) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, value)
    },
    { key: SETTINGS_KEY, value: JSON.stringify(settings) }
  )

test.describe('customer profile (#224)', () => {
  test('browse is A to Z until the list says what you like, then leads with what you have picked', async ({
    page
  }) => {
    await page.goto('/')
    await openExplore(page)
    const before = await browseNames(page)
    expect(before[0]).toBe(FIRST_A_TO_Z)
    expect(before).toEqual([...before].sort((a, b) => a.localeCompare(b)))
    await pickRows(page, EGG_RICE)
    /* ticking a row does not reshuffle the rows under your finger */
    await openExplore(page)
    expect(await browseNames(page)).toEqual(before)
    await page.reload()
    await openExplore(page)
    const after = await browseNames(page)
    expect(after[0]).toBe(EGG_RICE)
    expect([...after].sort()).toEqual([...before].sort())
  })

  test('an explicit dislike beats what you have picked', async ({ page }) => {
    await withSettings(page, { dislikes: ['beef'] })
    await page.goto('/')
    await pickRows(page, KEEMA)
    await page.reload()
    await openExplore(page)
    const names = await browseNames(page)
    expect(names.indexOf(KEEMA)).toBeGreaterThan(names.indexOf(DAHL))
  })

  test('a diet lock hides every recipe it rules out, whatever you like', async ({
    page
  }) => {
    await withSettings(page, {
      diet: 'vegetarian',
      likes: ['beef', 'poultry', 'pork']
    })
    await page.goto('/')
    await openExplore(page)
    const names = await browseNames(page)
    expect(names).toContain(DAHL)
    expect(names.join('|')).not.toMatch(/beef|chicken|pork|prawn/i)
  })

  test('an allergen lock hides recipes with it, and searching does not bring them back', async ({
    page
  }) => {
    await withSettings(page, { allergens: ['milk'] })
    await page.goto('/')
    await openExplore(page)
    const names = await browseNames(page)
    expect(names).not.toContain('Butter chicken')
    expect(names).not.toContain(DAHL)
    expect(names).toContain(KEEMA)
    await page.getByRole('searchbox').fill('butter chicken')
    await expect(
      explore(page).getByRole('button', { name: 'Butter chicken', exact: true })
    ).toHaveCount(0)
  })
})
