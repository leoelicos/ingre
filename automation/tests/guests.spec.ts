import { expect, test } from './fixtures'
import { DAHL, chip, explore, openExplore, pickRows } from './page'

/* #209 Guest profiles: allergens per guest, flagged in words and an outline, never silently changed. */

test.describe('guest profiles (#209)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await openExplore(page)
    await explore(page)
      .getByRole('toolbar', { name: 'Explore actions' })
      .getByRole('button', { name: 'Guests', exact: true })
      .click()
    const panel = page.getByRole('group', { name: 'Guests at the table' })
    await panel.getByLabel('Guest name').fill('Kai')
    await panel.getByRole('button', { name: 'Add guest' }).click()
    /* The visible box sits over the hidden input, so tick it by its label, as a person does. */
    await panel
      .locator('label')
      .filter({ hasText: /^milk$/ })
      .click()
    await expect(
      panel.getByRole('checkbox', { name: 'milk', exact: true })
    ).toBeChecked()
  })

  test("a guest's allergens flag the recipe in words and the clashing ingredient with an outline", async ({
    page
  }) => {
    const flag = explore(page)
      .getByTestId('guest-flag')
      .filter({ hasText: "Kai can't have: milk" })
    await expect(flag.first()).toBeVisible()
    await expect(page.locator('[data-guest-flag]').first()).toBeVisible()
  })

  test('a picked recipe and its list chip are flagged, and the guest survives a reload', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await expect(chip(page, 'butter')).toHaveAttribute(
      'data-guest-flag',
      'true'
    )
    await expect(chip(page, 'onion')).not.toHaveAttribute('data-guest-flag')
    await page.reload()
    await expect(chip(page, 'butter')).toHaveAttribute(
      'data-guest-flag',
      'true'
    )
  })
})
