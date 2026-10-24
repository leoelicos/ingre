import { expect, newAccount, signUp, test } from './fixtures'
import { DAHL, explore, exploreRow, openExplore } from './page'

test.describe('saved (#182, F4: server hearts; Saved is an Explore filter)', () => {
  test('save from the inline row; the heart comes from the server after a reload; the Saved filter narrows Explore', async ({
    page
  }) => {
    await signUp(page, newAccount())
    await openExplore(page)
    const see = () =>
      explore(page).getByRole('button', { name: `See recipe: ${DAHL}` })
    await see().click()
    await explore(page)
      .getByRole('button', { name: `Save ${DAHL}` })
      .click()
    await expect(
      explore(page).getByRole('button', { name: `Unsave ${DAHL}` })
    ).toHaveAttribute('aria-pressed', 'true')

    // the heart is on the server, not just this page
    await page.evaluate(() => {
      for (const key of Object.keys(localStorage))
        if (!/token/i.test(key)) localStorage.removeItem(key)
    })
    await page.reload()
    await openExplore(page)
    await see().click()
    await expect(
      explore(page).getByRole('button', { name: `Unsave ${DAHL}` })
    ).toHaveAttribute('aria-pressed', 'true')

    await explore(page)
      .getByRole('toolbar', { name: 'Explore actions' })
      .getByRole('button', { name: /^Filter/ })
      .click()
    const filter = explore(page).getByRole('group', { name: 'Filter Explore' })
    const rows = explore(page).getByRole('button', { name: /^See recipe: / })
    const saved = filter.getByRole('switch', { name: 'Saved' })
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
