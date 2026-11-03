import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'

/* #225 Retrieval over hand-curated profiles: ideas for what you have, locks first, no outside request.
   (The shared fixture fails any test whose page request leaves localhost, so no AI service is called.) */

const field = (page: Page): Locator =>
  page.getByRole('searchbox', { name: 'What do you have?' })
/** An Avoid pill: the checkbox itself is visually hidden, so press its label. */
const avoid = (page: Page, name: string) =>
  page
    .locator('label')
    .filter({ hasText: new RegExp(`^${name}$`) })
    .click()
const idea = (page: Page, id: string): Locator =>
  page.locator(`[data-idea="${id}"]`)

test.describe('ideas from curated profiles (#225)', () => {
  test('type what you have: partners come back with their reasons, not what you already have', async ({
    page
  }) => {
    await page.goto('/ideas')
    await expect(page.getByText('Ideas appear as you type.')).toBeVisible()
    await field(page).fill('carrots and flour')
    await expect(idea(page, 'butter')).toContainText(
      'Goes with carrot, plain flour.'
    )
    await expect(idea(page, 'white-sugar')).toBeVisible()
    await expect(idea(page, 'carrot')).toHaveCount(0)
    await expect(idea(page, 'plain-flour')).toHaveCount(0)
    await expect(page.getByRole('status')).toHaveText('8 ideas')
  })

  test('Avoid is a lock: milk and egg never show, and the list fills from the next best', async ({
    page
  }) => {
    await page.goto('/ideas')
    await field(page).fill('carrots and flour')
    await expect(idea(page, 'butter')).toBeVisible()
    await avoid(page, 'milk')
    await avoid(page, 'egg')
    await expect(idea(page, 'butter')).toHaveCount(0)
    await expect(idea(page, 'egg')).toHaveCount(0)
    await expect(page.locator('[data-idea]')).toHaveCount(8)
  })

  test('a word that names nothing says so, and clearing the text clears the list', async ({
    page
  }) => {
    await page.goto('/ideas')
    await field(page).fill('zzzz')
    await expect(page.getByRole('status')).toContainText(
      'Nothing in the pairing list'
    )
    await field(page).fill('curry')
    await expect(page.locator('[data-idea]').first()).toBeVisible()
    await field(page).fill('')
    await expect(page.locator('[data-idea]')).toHaveCount(0)
  })

  test('works from the keyboard and fits the screen without sideways scrolling', async ({
    page
  }) => {
    await page.goto('/ideas')
    await field(page).focus()
    await page.keyboard.type('tomato')
    await expect(page.locator('[data-idea]').first()).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('checkbox').first()).toBeFocused()
    await page.keyboard.press('Space')
    await expect(page.getByRole('checkbox').first()).toBeChecked()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
