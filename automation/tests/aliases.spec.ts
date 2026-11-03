import { expect, test } from './fixtures'
import { explore, openExplore, searchBox } from './page'

/* #239 Multiple names for the same ingredient: search accepts regional and trade names;
   the one primary name is what shows. */

test.describe('ingredient aliases (#239)', () => {
  test('cilantro finds fresh coriander and says so; the name stays the one name', async ({
    page
  }) => {
    await page.goto('/')
    await openExplore(page)
    await searchBox(page).fill('cilantro')
    const result = explore(page).getByRole('button', {
      name: 'Add fresh coriander'
    })
    await expect(result).toContainText('+ Fresh coriander')
    await expect(result).toContainText('Also called cilantro')
    await expect(explore(page).getByText('+ Cilantro')).toHaveCount(0)
  })

  test('a regional spelling finds it too, and adding it puts the primary name on the list', async ({
    page
  }) => {
    await page.goto('/')
    await openExplore(page)
    await searchBox(page).fill('courgette')
    await explore(page).getByRole('button', { name: 'Add zucchini' }).click()
    await expect(
      explore(page).getByRole('button', { name: 'zucchini, on your list' })
    ).toBeVisible()
  })

  test('typing the primary name adds no "Also called" line', async ({
    page
  }) => {
    await page.goto('/')
    await openExplore(page)
    await searchBox(page).fill('coriander')
    await expect(explore(page).getByText('Also called')).toHaveCount(0)
  })
})
