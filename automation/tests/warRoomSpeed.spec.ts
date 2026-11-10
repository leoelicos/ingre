import { writeFileSync } from 'fs'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

/*
 * t30u speed run: 40 likely items in two minutes (one every 3 s). Each is tapped on the wall
 * when it is on the first screen, else found with its first two letters and tapped. Every
 * add must register, nothing on the wall may move between taps (searches included), and tap-to-feedback (pointer
 * down to the tile saying "on list") must be far under 3 s.
 */

const SHOP = [
  'banana',
  'full-cream-milk',
  'egg',
  'white-bread',
  'apple',
  'butter',
  'onion',
  'potato',
  'tomato',
  'carrot',
  'cheddar',
  'chicken-breast',
  'beef-mince',
  'garlic',
  'avocado',
  'broccoli',
  'lemon',
  'mandarin',
  'strawberries',
  'greek-yoghurt',
  'cucumber',
  'coffee',
  'tea-bags',
  'wholemeal-bread',
  'orange',
  'bacon',
  'sliced-ham',
  'salad-mix',
  'spaghetti',
  'jasmine-rice',
  'blueberries',
  'zucchini',
  'mushrooms',
  'capsicum',
  'baby-spinach',
  'honey',
  'peanut-butter',
  'rolled-oats',
  'crushed-tomatoes',
  'olive-oil'
]

const search = (page: Page) =>
  page.getByRole('searchbox', {
    name: 'Search, type or paste a list',
    exact: true
  })

const wallBoxes = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-tile]')].map((el) => {
      const r = el.getBoundingClientRect()
      return `${el.dataset['tileId']}:${Math.round(r.x)},${Math.round(
        r.y
      )},${Math.round(r.width)}x${Math.round(r.height)}`
    })
  )

/** Marks the copy of a tile a thumb can hit without scrolling (on screen, not under a bar or the nav). */
const markOnScreen = (page: Page, id: string) =>
  page.evaluate((tileId) => {
    document
      .querySelectorAll('[data-speed]')
      .forEach((el) => el.removeAttribute('data-speed'))
    if (window.scrollY !== 0) return false
    const nav =
      document.querySelector('nav[aria-label="Main"]')?.getBoundingClientRect()
        .top ?? innerHeight
    for (const el of document.querySelectorAll<HTMLElement>(
      `[data-tile-id="${tileId}"]`
    )) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.top < 0 || r.bottom > nav) continue
      const hit = document.elementFromPoint(
        r.left + r.width / 2,
        r.top + r.height / 2
      )
      if (hit !== null && el.contains(hit)) {
        el.setAttribute('data-speed', '')
        return true
      }
    }
    return false
  }, id)

const namesOf = (page: Page) =>
  page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll<HTMLElement>('[data-tile-id]')].map(
        (el) => [
          el.dataset['tileId'],
          (el.getAttribute('aria-label') ?? '')
            .replace(/^Add /, '')
            .replace(/,.*$/, '')
        ]
      )
    )
  )

const armTimer = (page: Page, id: string) =>
  page.evaluate((tileId) => {
    const w = window as unknown as { __tap: { down: number; seen: number } }
    w.__tap = { down: 0, seen: 0 }
    addEventListener('pointerdown', () => (w.__tap.down = performance.now()), {
      capture: true,
      once: true
    })
    const watch = new MutationObserver(() => {
      const el = document.querySelector(`[data-tile-id="${tileId}"]`)
      if (
        el?.getAttribute('aria-label')?.includes('on list') === true &&
        w.__tap.seen === 0
      ) {
        w.__tap.seen = performance.now()
        watch.disconnect()
      }
    })
    watch.observe(document.body, {
      subtree: true,
      attributes: true,
      childList: true
    })
  }, id)

const elapsed = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __tap: { down: number; seen: number } }
    return w.__tap.seen - w.__tap.down
  })

const shop = async (page: Page, design: string, visit: string) => {
  const names = await namesOf(page)
  const started = Date.now()
  const times: number[] = []
  const viaSearch: string[] = []
  let moved = 0
  for (const id of SHOP) {
    const before = await wallBoxes(page)
    const direct = await markOnScreen(page, id)
    let tile = page.locator('[data-speed]')
    if (!direct) {
      viaSearch.push(id)
      const letters = (names[id] ?? id).toLowerCase().replace(/[^a-z]/g, '')
      await search(page).click()
      await page.keyboard.type(letters.slice(0, 2))
      tile = page.locator(`#war-room-wall [data-tile-id="${id}"]`)
      if ((await tile.count()) === 0)
        await page.keyboard.type(letters.slice(2, 3))
      await expect(tile).toHaveCount(1)
    }
    await armTimer(page, id)
    await tile.click()
    await expect(
      page.locator(`[data-tile-id="${id}"]`).first()
    ).toHaveAttribute('aria-label', /on list/)
    times.push(await elapsed(page))
    if ((await wallBoxes(page)).join('|') !== before.join('|')) moved += 1
  }
  const sorted = [...times].sort((a, b) => a - b)
  const result = {
    design,
    visit,
    adds: SHOP.length,
    totalMs: Date.now() - started,
    medianFeedbackMs: Math.round(sorted[Math.floor(sorted.length / 2)] ?? 0),
    maxFeedbackMs: Math.round(sorted[sorted.length - 1] ?? 0),
    scrolls: 0,
    neededSearch: viaSearch.length,
    searched: viaSearch,
    wallMovedAfterTap: moved
  }
  const extras = await page.evaluate(
    () => JSON.parse(localStorage.getItem('ingre.list.extras') ?? '[]').length
  )
  expect(extras).toBe(SHOP.length)
  expect(moved).toBe(0)
  expect(result.maxFeedbackMs).toBeLessThan(1000)
  return result
}

for (const design of ['a', 'b', 'c'] as const) {
  test(`speed run, design ${design}: 40 adds, nothing moves, feedback fast`, async ({
    page
  }, info) => {
    test.skip(info.project.name !== 'mobile')
    test.setTimeout(240_000)
    await page.goto(`/war-room?design=${design}`)
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    const first = await shop(page, design, 'first')
    /* next week: same shop, the wall has re-sorted from history on this new visit */
    await page.evaluate(() => localStorage.removeItem('ingre.list.extras'))
    await page.reload()
    const again = await shop(page, design, 'returning')
    writeFileSync(
      `/workspace/warroom-speed-${design}.json`,
      JSON.stringify([first, again], null, 2)
    )
  })
}
