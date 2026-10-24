import type { Locator, Page } from '@playwright/test'
import { expect } from './fixtures'

/* Shared locators for the one list page (#179, #181). */

export const DAHL = 'Red lentil dahl'
export const CURRY = 'Potato, cauliflower and chickpea curry'
export const SEARCH = 'Search ingredients and recipes'

/** Where a chip sits (#182): Ingredients ("chip"), Extra ("extra") or a recipe row ("row-<id>"). */
export type Scope = 'chip' | 'extra' | `row-${string}`

/** The section a scope's chips sit in. */
const scopeRegion = (page: Page, scope: Scope): Locator =>
  page.getByRole('region', {
    name:
      scope === 'chip'
        ? 'Ingredients'
        : scope === 'extra'
        ? 'Extra'
        : 'Recipes',
    exact: true
  })

/** A chip; Ingredients unless a scope says otherwise. */
export const chip = (page: Page, id: string, scope: Scope = 'chip'): Locator =>
  page.locator(`[data-scope="${scope}"][data-chip="${id}"]`)
/** The chip's cross-off button: its spoken label is a comma list; the chevron's is not. */
export const chipToggle = (
  page: Page,
  id: string,
  scope: Scope = 'chip'
): Locator => chip(page, id, scope).getByRole('button', { name: /, / })
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

export const explore = (page: Page): Locator =>
  page.getByRole('region', { name: 'Explore', exact: true })
export const recipesRegion = (page: Page): Locator =>
  page.getByRole('region', { name: 'Recipes', exact: true })
export const ingredientsRegion = (page: Page): Locator =>
  page.getByRole('region', { name: 'Ingredients', exact: true })
export const extraRegion = (page: Page): Locator =>
  page.getByRole('region', { name: 'Extra', exact: true })
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
export const section = (
  page: Page,
  name: 'Ingredients' | 'Recipes' | 'Extra'
) =>
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
