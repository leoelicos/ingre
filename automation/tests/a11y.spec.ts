import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import {
  DAHL,
  chevron,
  explore,
  openExplore,
  pickRows,
  searchBox
} from './page'

/* #223: the accessibility baseline. Core loop: labelled inputs, focus rings, contrast,
   names on actions, keyboard operability and reduced motion (WCAG 2.2 AA). */

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/** Axe over the whole page, including colour contrast (jsdom cannot check it). */
const violations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  return results.violations.map((v) => ({
    id: v.id,
    targets: v.nodes.map((n) => n.target.join(' '))
  }))
}

const SCHEMES = ['light', 'dark'] as const

test.describe('axe: no violations along the core loop (#223)', () => {
  for (const scheme of SCHEMES) {
    test.describe(`${scheme} mode`, () => {
      test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme })
        await page.goto('/')
      })

      test('the empty page, with Explore open', async ({ page }) => {
        await openExplore(page)
        expect(await violations(page)).toEqual([])
      })

      test('searching ingredients and recipes', async ({ page }) => {
        await searchBox(page).fill('carrot')
        await expect(
          explore(page)
            .getByRole('button', { name: /^Add carrot/i })
            .first()
        ).toBeVisible()
        expect(await violations(page)).toEqual([])
      })

      test('a picked recipe with its chips and an open chip panel', async ({
        page
      }) => {
        await pickRows(page, DAHL)
        await chevron(page, 'onion').click()
        expect(await violations(page)).toEqual([])
      })

      test('the plus area, a recipe filter and a search result already on the list', async ({
        page
      }) => {
        await pickRows(page, DAHL)
        await page
          .getByRole('button', { name: 'Add an ingredient' })
          .first()
          .click()
        await page
          .getByRole('toolbar', { name: 'Recipes actions' })
          .getByRole('button', { name: /^Filter/ })
          .click()
        expect(await violations(page)).toEqual([])
        await searchBox(page).fill('onion')
        await expect(
          explore(page)
            .getByRole('button', { name: /on your list$/ })
            .first()
        ).toBeVisible()
        expect(await violations(page)).toEqual([])
      })

      for (const path of ['/login', '/signup', '/upgrade', '/nowhere']) {
        test(`${path}`, async ({ page }) => {
          await page.goto(path)
          await expect(page.getByRole('main')).toBeVisible()
          expect(await violations(page)).toEqual([])
        })
      }
    })
  }
})

test.describe('keyboard operability (#223)', () => {
  test('the skip link is the first stop and moves focus to the main landmark', async ({
    page
  }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
  })

  test('search, add an ingredient and pick a recipe without a pointer', async ({
    page
  }) => {
    await page.goto('/')
    await searchBox(page).focus()
    await page.keyboard.type('carrot')
    const add = explore(page)
      .getByRole('button', { name: /^Add carrot/i })
      .first()
    await add.focus()
    await page.keyboard.press('Enter')
    await expect(
      page.locator('[data-scope="extra"][data-chip]').first()
    ).toBeVisible()
    await searchBox(page).fill('')
    await page.keyboard.press('Escape')
    const dahl = explore(page).getByRole('button', { name: DAHL, exact: true })
    await dahl.focus()
    await page.keyboard.press('Space')
    await expect(dahl).toHaveAttribute('aria-pressed', 'true')
  })

  test('every control in the tab order shows a focus ring of at least 3px', async ({
    page
  }) => {
    await page.goto('/')
    const seen: string[] = []
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab')
      const ring = await page.evaluate(() => {
        const el = document.activeElement
        if (el === null || el === document.body) return null
        const style = getComputedStyle(el)
        return {
          name: el.getAttribute('aria-label') ?? el.textContent ?? el.tagName,
          width: Number.parseFloat(style.outlineWidth),
          style: style.outlineStyle
        }
      })
      if (ring === null) break
      seen.push(ring.name)
      expect(ring.style, `${ring.name} has an outline`).not.toBe('none')
      expect(ring.width, `${ring.name} outline width`).toBeGreaterThanOrEqual(3)
    }
    expect(seen.length).toBeGreaterThan(3)
  })
})

test.describe('reduced motion (#223)', () => {
  test('with reduced motion no element transitions or animates', async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await pickRows(page, DAHL)
    const moving = await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .filter((el) => {
          const style = getComputedStyle(el)
          const longest = (list: string) =>
            Math.max(...list.split(',').map((s) => Number.parseFloat(s)))
          return (
            longest(style.transitionDuration) > 0 ||
            longest(style.animationDuration) > 0.0001
          )
        })
        .map((el) => el.tagName.toLowerCase() + '.' + el.className)
    )
    expect(moving).toEqual([])
  })

  test('a transition or animation added later is switched off too', async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const durations = await page.evaluate(() => {
      const el = document.createElement('div')
      el.style.transition = 'opacity 500ms ease-out'
      el.style.animation = 'spin 500ms linear 3'
      document.body.append(el)
      const style = getComputedStyle(el)
      return {
        transition: style.transitionDuration,
        animation: style.animationDuration
      }
    })
    expect(durations.transition).toBe('0s')
    expect(Number.parseFloat(durations.animation)).toBeLessThan(0.001)
  })

  test('without reduced motion a 500 ms transition is left alone', async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    const transition = await page.evaluate(() => {
      const el = document.createElement('div')
      el.style.transition = 'opacity 500ms ease-out'
      document.body.append(el)
      return getComputedStyle(el).transitionDuration
    })
    expect(transition).toBe('0.5s')
  })

  test('without reduced motion the sections still ease open (the rule is only for reduced motion)', async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    const eased = await page.evaluate(() =>
      [...document.querySelectorAll('[data-collapse]')].some(
        (el) => Number.parseFloat(getComputedStyle(el).transitionDuration) > 0
      )
    )
    expect(eased).toBe(true)
  })
})
