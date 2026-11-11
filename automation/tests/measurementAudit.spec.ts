import AxeBuilder from '@axe-core/playwright'
import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { explore, openExplore } from './page'

/* The measurement audit table in Explore's open rows: semantics, sorting, paging, keyboard, phone width. */

const TITLE = 'Spaghetti bolognese'
const CAPTION = `${TITLE}: measurements per serve`
const PER_SERVE = 'Per serve (g or ml)'
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const opener = (page: Page): Locator =>
  explore(page).getByRole('button', {
    name: `Check measurements: ${TITLE}`
  })
const table = (page: Page): Locator =>
  explore(page).getByRole('table', { name: CAPTION })
const rowNames = (page: Page) =>
  table(page).getByRole('rowheader').allTextContents()
const header = (page: Page, name: string): Locator =>
  table(page).getByRole('columnheader', { name })

const openAudit = async (page: Page) => {
  await page.goto('/')
  await openExplore(page)
  await explore(page)
    .getByRole('button', { name: `See recipe: ${TITLE}` })
    .click()
  await opener(page).click()
  await expect(table(page)).toBeVisible()
}

test.describe('measurement audit table', () => {
  test('is a captioned table, sorted from its headers and paged', async ({
    page
  }) => {
    await openAudit(page)
    expect(await rowNames(page)).toEqual([
      'Spaghetti',
      'Beef mince',
      'Brown onion',
      'Carrot',
      'Celery'
    ])
    await expect(
      explore(page).getByText('Showing 1–5 of 10 ingredients')
    ).toBeVisible()

    const sort = header(page, PER_SERVE).getByRole('button')
    await sort.click()
    await sort.click()
    await expect(header(page, PER_SERVE)).toHaveAttribute(
      'aria-sort',
      'descending'
    )
    await expect(explore(page).getByRole('status')).toContainText(
      `Sorted by ${PER_SERVE}, descending.`
    )
    expect((await rowNames(page))[0]).toBe('Canned crushed tomatoes')

    await explore(page).getByRole('button', { name: 'Next' }).click()
    await expect(
      explore(page).getByText('Page 2 of 2', { exact: true })
    ).toBeVisible()
    await expect(explore(page).getByRole('status')).toContainText(
      'Page 2 of 2. Showing 6–10 of 10 ingredients.'
    )
    await explore(page)
      .getByRole('combobox', { name: 'Rows per page' })
      .selectOption('20')
    expect(await rowNames(page)).toHaveLength(10)
  })

  test('works by keyboard alone', async ({ page }) => {
    await page.goto('/')
    await openExplore(page)
    const see = explore(page).getByRole('button', {
      name: `See recipe: ${TITLE}`
    })
    await see.focus()
    await page.keyboard.press('Enter')
    await opener(page).focus()
    await page.keyboard.press('Enter')
    await expect(table(page)).toBeVisible()
    await expect(opener(page)).toHaveAttribute('aria-expanded', 'true')
    /* the scroll box is a stop of its own, so the columns can scroll by arrow keys */
    await page.keyboard.press('Tab')
    await expect(
      explore(page).getByRole('region', { name: CAPTION })
    ).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(header(page, 'Ingredient').getByRole('button')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(header(page, 'Ingredient')).toHaveAttribute(
      'aria-sort',
      'ascending'
    )
    expect((await rowNames(page))[0]).toBe('Beef mince')
  })

  test('never widens the page; the table scrolls in its own box', async ({
    page
  }) => {
    await openAudit(page)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    expect(overflow).toBeLessThanOrEqual(0)
    const box = await explore(page)
      .getByRole('region', { name: CAPTION })
      .boundingBox()
    const viewport = page.viewportSize()
    expect(box).not.toBeNull()
    expect(viewport).not.toBeNull()
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
      viewport?.width ?? 0
    )
  })

  for (const scheme of ['light', 'dark'] as const) {
    test(`has no axe violations in ${scheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme })
      await openAudit(page)
      await header(page, PER_SERVE).getByRole('button').click()
      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(
        results.violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target.join(' '))
        }))
      ).toEqual([])
    })
  }
})
