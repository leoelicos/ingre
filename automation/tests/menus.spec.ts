import { expect, test } from './fixtures'
import { DAHL, openExplore, pickRows, recipesRegion } from './page'
import type { Locator, Page } from '@playwright/test'

/* #219 Composed menus: starter, main and dessert that suit each other, with wines. */

const BUTTER_CHICKEN = 'Butter chicken'
const PORK_CHOPS = 'Pork chops with apples and onion'
const GREEK = 'Greek salad with haloumi'

const menu = (page: Page): Locator =>
  page.getByRole('region', { name: 'Menu', exact: true })
const course = (page: Page, name: string): Locator =>
  menu(page).getByRole('heading', { level: 3, name, exact: true }).locator('..')
const add = (page: Page, name: string): Locator =>
  menu(page).getByRole('button', { name: `Add ${name} to your list` })

test.describe('Composed menus (#219)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has no Menu until a recipe is picked', async ({ page }) => {
    await expect(menu(page)).toHaveCount(0)
  })

  test('a chicken main gets three starter suggestions with wines, and a dessert gap said plainly', async ({
    page
  }) => {
    await pickRows(page, BUTTER_CHICKEN)
    await expect(add(page, GREEK)).toBeVisible()
    await expect(
      menu(page).getByRole('button', { name: /^Add .* to your list$/ })
    ).toHaveCount(3)
    await expect(
      course(page, 'Starter')
        .getByText(/^Wine: /)
        .first()
    ).toBeVisible()
    await expect(
      course(page, 'Dessert').getByText(
        'No dessert in the library suits your main yet.'
      )
    ).toBeVisible()
  })

  test('a pork main is offered only the starter that does not repeat pork', async ({
    page
  }) => {
    await pickRows(page, PORK_CHOPS)
    await expect(
      menu(page).getByRole('button', { name: /^Add .* to your list$/ })
    ).toHaveCount(1)
    await expect(add(page, GREEK)).toBeVisible()
  })

  test('adding a suggested starter puts it on the list, and it survives a reload', async ({
    page
  }) => {
    await pickRows(page, BUTTER_CHICKEN)
    await add(page, GREEK).click()
    await expect(
      recipesRegion(page).getByRole('button', { name: GREEK, exact: true })
    ).toBeVisible()
    await expect(add(page, GREEK)).toHaveCount(0)
    await expect(
      course(page, 'Starter').getByText('On your list')
    ).toBeVisible()
    await page.reload()
    await expect(
      course(page, 'Starter').getByText('On your list')
    ).toBeVisible()
  })

  test('asks for a main when only a starter is picked, and nothing leaves localhost', async ({
    page,
    outsideRequests
  }) => {
    await openExplore(page)
    await pickRows(page, GREEK)
    await expect(
      menu(page).getByText(/Pick a main and Menu suggests/)
    ).toBeVisible()
    await pickRows(page, DAHL)
    await expect(menu(page).getByRole('heading', { level: 3 })).toHaveCount(3)
    expect(outsideRequests).toEqual([])
  })
})
