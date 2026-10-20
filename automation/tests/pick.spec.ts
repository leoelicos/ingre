import { expect, test } from './fixtures'

test.describe('pick', () => {
  test('tap recipe cards to choose them for this shop', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Pick', level: 1 })
    ).toBeVisible()
    const next = page.getByRole('button', { name: /^Next: check at home/ })
    await expect(next).toHaveAttribute('aria-disabled', 'true')

    const bolognese = page.getByRole('button', { name: 'Spaghetti bolognese' })
    const rice = page.getByRole('button', { name: 'Egg fried rice' })
    await bolognese.click()
    await rice.click()
    await expect(bolognese).toHaveAttribute('aria-pressed', 'true')
    await expect(rice).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('2 recipes')).toBeVisible()
    await expect(next).not.toHaveAttribute('aria-disabled', 'true')

    // tap again to take one off
    await rice.click()
    await expect(rice).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByText('1 recipe', { exact: true })).toBeVisible()

    // the choice is kept on this device
    await page.reload()
    await expect(
      page.getByRole('button', { name: 'Spaghetti bolognese' })
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('a recipe card opens its recipe page', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('link', { name: 'View recipe: Red lentil dahl' })
      .click()
    await expect(page).toHaveURL('/recipe/dahl')
    await expect(
      page.getByRole('heading', { name: 'Red lentil dahl', level: 1 })
    ).toBeVisible()
  })
})
