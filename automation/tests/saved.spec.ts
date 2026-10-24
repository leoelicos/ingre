import { expect, newAccount, signUp, test } from './fixtures'
import { DAHL, explore, exploreRow, openExplore } from './page'

test.describe('saved (#181: a filter on Explore)', () => {
  test('save from the inline row; the Saved filter narrows Explore to saved recipes', async ({
    page
  }) => {
    await signUp(page, newAccount())
    await openExplore(page)
    await explore(page)
      .getByRole('button', { name: `See recipe: ${DAHL}` })
      .click()
    await explore(page)
      .getByRole('button', { name: `Save ${DAHL}` })
      .click()
    await expect(
      explore(page).getByRole('button', { name: `Unsave ${DAHL}` })
    ).toHaveAttribute('aria-pressed', 'true')

    const rows = explore(page).getByRole('button', { name: /^See recipe: / })
    const saved = explore(page).getByRole('switch', { name: 'Saved' })
    const toggle = async () => {
      await saved.focus()
      await page.keyboard.press('Space')
    }
    await toggle()
    await expect(saved).toBeChecked()
    await expect(page).toHaveURL(/[?&]saved=1/)
    await expect(exploreRow(page, DAHL)).toBeVisible()
    await expect(rows).toHaveCount(1)

    // turning the filter off shows the whole library again
    await toggle()
    await expect(saved).not.toBeChecked()
    expect(await rows.count()).toBeGreaterThan(1)
  })
})
