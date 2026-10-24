import { expect, test } from './fixtures'

test.describe('header search', () => {
  test('Tab accepts the suggestion; Enter filters the recipe rows', async ({
    page
  }) => {
    await page.goto('/')
    const box = page.getByRole('combobox', {
      name: 'Search recipes or ingredients'
    })
    await box.click()
    await box.pressSequentially('bolo')
    await expect(page.getByRole('option').first()).toContainText(
      'Spaghetti bolognese'
    )
    await page.keyboard.press('Tab')
    await expect(box).toHaveValue('Spaghetti bolognese')
    await expect(box).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/?q=Spaghetti%20bolognese')
    const rows = page
      .getByRole('region', { name: 'Recipes' })
      .getByRole('button', { name: / details$/ })
    await expect(rows).toHaveCount(1)
    await expect(
      page.getByRole('button', { name: 'Spaghetti bolognese', exact: true })
    ).toBeVisible()
  })

  test('an ingredient with no recipes is offered as a chip', async ({
    page
  }) => {
    await page.goto('/?q=banana')
    await page.getByRole('button', { name: '+ Add banana' }).click()
    await expect(page.locator('[data-chip="banana"]')).toHaveCount(1)
  })
})
