import type { Locator, Page } from '@playwright/test'
import { expect } from './fixtures'

/* Shared locators for the one list page (#179, #181). */

export const DAHL = 'Red lentil dahl'
export const CURRY = 'Potato, cauliflower and chickpea curry'
export const SEARCH = 'Search ingredients and recipes'

export const chip = (page: Page, id: string): Locator =>
  page.locator(`[data-chip="${id}"]`)
/** The chip's cross-off button: its spoken label is a comma list; the chevron's is not. */
export const chipToggle = (page: Page, id: string): Locator =>
  chip(page, id).getByRole('button', { name: /, / })
export const chipOrder = (page: Page) =>
  page
    .locator('[data-chip]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-chip')))
/** The category heading a chip sits under. */
export const groupOf = (page: Page, id: string) =>
  chip(page, id).evaluate(
    (el) => el.closest('[role="group"]')?.querySelector('h3')?.textContent
  )

export const explore = (page: Page): Locator =>
  page.getByRole('region', { name: 'Explore', exact: true })
export const recipesRegion = (page: Page): Locator =>
  page.getByRole('region', { name: 'Recipes', exact: true })
export const ingredientsRegion = (page: Page): Locator =>
  page.getByRole('region', { name: 'Ingredients', exact: true })
export const searchBox = (page: Page): Locator =>
  page.getByRole('searchbox', { name: SEARCH })
export const drawer = (page: Page): Locator =>
  page.getByRole('complementary', { name: 'Explore drawer' })
/** The closed drawer's strip button (992px and up). */
export const rail = (page: Page): Locator =>
  drawer(page).getByRole('button', { name: SEARCH })

/** A recipe row in Explore (the browse list or the matches). */
export const exploreRow = (page: Page, title: string): Locator =>
  explore(page).getByRole('button', { name: title, exact: true })
/** A picked recipe's row in the Recipes section. */
export const row = (page: Page, title: string): Locator =>
  recipesRegion(page).getByRole('button', { name: title, exact: true })

/** A collapsible section's header button (vertical layout only). */
export const section = (page: Page, name: 'Ingredients' | 'Recipes') =>
  page.getByRole('heading', { level: 2, name, exact: true }).getByRole('button')

export const layoutToggle = (page: Page): Locator =>
  page.getByRole('radiogroup', { name: 'Layout' })
/** Chooses a layout by its visible text (the radio itself is visually hidden). */
export const chooseLayout = (page: Page, text: string) =>
  layoutToggle(page)
    .locator('label')
    .filter({ hasText: new RegExp(`^${text}$`) })
    .click()

/** Opens Explore however this width shows it: the drawer strip, or the search bar. */
export const openExplore = async (page: Page) => {
  if (await explore(page).isVisible()) return
  if (await rail(page).isVisible()) await rail(page).click()
  else await searchBox(page).click()
  await expect(explore(page)).toBeVisible()
}

/** Picks recipes by ticking their rows in Explore. */
export const pickRows = async (page: Page, ...titles: string[]) => {
  await openExplore(page)
  for (const title of titles) {
    await exploreRow(page, title).click()
    await expect(exploreRow(page, title)).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  }
}

/** Uses the vertical layout when this width offers a choice, so sections can collapse. */
export const useVertical = async (page: Page) => {
  if (await layoutToggle(page).isVisible()) await chooseLayout(page, 'Vertical')
}

export const box = async (l: Locator) => {
  const b = await l.boundingBox()
  return b ?? { x: 0, y: 0, width: 0, height: 0 }
}

/** Distance from the top of the document, so scrolling does not change it. */
export const pageTop = (l: Locator) =>
  l.evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
