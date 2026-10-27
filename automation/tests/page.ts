import type { Locator, Page } from '@playwright/test'
import { expect } from './fixtures'

/* Shared locators for the one list page (#179, #181, #192). */

export const DAHL = 'Red lentil dahl'
export const CURRY = 'Potato, cauliflower and chickpea curry'
export const SEARCH = 'Search ingredients and recipes'

/** Where a chip sits (#182): Ingredients ("chip"), Extra ("extra") or a recipe row ("row-<id>"). */
export type Scope = 'chip' | 'extra' | `row-${string}`

/** Where a scope's chips sit: the Ingredients or Recipes section, or the Extra sheet (#192). */
const scopeRegion = (page: Page, scope: Scope): Locator =>
  scope === 'chip'
    ? ingredientsRegion(page)
    : scope === 'extra'
    ? extraRegion(page)
    : recipesRegion(page)

/** A chip; Ingredients unless a scope says otherwise. */
export const chip = (page: Page, id: string, scope: Scope = 'chip'): Locator =>
  page.locator(`[data-scope="${scope}"][data-chip="${id}"]`)
/** The chip's cross-off checkbox (#192): its spoken label is a comma list; the chevron's is not. */
export const chipToggle = (
  page: Page,
  id: string,
  scope: Scope = 'chip'
): Locator => chip(page, id, scope).getByRole('checkbox', { name: /, / })
/** Crosses a chip off (or back on) the way a shopper does: a tap on its row (#192). */
export const crossOff = (
  page: Page,
  id: string,
  scope: Scope = 'chip'
): Promise<void> => chip(page, id, scope).locator('label').first().click()
/** The chip's chevron, which opens its panel. */
export const chevron = (
  page: Page,
  id: string,
  scope: Scope = 'chip'
): Locator => chip(page, id, scope).getByRole('button', { name: / details$/ })
/** An open chip panel ("Butter details"); the one in Ingredients unless a scope says otherwise. */
export const panel = (
  page: Page,
  name: string,
  scope: Scope = 'chip'
): Locator =>
  scopeRegion(page, scope).getByRole('group', {
    name: `${name} details`,
    exact: true
  })
/** A source's box in an open panel, by the start of its name ("Red lentil dahl, "). */
export const sourceBox = (p: Locator, start: string): Locator =>
  p.getByRole('textbox', { name: new RegExp(`^${start}, `) })
/** Types an amount into a box and leaves it, so it commits. */
export const setBox = async (b: Locator, value: string) => {
  await b.fill(value)
  await b.press('Tab')
}
/** The Ingredients chips in order. */
export const chipOrder = (page: Page) =>
  page
    .locator('[data-scope="chip"][data-chip]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-chip')))
/** The category heading a chip sits under. */
export const groupOf = (page: Page, id: string, scope: Scope = 'chip') =>
  chip(page, id, scope).evaluate(
    (el) => el.closest('[role="group"]')?.querySelector('h3')?.textContent
  )

/** Explore (#192): a bottom sheet below 576px, a centred modal from there. */
export const explore = (page: Page): Locator =>
  page.getByRole('dialog', { name: 'Explore', exact: true })
export const recipesRegion = (page: Page): Locator =>
  page.getByRole('region', { name: 'Recipes', exact: true })
export const ingredientsRegion = (page: Page): Locator =>
  page.getByRole('region', { name: 'Ingredients', exact: true })
/** Extra (#192): its own sheet, opened from "+ Pantry Item". */
export const extraRegion = (page: Page): Locator =>
  page.getByRole('dialog', { name: 'Extra', exact: true })
export const searchBox = (page: Page): Locator =>
  page.getByRole('searchbox', { name: SEARCH })
/** The floating action button (#192): "+ Recipe" or "+ Pantry Item". */
export const fab = (page: Page): Locator =>
  page.getByRole('button', { name: /^Add a (recipe|pantry item)$/ })

/** A recipe row in Explore (the browse list or the matches). */
export const exploreRow = (page: Page, title: string): Locator =>
  explore(page).getByRole('button', { name: title, exact: true })
/** A picked recipe's row in the Recipes section. */
export const row = (page: Page, title: string): Locator =>
  recipesRegion(page).getByRole('button', { name: title, exact: true })

/** Scrolls the page to the top, where the FAB says "+ Recipe". */
export const toTop = async (page: Page) => {
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(fab(page)).toHaveAccessibleName('Add a recipe')
}

/** Scrolls Ingredients to the top of the screen, where the FAB says "+ Pantry Item". */
export const toIngredients = async (page: Page) => {
  await ingredientsRegion(page).evaluate((el) =>
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)
  )
  await expect(fab(page)).toHaveAccessibleName('Add a pantry item')
}

/** Opens Explore from "+ Recipe", unless it is open already. */
export const openExplore = async (page: Page) => {
  if (await explore(page).isVisible()) return
  await toTop(page)
  await fab(page).click()
  await expect(explore(page)).toBeVisible()
}

/** Opens the Extra sheet from "+ Pantry Item", unless it is open already. */
export const openExtra = async (page: Page) => {
  if (await extraRegion(page).isVisible()) return
  await toIngredients(page)
  await fab(page).click()
  await expect(extraRegion(page)).toBeVisible()
}

/** Closes whichever sheet is open with its ✕, and waits for it to go. */
export const closeSheet = async (page: Page) => {
  const dialog = page.getByRole('dialog')
  await page.getByRole('button', { name: /^Close (Explore|Extra)$/ }).click()
  await expect(dialog).toHaveCount(0)
}

/** Picks recipes by ticking their rows in Explore, then closes it. */
export const pickRows = async (page: Page, ...titles: string[]) => {
  await openExplore(page)
  for (const title of titles) {
    await exploreRow(page, title).click()
    await expect(exploreRow(page, title)).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  }
  await closeSheet(page)
}

export const box = async (l: Locator) => {
  const b = await l.boundingBox()
  return b ?? { x: 0, y: 0, width: 0, height: 0 }
}

/** Distance from the top of the document, so scrolling does not change it. */
export const pageTop = (l: Locator) =>
  l.evaluate((el) => el.getBoundingClientRect().top + window.scrollY)

/**
 * Clicks an option in a combo box's list once the list is shown. On touch screens React Aria
 * reveals the list after the on-screen keyboard settles, so it is briefly transparent first.
 */
export const pickOption = async (page: Page, name: string) => {
  await expect(page.locator('[data-trigger="ComboBox"]')).toHaveCSS(
    'opacity',
    '1'
  )
  await page.getByRole('option', { name, exact: true }).click()
}
