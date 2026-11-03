import { expect, test } from './fixtures'
import {
  chip,
  explore,
  extraRegion,
  ingredientsRegion,
  openExplore,
  searchBox
} from './page'

/* #231 Non-food items: gloves, kitchen paper, a saucepan on the same list as the food. */

test.describe('non-food items (#231)', () => {
  test('a search finds gloves and labels them not food', async ({ page }) => {
    await page.goto('/')
    await openExplore(page)
    await searchBox(page).fill('gloves')
    await expect(
      explore(page).getByRole('button', { name: 'Add disposable gloves' })
    ).toContainText('Household & kitchen · not food')
  })

  test('a saucepan goes on the list next to the food, under Household & kitchen', async ({
    page
  }) => {
    await page.goto('/')
    await openExplore(page)
    await searchBox(page).fill('saucepan')
    await explore(page).getByRole('button', { name: 'Add saucepan' }).click()
    await expect(chip(page, 'saucepan')).toHaveCount(1)
    await expect(chip(page, 'saucepan', 'extra')).toHaveCount(1)
    await expect(
      ingredientsRegion(page).getByRole('heading', {
        name: 'Household & kitchen'
      })
    ).toBeVisible()
    await expect(extraRegion(page).getByText('Saucepan').first()).toBeVisible()
  })

  test('a food and a non-food item share one list, and crossing off works the same', async ({
    page
  }) => {
    await page.goto('/')
    await openExplore(page)
    for (const [q, name] of [
      ['banana', 'Add banana'],
      ['kitchen paper', 'Add kitchen paper']
    ] as const) {
      await searchBox(page).fill(q)
      await explore(page).getByRole('button', { name }).click()
    }
    await expect(chip(page, 'banana')).toHaveCount(1)
    await expect(chip(page, 'kitchen-paper')).toHaveCount(1)
    const toggle = chip(page, 'kitchen-paper').getByRole('button', {
      name: /, /
    })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })
})
