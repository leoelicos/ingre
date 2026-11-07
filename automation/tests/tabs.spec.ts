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
    console.log('[tabs] starting first test')
    await page.goto('/')
    console.log('[tabs] navigated to /', await page.url())
    const links = nav(page).getByRole('link')
    console.log('[tabs] link count', await links.count())
    await expect(links).toHaveText(['Explore', 'Inventory', 'Cook', 'Profile'])
    console.log('[tabs] text assertion passed')
    await expect(tab(page, 'Explore')).toHaveAttribute('aria-current', 'page')
    await expect(tab(page, 'Cook')).not.toHaveAttribute('aria-current', /.*/)
    console.log('[tabs] first test done')
  })

  test('the bar sits at the bottom of the screen, tall enough to tap, and does not move between pages', async ({
    page
  }) => {
    console.log('[tabs] bottom bar test')
    await page.goto('/')
    const height = page.viewportSize()?.height ?? 0
    console.log('[tabs] viewport height', height)
    const onList = await box(nav(page))
    console.log('[tabs] nav box', onList)
    expect(onList.y + onList.height).toBeCloseTo(height, 0)
    for (const name of ['Explore', 'Inventory', 'Cook', 'Profile']) {
      const h = (await box(tab(page, name))).height
      console.log('[tabs] tab height', name, h)
      expect(h).toBeGreaterThanOrEqual(44)
    }
    await tab(page, 'Profile').click()
    console.log('[tabs] after Profile click', await page.url())
    await expect(page).toHaveURL(/\/profile$/)
    expect(await box(nav(page))).toEqual(onList)
    await page.goto('/login')
    console.log('[tabs] on login', await page.url())
    expect(await box(nav(page))).toEqual(onList)
  })

  test('Cook takes you to Recipes, Inventory to Ingredients, and each is then the current tab', async ({
    page
  }) => {
    console.log('[tabs] Cook/Inventory test')
    await page.goto('/')
    await tab(page, 'Cook').click()
    console.log('[tabs] after Cook click', await page.url())
    await expect(tab(page, 'Cook')).toHaveAttribute('aria-current', 'page')
    const recipes = page.getByRole('heading', { level: 2, name: /^Recipes/ })
    console.log('[tabs] Recipes heading count', await recipes.count())
    if ((await recipes.count()) === 0)
      console.error('[tabs] no Recipes heading')
    await expect(recipes).toBeFocused()
    await expect(
      page.getByRole('region', { name: 'Recipes', exact: true })
    ).toBeInViewport()
    await tab(page, 'Inventory').click()
    console.log('[tabs] after Inventory click', await page.url())
    await expect(tab(page, 'Inventory')).toHaveAttribute('aria-current', 'page')
    const ingredients = page.getByRole('heading', {
      level: 2,
      name: /^Ingredients/
    })
    console.log('[tabs] Ingredients heading count', await ingredients.count())
    if ((await ingredients.count()) === 0)
      console.error('[tabs] no Ingredients heading')
    await expect(ingredients).toBeFocused()
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
