import { expect, test } from './fixtures'
import { DAHL, pickRows } from './page'

/* #192: section headings stay open. Recipes is raised; Ingredients' header is the raised row. */

test.describe('section headers (#192)', () => {
  test('Recipes and Ingredients are headings, not accordion buttons', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await pickRows(page, DAHL)
    for (const name of ['Ingredients', 'Recipes']) {
      const heading = page.getByRole('heading', {
        level: 2,
        name,
        exact: true
      })
      await expect(heading).toBeVisible()
      await expect(heading.getByRole('button')).toHaveCount(0)
      await expect(heading).not.toHaveAttribute('aria-expanded')
    }
    await expect(page.getByRole('region', { name: 'Explore' })).toHaveCount(0)
  })
})
