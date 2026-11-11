import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { DAHL, chip, pickRows, recipesRegion } from './page'

/* #233 The order pad on a ticket: "portion for 3", "at most 100 g red lentils". */

const pad = (page: Page) =>
  recipesRegion(page).getByRole('textbox', { name: 'Order pad' })
const say = async (page: Page, text: string) => {
  await pad(page).fill(text)
  await recipesRegion(page).getByRole('button', { name: 'Apply' }).click()
}

test.describe('order pad (#233)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await pickRows(page, DAHL)
    await recipesRegion(page)
      .getByRole('button', { name: `${DAHL} details` })
      .click()
  })

  test('"portion for 3" scales every chip on the ticket', async ({ page }) => {
    const lentils = chip(page, 'red-lentils', 'row-dahl')
    const before = await lentils.innerText()
    await say(page, 'portion for 3')
    await expect(recipesRegion(page).getByRole('status')).toHaveText(
      'Portions set to 3.'
    )
    await expect(lentils).not.toHaveText(before)
    await expect(pad(page)).toHaveValue('')
  })

  test('"at most 100 g red lentils" cuts that ingredient to the limit', async ({
    page
  }) => {
    const lentils = chip(page, 'red-lentils', 'row-dahl')
    await say(page, 'at most 100 g red lentils')
    await expect(recipesRegion(page).getByRole('status')).toHaveText(
      'Red lentils set to 100 g.'
    )
    await expect(lentils).toContainText('100 g')
  })

  test('a phrase it cannot use is explained and kept for editing', async ({
    page
  }) => {
    await say(page, 'at most 1 kg carrots')
    await expect(recipesRegion(page).getByRole('status')).toHaveText(
      'No carrots in this recipe.'
    )
    await expect(pad(page)).toHaveValue('at most 1 kg carrots')
  })

  test('the pad and its Apply button fit inside the screen', async ({
    page
  }) => {
    const apply = recipesRegion(page).getByRole('button', { name: 'Apply' })
    const { width } = page.viewportSize() ?? { width: 0 }
    const b = await apply.boundingBox()
    expect(b === null ? Infinity : b.x + b.width).toBeLessThanOrEqual(width)
  })

  test('screenshot', async ({ page }, info) => {
    test.skip(!process.env['SHOTS'], 'screenshots only on request')
    const w = info.project.name === 'mobile' ? 390 : 1280
    await say(page, 'at most 100 g red lentils')
    await expect(recipesRegion(page).getByRole('status')).toBeVisible()
    await pad(page).scrollIntoViewIfNeeded()
    await page.screenshot({
      path: `/workspace/report-204-241/233-orderpad-${w}.png`
    })
  })
})
