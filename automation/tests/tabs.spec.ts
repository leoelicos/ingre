import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { box, explore, searchBox } from './page'

/* #227 Four tabs: a stable bottom navigation on every page; Saved lives under Profile. */

const nav = (page: Page): Locator =>
  page.getByRole('navigation', { name: 'Main', exact: true })
const tab = (page: Page, name: string): Locator =>
  nav(page).getByRole('link', { name, exact: true })

test.describe('four tabs (#227)', () => {
  test('Explore, Inventory, Cook and Profile, in that order, with Explore current on load', async ({
    page
  }) => {
    await page.goto('/')
    await expect(nav(page).getByRole('link')).toHaveText([
      'Explore',
      'Inventory',
      'Cook',
      'Profile'
    ])
    await expect(tab(page, 'Explore')).toHaveAttribute('aria-current', 'page')
    await expect(tab(page, 'Cook')).not.toHaveAttribute('aria-current', /.*/)
  })

  test('the bar sits at the bottom of the screen, tall enough to tap, and does not move between pages', async ({
    page
  }) => {
    await page.goto('/')
    const height = page.viewportSize()?.height ?? 0
    const onList = await box(nav(page))
    expect(onList.y + onList.height).toBeCloseTo(height, 0)
    for (const name of ['Explore', 'Inventory', 'Cook', 'Profile'])
      expect((await box(tab(page, name))).height).toBeGreaterThanOrEqual(44)
    await tab(page, 'Profile').click()
    await expect(page).toHaveURL(/\/profile$/)
    expect(await box(nav(page))).toEqual(onList)
    await page.goto('/login')
    expect(await box(nav(page))).toEqual(onList)
  })

  test('Cook takes you to Recipes, Inventory to Ingredients, and each is then the current tab', async ({
    page
  }) => {
    await page.goto('/')
    await tab(page, 'Cook').click()
    await expect(tab(page, 'Cook')).toHaveAttribute('aria-current', 'page')
    await expect(
      page.getByRole('heading', { level: 2, name: /^Recipes/ })
    ).toBeFocused()
    await expect(
      page.getByRole('region', { name: 'Recipes', exact: true })
    ).toBeInViewport()
    await tab(page, 'Inventory').click()
    await expect(tab(page, 'Inventory')).toHaveAttribute('aria-current', 'page')
    await expect(
      page.getByRole('heading', { level: 2, name: /^Ingredients/ })
    ).toBeFocused()
  })

  test('Explore takes you back to the search, expanded', async ({ page }) => {
    await page.goto('/#cook')
    await tab(page, 'Explore').click()
    await expect(searchBox(page)).toBeFocused()
    await expect(explore(page)).toBeVisible()
  })

  test('the tabs work from the keyboard', async ({ page }) => {
    await page.goto('/')
    await tab(page, 'Cook').focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#cook$/)
    await expect(
      page.getByRole('heading', { level: 2, name: /^Recipes/ })
    ).toBeFocused()
    await tab(page, 'Profile').focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/profile$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Profile' })
    ).toBeVisible()
  })

  test('Profile holds the account and the saved recipes, not a tab of their own', async ({
    page
  }) => {
    await page.goto('/profile')
    await expect(tab(page, 'Profile')).toHaveAttribute('aria-current', 'page')
    await expect(
      page.getByRole('region', { name: 'Account', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Saved recipes', exact: true })
    ).toBeVisible()
    await expect(nav(page).getByRole('link', { name: /saved/i })).toHaveCount(0)
  })

  test('the page leaves room under its last section, so the bar never hides it', async ({
    page
  }) => {
    await page.goto('/')
    const bar = await box(nav(page))
    const room = await page
      .locator('main')
      .evaluate(
        (el) =>
          document.documentElement.scrollHeight -
          (el.getBoundingClientRect().bottom + window.scrollY)
      )
    expect(room).toBeGreaterThanOrEqual(bar.height)
  })
})
