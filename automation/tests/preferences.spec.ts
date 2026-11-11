import AxeBuilder from '@axe-core/playwright'
import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { explore, openExplore } from './page'

/* The Preferences form on Profile: inline and submit validation, keyboard, and app-wide effect. */

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const LIGHT_BG = 'rgb(255, 248, 240)'
const DARK_BG = 'rgb(20, 24, 21)'

const form = (page: Page): Locator =>
  page.getByRole('form', { name: 'Preferences' })
const textSize = (page: Page): Locator =>
  form(page).getByRole('textbox', { name: 'Text size' })
const save = (page: Page): Locator =>
  form(page).getByRole('button', { name: 'Save preferences' })
const saved = (page: Page): Locator => form(page).getByRole('status')
const background = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor)
const rootFontSize = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
const violations = async (page: Page) =>
  (await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations.map(
    (v) => ({ id: v.id, targets: v.nodes.map((n) => n.target.join(' ')) })
  )

test.describe('Preferences form', () => {
  test('checks a field once it is left, and on submit shows a summary that takes focus', async ({
    page
  }) => {
    await page.goto('/profile')
    await textSize(page).fill('300')
    await expect(textSize(page)).toHaveAttribute('aria-invalid', 'false')
    await textSize(page).press('Tab')
    await expect(textSize(page)).toHaveAttribute('aria-invalid', 'true')
    await expect(textSize(page)).toHaveAccessibleDescription(
      /Error: Enter a text size from 100 to 200$/
    )

    await save(page).click()
    const summary = form(page).locator('[tabindex="-1"]')
    await expect(summary).toBeFocused()
    await expect(summary).toHaveAccessibleName('There is a problem')
    await summary
      .getByRole('link', { name: 'Enter a text size from 100 to 200' })
      .click()
    await expect(textSize(page)).toBeFocused()
    await expect(saved(page)).toBeEmpty()
  })

  test('the theme and text size apply to the whole app and survive a reload', async ({
    page
  }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/profile')
    await form(page).getByRole('radio', { name: 'Dark' }).check()
    await textSize(page).fill('150')
    await save(page).click()
    await expect(saved(page)).toHaveText('Preferences saved.')
    expect(await background(page)).toBe(DARK_BG)
    expect(await rootFontSize(page)).toBe('24px')

    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(await background(page)).toBe(DARK_BG)
    expect(await rootFontSize(page)).toBe('24px')
  })

  test('Light beats a dark device; Match my device follows it again', async ({
    page
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/profile')
    expect(await background(page)).toBe(DARK_BG)
    await form(page).getByRole('radio', { name: 'Light' }).check()
    await save(page).click()
    await expect(saved(page)).toHaveText('Preferences saved.')
    expect(await background(page)).toBe(LIGHT_BG)
    await form(page).getByRole('radio', { name: 'Match my device' }).check()
    await save(page).click()
    await expect(saved(page)).toHaveText('Preferences saved.')
    expect(await background(page)).toBe(DARK_BG)
  })

  test('a diet saved here is the one Explore filters by', async ({ page }) => {
    await page.goto('/profile')
    await form(page).getByRole('radio', { name: 'Vegetarian' }).check()
    await form(page).getByRole('checkbox', { name: 'Milk' }).check()
    await save(page).click()
    await expect(saved(page)).toHaveText('Preferences saved.')
    await page.goto('/')
    await openExplore(page)
    const names = await explore(page)
      .getByRole('button', { name: /^See recipe: / })
      .evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')))
    expect(names.length).toBeGreaterThan(0)
    expect(names.join('|')).not.toMatch(/beef|chicken|pork|prawn/i)
  })

  test('works by keyboard alone', async ({ page }) => {
    await page.goto('/profile')
    await form(page).getByRole('radio', { name: 'Match my device' }).focus()
    await page.keyboard.press('ArrowDown')
    await expect(form(page).getByRole('radio', { name: 'Light' })).toBeChecked()
    await page.keyboard.press('Tab')
    await expect(textSize(page)).toBeFocused()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('120')
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowDown')
    await expect(
      form(page).getByRole('radio', { name: 'Pescatarian' })
    ).toBeChecked()
    await page.keyboard.press('Tab')
    await expect(
      form(page).getByRole('checkbox', { name: 'Crustacean' })
    ).toBeFocused()
    await page.keyboard.press('Space')
    await expect(
      form(page).getByRole('checkbox', { name: 'Crustacean' })
    ).toBeChecked()
    await save(page).focus()
    await page.keyboard.press('Enter')
    await expect(saved(page)).toHaveText('Preferences saved.')
    expect(await rootFontSize(page)).toBe('19.2px')
  })

  test('at the largest text size the page still fits the screen', async ({
    page
  }) => {
    await page.goto('/profile')
    await textSize(page).fill('200')
    await save(page).click()
    await expect(saved(page)).toHaveText('Preferences saved.')
    expect(await rootFontSize(page)).toBe('32px')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  for (const scheme of ['light', 'dark'] as const) {
    test(`has no axe violations in ${scheme} mode, with and without errors`, async ({
      page
    }) => {
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto('/profile')
      await expect(form(page)).toBeVisible()
      expect(await violations(page)).toEqual([])
      await textSize(page).fill('')
      await save(page).click()
      await expect(form(page).locator('[tabindex="-1"]')).toBeFocused()
      expect(await violations(page)).toEqual([])
    })
  }
})
