import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, newAccount, signUp, test } from './fixtures'
import {
  DAHL,
  chevron,
  explore,
  fab,
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
        console.log('[a11y] searching for carrot')
        await openExplore(page)
        await searchBox(page).fill('carrot')
        console.log('[a11y] filled search, waiting for Add carrot')
        const add = explore(page)
          .getByRole('button', { name: /^Add carrot/i })
          .first()
        const count = await add.count()
        console.log('[a11y] Add carrot button count', count)
        if (count === 0) console.error('[a11y] no Add carrot button found')
        await expect(add).toBeVisible()
        const v = await violations(page)
        if (v.length) console.error('[a11y] violations', v)
        expect(v).toEqual([])
      })

      test('a picked recipe with its chips and an open chip panel', async ({
        page
      }) => {
        await pickRows(page, DAHL)
        await chevron(page, 'onion').click()
        expect(await violations(page)).toEqual([])
      })

      test('a recipe filter and a search result already on the list', async ({
        page
      }) => {
        await pickRows(page, DAHL)
        await page
          .getByRole('toolbar', { name: 'Recipes actions' })
          .getByRole('button', { name: /^Filter/ })
          .click()
        expect(await violations(page)).toEqual([])
        await openExplore(page)
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
    await fab(page).focus()
    await page.keyboard.press('Enter')
    await expect(searchBox(page)).toBeFocused()
    await page.keyboard.type('carrot')
    const add = explore(page)
      .getByRole('button', { name: /^Add carrot/i })
      .first()
    await add.focus()
    await page.keyboard.press('Enter')
    await expect(
      explore(page)
        .getByRole('button', { name: /^Carrot, on your list/i })
        .first()
    ).toBeVisible()
    await searchBox(page).fill('')
    const dahl = explore(page).getByRole('button', { name: DAHL, exact: true })
    await dahl.focus()
    await page.keyboard.press('Space')
    await expect(dahl).toHaveAttribute('aria-pressed', 'true')
  })

  test('every control in the tab order shows a focus ring of at least 3px', async ({
    page
  }) => {
    console.log('[a11y] focus ring test')
    await page.goto('/')
    const seen: string[] = []
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab')
      const ring = await page.evaluate(() => {
        const el = document.activeElement
        if (el === null || el === document.body) return null
        /* a React Aria slider focuses a visually hidden input and draws the ring on its thumb */
        const ringed = el.closest('[data-focus-visible]') ?? el
        const style = getComputedStyle(ringed)
        return {
          name: el.getAttribute('aria-label') ?? el.textContent ?? el.tagName,
          width: Number.parseFloat(style.outlineWidth),
          style: style.outlineStyle
        }
      })
      console.log('[a11y] focus', i, ring)
      if (ring === null) break
      seen.push(ring.name)
      if (ring.style === 'none' || ring.width < 3)
        console.error('[a11y] bad focus ring', ring)
      expect(ring.style, `${ring.name} has an outline`).not.toBe('none')
      expect(ring.width, `${ring.name} outline width`).toBeGreaterThanOrEqual(3)
    }
    console.log('[a11y] focus ring seen', seen)
    expect(seen.length).toBeGreaterThan(3)
  })
})

/** The outline the focused element draws (the shared focus-ring is 3px solid). */
const focusOutline = (page: Page) =>
  page.evaluate(() => {
    const style = getComputedStyle(document.activeElement as Element)
    return {
      style: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth)
    }
  })

test.describe('the small pages use the shared focus ring and one control per action (#106)', () => {
  test('a missing page: one Go home button with the 3px ring, and it goes home', async ({
    page
  }) => {
    await page.goto('/nowhere')
    const home = page.getByRole('button', { name: 'Go home' })
    await expect(page.getByRole('link', { name: 'Go home' })).toHaveCount(0)
    await home.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(home).toBeFocused()
    expect(await focusOutline(page)).toEqual({ style: 'solid', width: 3 })
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/$/)
  })

  test('logged out, Upgrade asks to log in with a link that has the 3px ring', async ({
    page
  }) => {
    await page.goto('/upgrade')
    const login = page.getByRole('main').getByRole('link', { name: /^Log.in$/ })
    await login.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(login).toBeFocused()
    expect(await focusOutline(page)).toEqual({ style: 'solid', width: 3 })
  })

  test('a payment error offers one Try again button: no axe violations, 3px ring, back to Upgrade', async ({
    page
  }) => {
    await signUp(page, newAccount())
    await page.goto('/success')
    const again = page.getByRole('button', { name: /Try again/ })
    await expect(again).toBeVisible()
    expect(await violations(page)).toEqual([])
    await again.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(again).toBeFocused()
    expect(await focusOutline(page)).toEqual({ style: 'solid', width: 3 })
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/upgrade$/)
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
