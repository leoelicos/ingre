import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { searchBox } from './page'

/* #211 First run: Landing (a hard stop), three skippable TMD questions, then Explore. */

test.use({ firstRun: 'fresh' })

const getStarted = (page: Page) =>
  page.getByRole('button', { name: 'Get started' })

const step = (page: Page, n: number) => page.getByText(`Step ${n} of 3`)

test.describe('first run (#211)', () => {
  test('a first visit is the landing: a headline, three cards, one button, no app chrome', async ({
    page
  }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /organised ingredient lists/
      })
    ).toBeVisible()
    await expect(
      page.getByRole('group', { name: /^Card \d of 3$/ })
    ).toHaveCount(3)
    await expect(getStarted(page)).toBeVisible()
    await expect(searchBox(page)).toHaveCount(0)
    await page.goto('/?q=carrot')
    await expect(getStarted(page)).toBeVisible()
  })

  test('Next scrolls to the next card, Previous back; nothing moves by itself', async ({
    page
  }) => {
    await page.goto('/')
    const card = (n: number) =>
      page.getByRole('group', { name: `Card ${n} of 3` })
    await expect(
      page.getByText('Card 1 of 3', { exact: true }).last()
    ).toBeVisible()
    await page.waitForTimeout(1500)
    await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(card(2)).toBeInViewport({ ratio: 0.9 })
    await expect(page.getByRole('button', { name: 'Previous' })).toBeEnabled()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(card(3)).toBeInViewport({ ratio: 0.9 })
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled()
    await page.getByRole('button', { name: 'Previous' }).click()
    await expect(card(2)).toBeInViewport({ ratio: 0.9 })
  })

  test('Get started asks three questions; Finish saves them and opens Explore', async ({
    page
  }) => {
    await page.goto('/')
    await getStarted(page).click()
    await expect(step(page, 1)).toBeVisible()
    await page.getByText('Hand-held').click()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(step(page, 2)).toBeVisible()
    await page.getByText('Vegetarian').click()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(step(page, 3)).toBeVisible()
    await page.getByText('Peanut').click()
    await expect(page.getByRole('checkbox', { name: 'Peanut' })).toBeChecked()
    await page.getByRole('button', { name: 'Finish' }).click()
    await expect(searchBox(page)).toBeVisible()
    await expect(
      page.getByRole('slider', { name: 'Guidance', exact: true })
    ).toHaveAccessibleDescription('Hand-held')
    await page.reload()
    await expect(searchBox(page)).toBeVisible()
    await expect(getStarted(page)).toHaveCount(0)
  })

  test('Skip ends the first run on Assisted, and a reload mid-way resumes the questions', async ({
    page
  }) => {
    await page.goto('/')
    await getStarted(page).click()
    await page.reload()
    await expect(step(page, 1)).toBeVisible()
    await page.getByRole('button', { name: 'Skip' }).click()
    await expect(searchBox(page)).toBeVisible()
    await expect(
      page.getByRole('slider', { name: 'Guidance', exact: true })
    ).toHaveAccessibleDescription('Assisted')
  })

  test('the questions can be asked again from the account menu (Set-up)', async ({
    page
  }) => {
    await page.goto('/')
    await getStarted(page).click()
    await page.getByRole('button', { name: 'Skip' }).click()
    await page.getByRole('button', { name: 'Account' }).click()
    await page.getByRole('menuitem', { name: 'Set-up' }).click()
    await expect(page).toHaveURL(/\/setup$/)
    await expect(step(page, 1)).toBeVisible()
    await page.getByRole('button', { name: 'Skip' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('Log in is open without going through the landing', async ({ page }) => {
    await page.goto('/login')
    await expect(
      page.getByRole('heading', { name: 'Log in', level: 1 })
    ).toBeVisible()
  })
})
