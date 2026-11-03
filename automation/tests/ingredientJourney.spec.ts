import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { explore, openExplore, recipesRegion, searchBox } from './page'

/* #205 Fixed ingredient journey: every ingredient opens the same four relations. */

const HEADINGS = ['Shop section', 'Goes with', 'Used in', 'Suggested recipes']

const journey = (page: Page, name: string): Locator =>
  explore(page).getByRole('region', { name: `About ${name}`, exact: true })

const openDetails = async (page: Page, name: string) => {
  await searchBox(page).fill(name)
  await explore(page)
    .getByRole('button', { name: `Details of ${name}`, exact: true })
    .click()
}

test.describe('fixed ingredient journey (#205)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await openExplore(page)
  })

  test('an ingredient recipes use shows its section, what goes with it, its recipes and suggestions with what is missing and the cost', async ({
    page
  }) => {
    await openDetails(page, 'carrot')
    const j = journey(page, 'carrot')
    await expect(j.getByRole('heading', { level: 4 })).toHaveText(HEADINGS)
    await expect(j).toContainText('Fruit & Veg')
    await expect(j.getByRole('list', { name: 'Used in' })).toContainText(
      'Egg fried rice'
    )
    const note = j.getByTestId('suggestion-note').first()
    await expect(note).toContainText('Missing:')
    await expect(note).toContainText('About $')
  })

  test('an ingredient no recipe uses shows the same four sections, each saying so', async ({
    page
  }) => {
    await openDetails(page, 'banana')
    const j = journey(page, 'banana')
    await expect(j.getByRole('heading', { level: 4 })).toHaveText(HEADINGS)
    await expect(j).toContainText('Nothing pairs with it yet')
    await expect(j).toContainText('No recipe in the library uses it yet')
    await expect(j).toContainText('No recipes to suggest yet')
  })

  test('a suggestion adds to the list in one tap, with an acknowledgement', async ({
    page
  }) => {
    await openDetails(page, 'carrot')
    const j = journey(page, 'carrot')
    await j
      .getByRole('button', { name: 'Add Egg fried rice to your list' })
      .click()
    await expect(j.getByRole('status')).toHaveText(
      'Egg fried rice added to your list'
    )
    await expect(
      recipesRegion(page).getByRole('button', {
        name: 'Egg fried rice',
        exact: true
      })
    ).toBeVisible()
  })

  test('something that goes with it can be picked to carry on', async ({
    page
  }) => {
    await openDetails(page, 'carrot')
    const j = journey(page, 'carrot')
    await j
      .getByRole('list', { name: 'Goes with' })
      .getByRole('button')
      .first()
      .click()
    await expect(
      explore(page).getByRole('region', { name: 'Suggestions', exact: true })
    ).toBeVisible()
  })
})
