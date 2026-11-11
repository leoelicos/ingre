import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { DAHL, exploreRow, openExplore, pickRows, searchBox } from './page'

/* #222 Analytics events: named core-loop events, logged on this device only. */

const LOG_KEY = 'ingre.analytics.events'

interface Logged {
  name: string
  at: string
  props: Record<string, string | number | boolean>
}

const logged = (page: Page): Promise<Logged[]> =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]'), LOG_KEY)

test.describe('Analytics events (#222)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('a settled search logs ingredient_searched once, with what it matched', async ({
    page
  }) => {
    await openExplore(page)
    await searchBox(page).fill('dahl')
    await expect.poll(() => logged(page).then((l) => l.length)).toBe(1)
    const [event] = await logged(page)
    expect(event?.name).toBe('ingredient_searched')
    expect(event?.props['query']).toBe('dahl')
    expect(event?.props['recipes']).toBeGreaterThan(0)
    expect(Date.parse(event?.at ?? '')).not.toBeNaN()
  })

  test('adding a recipe logs ticket_added with its id; removing it logs nothing', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const [event] = await logged(page)
    expect(event).toMatchObject({
      name: 'ticket_added',
      props: { recipeId: 'dahl' }
    })
    await openExplore(page)
    await exploreRow(page, DAHL).click()
    expect(await logged(page)).toHaveLength(1)
  })

  test('the log stays on this device: no request leaves localhost', async ({
    page,
    outsideRequests
  }) => {
    await pickRows(page, DAHL)
    await openExplore(page)
    await searchBox(page).fill('onion')
    await expect.poll(() => logged(page).then((l) => l.length)).toBe(2)
    expect(outsideRequests).toEqual([])
  })
})
