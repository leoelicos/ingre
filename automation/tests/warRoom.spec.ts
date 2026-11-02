import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { ingredientsRegion } from './page'

/* #207 War room: a button in the menu bar opens a bare, fast capture list. */

const field = (page: Page) =>
  page.getByRole('textbox', { name: 'Add an item', exact: true })

test.describe('war room (#207)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'War room', exact: true })
      .click()
  })

  test('opens from the menu bar with the field ready to type into', async ({
    page
  }) => {
    await expect(page).toHaveURL(/\/war-room$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'War room' })
    ).toBeVisible()
    await expect(field(page)).toBeFocused()
  })

  test('typing and Enter, over and over, with an inline acknowledgement each time', async ({
    page
  }) => {
    for (const [text, said] of [
      ['3 carrots', 'Carrot added'],
      ['garlic', 'Garlic added'],
      ['egg', 'Eggs added']
    ] as const) {
      await page.keyboard.type(text)
      await page.keyboard.press('Enter')
      await expect(page.getByRole('status')).toHaveText(said)
    }
    const captured = page.getByRole('list', { name: 'Captured', exact: true })
    await expect(captured.getByRole('listitem')).toHaveCount(3)
    await expect(captured).toContainText('×3')
  })

  test('autofill buttons add in one tap', async ({ page }) => {
    await page.keyboard.type('car')
    await page.getByRole('button', { name: 'Add carrot', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Carrot added')
    await expect(field(page)).toBeFocused()
  })

  test('what was captured is on the shopping list', async ({ page }) => {
    await page.keyboard.type('2 onions')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('status')).toHaveText('Brown onion added')
    await page
      .getByRole('link', { name: 'Back to your list', exact: true })
      .click()
    await expect(ingredientsRegion(page)).toContainText('Brown onion')
  })
})
