import { expect, test } from './fixtures'

test.describe('header search', () => {
  test('Tab accepts the suggestion; Enter searches Pick', async ({ page }) => {
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
    await expect(
      page.getByRole('link', { name: 'View recipe: Spaghetti bolognese' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /^View recipe: / })
    ).toHaveCount(1)
  })
})
