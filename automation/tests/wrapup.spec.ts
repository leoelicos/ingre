import type { Page } from '@playwright/test'
import { expect, newAccount, signUp, test } from './fixtures'
import { DAHL, chevron, pickRows } from './page'
import { urls } from './env'

/* #178 wrap-up: self-hosted fonts (#176), no Bootstrap classes (#170), Skip to content (#131), analytics in production only (#177). */

const GOOGLE_FONTS = /fonts\.(googleapis|gstatic)\.com/
const ANALYTICS = /_vercel\/insights|va\.vercel-scripts\.com/

/** Class names that only make sense with Bootstrap (the same list as client noBootstrapClasses.test.ts). */
const BOOTSTRAP =
  /^(btn(-[a-z-]+)?|container(-fluid)?|row|col(-(sm|md|lg|xl|xxl))?(-(\d{1,2}|auto))?|form-(control|label|group|check(-[a-z-]+)?|select|text|floating|range)|input-group(-[a-z-]+)?|d-(sm-|md-|lg-|xl-)?(none|inline|inline-block|block|flex|inline-flex|grid|table)|(justify-content|align-items|align-self|align-content)-[a-z]+|card-(body|title|text|header|footer|img(-[a-z]+)?)|navbar(-[a-z-]+)?|nav-(link|item|tabs|pills)|list-group(-[a-z-]+)?|alert-[a-z]+|text-muted|fw-[a-z]+|[mp][se]-\d|img-fluid|[wh]-100|visually-hidden(-focusable)?|modal(-[a-z]+)?|dropdown(-[a-z]+)?|spinner-(border|grow)|text-(start|end)|float-(start|end))$/

/** The removed Bootstrap-era selectors (#170). */
const REMOVED_SELECTORS =
  /\.(btn|btn-primary|ingre-btn-outline|add-item__button|list-group[a-z-]*)(?![\w-])/

/** Every class name on the page right now. */
const classesOn = (page: Page): Promise<string[]> =>
  page.evaluate(() =>
    Array.from(
      new Set(
        Array.from(document.querySelectorAll('[class]')).flatMap((el) =>
          Array.from(el.classList)
        )
      )
    )
  )

/** Every CSS selector the page's stylesheets define. */
const selectorsOn = (page: Page): Promise<string[]> =>
  page.evaluate(() =>
    Array.from(document.styleSheets).flatMap((sheet) =>
      Array.from(sheet.cssRules).map((rule) =>
        rule instanceof CSSStyleRule ? rule.selectorText : ''
      )
    )
  )

const expectNoBootstrap = async (page: Page) => {
  expect((await classesOn(page)).filter((c) => BOOTSTRAP.test(c))).toEqual([])
  expect(
    (await selectorsOn(page)).filter((s) => REMOVED_SELECTORS.test(s))
  ).toEqual([])
}

/** Is focus inside the main landmark, and not in the header? */
const focusInMain = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement
    return (
      el !== null &&
      el.closest('main') !== null &&
      el.closest('header') === null &&
      el.tagName !== 'MAIN'
    )
  })

test.describe('self-hosted fonts (#176)', () => {
  test('Poppins comes from this site, and nothing asks Google Fonts', async ({
    page
  }) => {
    const requested: string[] = []
    page.on('request', (r) => requested.push(r.url()))
    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 2, name: 'Ingredients' })
    ).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(() => document.fonts.check('400 16px Poppins'))
    ).toBe(true)
    expect(
      await page.evaluate(() => getComputedStyle(document.body).fontFamily)
    ).toMatch(/^"?Poppins"?/)
    const fontFiles = requested.filter((u) => /\.woff2?(\?|$)/.test(u))
    expect(fontFiles.some((u) => /poppins/i.test(u))).toBe(true)
    expect(fontFiles.every((u) => u.startsWith(urls.client))).toBe(true)
    expect(requested.filter((u) => GOOGLE_FONTS.test(u))).toEqual([])
  })
})

test.describe('Skip to content (#131)', () => {
  test('on the list page, the first Tab shows the skip link; Enter then Tab lands in the list, past the header', async ({
    page
  }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 2, name: 'Ingredients' })
    ).toBeVisible()
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    // hidden until focused, then a real, tappable size
    expect((await skip.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44)
    await page.keyboard.press('Enter')
    const main = page.getByRole('main')
    await expect(main).toBeFocused()
    await expect(main).toHaveCount(1)
    await expect(
      main.getByRole('heading', { level: 2, name: 'Ingredients' })
    ).toBeVisible()
    await page.keyboard.press('Tab')
    expect(await focusInMain(page)).toBe(true)
  })

  test('on the other pages too: Log in', async ({ page }) => {
    await page.goto('/login')
    await page.keyboard.press('Tab')
    await expect(
      page.getByRole('link', { name: 'Skip to content' })
    ).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
    await page.keyboard.press('Tab')
    expect(await focusInMain(page)).toBe(true)
  })

  test('the skip link stays hidden until it has focus', async ({ page }) => {
    await page.goto('/')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    expect((await skip.boundingBox())?.height ?? 0).toBeLessThanOrEqual(1)
  })
})

test.describe('no Bootstrap classes (#170)', () => {
  test('the list page, with a recipe picked and a chip panel open, has no Bootstrap class names or selectors', async ({
    page
  }) => {
    await page.goto('/')
    await expectNoBootstrap(page)
    await pickRows(page, DAHL)
    await chevron(page, 'tomato').click()
    await expectNoBootstrap(page)
  })

  test('Log in, Upgrade and a missing page have none either', async ({
    page
  }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible()
    await expectNoBootstrap(page)
    await page.goto('/nowhere')
    await expectNoBootstrap(page)
    await signUp(page, newAccount())
    await page.goto('/upgrade')
    await expect(page.getByText('Why upgrade?')).toBeVisible()
    await expectNoBootstrap(page)
  })

  test('Sign up has none either', async ({ page }) => {
    await page.goto('/signup')
    const submit = page.getByRole('button', { name: 'Sign up' })
    await expect(submit).toBeVisible()
    await expectNoBootstrap(page)
  })
})

test.describe('analytics (#177)', () => {
  test('the dev build sends nothing to Vercel Analytics', async ({ page }) => {
    const requested: string[] = []
    page.on('request', (r) => requested.push(r.url()))
    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 2, name: 'Ingredients' })
    ).toBeVisible()
    await page.waitForLoadState('networkidle')
    expect(requested.filter((u) => ANALYTICS.test(u))).toEqual([])
    await expect(page.locator('script[src*="_vercel/insights"]')).toHaveCount(0)
  })

  test('the production build loads the Vercel Analytics script from this site', async ({
    page
  }) => {
    const script = page.waitForRequest((r) =>
      r.url().startsWith(`${urls.preview}/_vercel/insights/script.js`)
    )
    await page.goto(urls.preview)
    await script
    await expect(
      page.locator('script[src="/_vercel/insights/script.js"]')
    ).toHaveCount(1)
  })
})
