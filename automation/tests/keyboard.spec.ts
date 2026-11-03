import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import {
  CURRY,
  DAHL,
  pickRows,
  recipesRegion,
  searchBox,
  useVertical
} from './page'

/* #228 Search placement and keyboard: the search stays high; the bars at the bottom step aside while the keyboard is up. */

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
  test('the search stays at the top of the screen however far the page is scrolled', async ({
    page
  }) => {
    await page.goto('/')
    await useVertical(page)
    await pickRows(page, DAHL, CURRY)
    await scrollDown(page)
    await expect(searchBox(page)).toBeInViewport()
    const box = await searchBox(page).boundingBox()
    expect(box?.y ?? 999).toBeLessThan(80)
  })

  test('the bottom bar and Scroll to top step aside while the keyboard is up, and return', async ({
    page
  }) => {
    await withFakeViewport(page)
    await page.goto('/')
    await useVertical(page)
    await pickRows(page, DAHL, CURRY)
    for (const title of [DAHL, CURRY])
      await recipesRegion(page)
        .getByRole('button', { name: `${title} details` })
        .click()
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
    await searchBox(page).click()
    await keyboard(page, true)
    await expect(searchBox(page)).toBeInViewport()
    const box = await searchBox(page).boundingBox()
    expect(box?.y ?? 999).toBeLessThan(80)
  })
})
