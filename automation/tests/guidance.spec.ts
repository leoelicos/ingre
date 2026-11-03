import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { explore, openExplore, searchBox } from './page'

/* #206 Guidance dial: one slider, four positions, each changes how much Explore does for you. */

const dial = (page: Page) =>
  explore(page).getByRole('slider', { name: 'Guidance', exact: true })

const use = (page: Page, name: string) =>
  explore(page).getByRole('button', { name: `Use ${name}`, exact: true })

test.describe('guidance dial (#206)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await openExplore(page)
  })

  test('starts on Assisted, where Use buttons show', async ({ page }) => {
    await expect(dial(page)).toHaveAccessibleDescription('Assisted')
    await searchBox(page).fill('carrot')
    await expect(use(page, 'carrot')).toBeVisible()
  })

  test('Self-directed drops the Use buttons, Details stays', async ({
    page
  }) => {
    await dial(page).focus()
    await page.keyboard.press('Home')
    await expect(dial(page)).toHaveAccessibleDescription('Self-directed')
    await searchBox(page).fill('carrot')
    await expect(use(page, 'carrot')).toHaveCount(0)
    await expect(
      explore(page).getByRole('button', {
        name: 'Details of carrot',
        exact: true
      })
    ).toBeVisible()
  })

  test('Hand-held outlines every missing ingredient and remembers the position', async ({
    page
  }) => {
    await dial(page).focus()
    await page.keyboard.press('End')
    await expect(dial(page)).toHaveAccessibleDescription('Hand-held')
    await searchBox(page).fill('carrot')
    await use(page, 'carrot').click()
    await expect(
      explore(page).locator('[data-name-chip][data-flagged="true"]').first()
    ).toBeVisible()
    await page.reload()
    await openExplore(page)
    await expect(dial(page)).toHaveAccessibleDescription('Hand-held')
  })
})
