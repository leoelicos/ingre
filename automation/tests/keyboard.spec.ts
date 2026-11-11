import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { CURRY, DAHL, openExplore, pickRows, searchBox } from './page'

/* #228 Search placement and keyboard: the search stays high (#192: at the top of the Explore sheet); the bars at the bottom step aside while the keyboard is up. */

/** A visual viewport the test can shorten, as a soft keyboard does (headless browsers have no keyboard). */
const withFakeViewport = (page: Page) =>
  page.addInitScript(() => {
    const viewport = Object.assign(new EventTarget(), {
      height: window.innerHeight
    })
    Object.defineProperty(window, 'visualViewport', {
      value: viewport,
      configurable: true
    })
    window.addEventListener('test-keyboard', (event) => {
      const open = event instanceof CustomEvent && event.detail === true
      viewport.height = open ? window.innerHeight - 320 : window.innerHeight
      viewport.dispatchEvent(new Event('resize'))
    })
  })
const keyboard = (page: Page, open: boolean) =>
  page.evaluate(
    (o) =>
      window.dispatchEvent(new CustomEvent('test-keyboard', { detail: o })),
    open
  )
const nav = (page: Page) =>
  page.getByRole('navigation', { name: 'Main', exact: true })
const scrollDown = (page: Page) =>
  page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
  )

test.describe('search placement and keyboard (#228)', () => {
  /** The search is in the top third of the screen, clear of a keyboard coming up from below. */
  const expectHigh = async (page: Page) => {
    await expect(searchBox(page)).toBeInViewport()
    const box = await searchBox(page).boundingBox()
    const height = page.viewportSize()?.height ?? 0
    expect(box?.y ?? 999).toBeLessThan(height / 3)
  }

  test('however far the page is scrolled, the Explore tab opens the search high on the screen', async ({
    page
  }) => {
    await page.goto('/')
    await pickRows(page, DAHL, CURRY)
    await scrollDown(page)
    await nav(page).getByRole('link', { name: 'Explore' }).click()
    await expect(searchBox(page)).toBeFocused()
    await expectHigh(page)
  })

  test('the bottom bar and Scroll to top step aside while the keyboard is up, and return', async ({
    page
  }) => {
    await withFakeViewport(page)
    await page.goto('/')
    await pickRows(page, DAHL, CURRY)
    await scrollDown(page)
    const toTop = page.getByRole('button', { name: 'Scroll to top' })
    await expect(toTop).toBeVisible()
    await expect(nav(page)).toBeVisible()
    await keyboard(page, true)
    await expect(toTop).toHaveCount(0)
    await expect(nav(page)).toBeHidden()
    await keyboard(page, false)
    await expect(toTop).toBeVisible()
    await expect(nav(page)).toBeVisible()
  })

  test('with the keyboard up the search is still on screen, high', async ({
    page
  }) => {
    await withFakeViewport(page)
    await page.goto('/')
    await openExplore(page)
    await searchBox(page).click()
    await keyboard(page, true)
    await expectHigh(page)
  })
})
