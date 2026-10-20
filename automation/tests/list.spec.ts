import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

const chips = (page: Page) =>
  page.getByRole('list', { name: /^Shopping list, \d+ items?$/ })

/** The live "n of m in basket" line above the list (the shop bar repeats it). */
const basketLine = (page: Page, text: string) =>
  page.getByRole('paragraph').filter({ hasText: new RegExp(`^${text}$`) })

const startList = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Spaghetti bolognese' }).click()
  await page.getByRole('button', { name: /^Next: check at home/ }).click()
  await expect(
    page.getByRole('heading', { name: 'At home', level: 1 })
  ).toBeVisible()
}

test.describe('shopping list', () => {
  test('at home: chips list what to buy; a tick can be undone, then moves', async ({
    page
  }) => {
    await startList(page)
    await expect(chips(page)).toHaveAccessibleName('Shopping list, 9 items')
    await expect(chips(page).getByText('Carrot')).toBeVisible()

    const carrot = page.getByRole('checkbox', { name: /^Carrot / })
    await carrot.check()
    await expect(page.getByText('carrot: Moved to Already have')).toBeVisible()
    await page.getByRole('button', { name: 'Undo carrot' }).click()
    await expect(carrot).not.toBeChecked()
    await expect(chips(page)).toHaveAccessibleName('Shopping list, 9 items')

    await carrot.check()
    await expect(
      page.getByRole('button', { name: 'Already have (1)' })
    ).toBeVisible()
    await expect(chips(page)).toHaveAccessibleName('Shopping list, 8 items')
    await expect(chips(page).getByText('Carrot')).toHaveCount(0)
  })

  test('at the shop: quick ticks all register, then Shopping done', async ({
    page
  }) => {
    await startList(page)
    await page.getByRole('button', { name: /^Next: at the shop/ }).click()
    await expect(
      page.getByRole('heading', { name: 'At the shop', level: 1 })
    ).toBeVisible()
    await expect(basketLine(page, '0 of 9 in basket')).toBeVisible()

    // three ticks in quick succession, before any of them settles
    const ticked = [/^Brown onion /, /^Celery /, /^Garlic /].map((name) =>
      page.getByRole('checkbox', { name })
    )
    for (const row of ticked) await row.check()
    await expect(basketLine(page, '3 of 9 in basket')).toBeVisible()
    for (const row of ticked) await expect(row).toBeChecked()

    await page.getByRole('button', { name: "I'm done shopping" }).click()
    await expect(page).toHaveURL('/tapoff')
    await expect(
      page.getByRole('heading', { name: 'Shopping done', level: 1 })
    ).toBeVisible()
    await expect(page.getByText('3 items are in the basket')).toBeVisible()
    await expect(page.getByText('6 are still to buy')).toBeVisible()
  })
})
