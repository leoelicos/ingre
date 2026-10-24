import { expect, test } from './fixtures'

test.describe('saved', () => {
  test('save from the recipe page; the Saved filter shows only saved recipes', async ({
    page
  }) => {
    await page.goto('/recipe/dahl')
    const heart = page.getByRole('button', { name: 'Save Red lentil dahl' })
    await heart.click()
    await expect(
      page.getByRole('button', { name: 'Unsave Red lentil dahl' })
    ).toHaveAttribute('aria-pressed', 'true')

    await page.goto('/')
    const rows = page
      .getByRole('region', { name: 'Recipes' })
      .getByRole('button', { name: / details$/ })
    const saved = page.getByRole('switch', { name: 'Saved' })
    const toggle = async () => {
      await saved.focus()
      await page.keyboard.press('Space')
    }
    await toggle()
    await expect(saved).toBeChecked()
    await expect(page).toHaveURL('/?saved=1')
    await expect(
      page.getByRole('button', { name: 'Red lentil dahl', exact: true })
    ).toBeVisible()
    await expect(rows).toHaveCount(1)

    // turning the filter off shows the whole library again
    await toggle()
    await expect(saved).not.toBeChecked()
    expect(await rows.count()).toBeGreaterThan(1)
  })
})
