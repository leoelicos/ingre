import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { pickRows } from './page'

/* #221 Precise execution: prep ahead, timed steps, weights, labels and dietary separation. */

const BOLOGNESE = 'Spaghetti bolognese'
const DAHL = 'Red lentil dahl'
const KEEMA = 'Beef keema with peas'
const SHAKING = 'Shaking beef (bò lúc lắc)'

const plan = (page: Page): Locator =>
  page.getByRole('region', { name: 'Cook plan', exact: true })
const block = (page: Page, name: string): Locator =>
  plan(page).getByRole('heading', { level: 3, name, exact: true }).locator('..')
const dayBox = (page: Page): Locator => plan(page).getByLabel('Day you cook')

test.describe('Precise execution (#221)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has no Cook plan until a recipe is picked, then six blocks', async ({
    page
  }) => {
    await expect(plan(page)).toHaveCount(0)
    await pickRows(page, SHAKING)
    await expect(plan(page).getByRole('heading', { level: 3 })).toHaveText([
      'Prepare ahead',
      'Timed steps',
      'Weigh out',
      'Where to find',
      'Keeping diets apart',
      'Container labels'
    ])
  })

  test('timed steps and exact weights come from the recipe at its portions', async ({
    page
  }) => {
    await pickRows(page, SHAKING)
    await expect(
      block(page, 'Timed steps').getByText('2 to 3 minutes')
    ).toBeVisible()
    await expect(
      block(page, 'Weigh out').getByText('Beef rump steak: 350 g')
    ).toBeVisible()
    await expect(
      block(page, 'Where to find').getByText('Butcher: rump steak', {
        exact: false
      })
    ).toBeVisible()
  })

  test('setting the day puts dates on the prep and the container labels, and keeps them on reload', async ({
    page
  }) => {
    await pickRows(page, BOLOGNESE)
    await expect(
      block(page, 'Prepare ahead').getByText('1 day before')
    ).toBeVisible()
    await dayBox(page).fill('2026-11-07')
    await expect(
      block(page, 'Prepare ahead').getByText('Fri, 6 Nov')
    ).toBeVisible()
    await expect(
      block(page, 'Container labels').getByText(
        'Spaghetti from Spaghetti bolognese. Cooked Sat, 7 Nov. Eat by Mon, 9 Nov (2 days)'
      )
    ).toBeVisible()
    await page.reload()
    await expect(dayBox(page)).toHaveValue('2026-11-07')
    await expect(plan(page).getByText('Sat, 7 Nov').first()).toBeVisible()
  })

  test('avoiding an allergen says which dish is safe and the order to cook in', async ({
    page
  }) => {
    await pickRows(page, DAHL, KEEMA)
    const diet = block(page, 'Keeping diets apart')
    await diet.getByRole('checkbox', { name: 'Milk' }).check()
    await expect(diet.getByText('Red lentil dahl contains milk')).toBeVisible()
    await expect(diet.getByText(`Safe for them: ${KEEMA}`)).toBeVisible()
    await expect(
      diet.getByText(`Cook ${KEEMA} first, on clean equipment.`)
    ).toBeVisible()
    await page.reload()
    await expect(
      block(page, 'Keeping diets apart').getByRole('checkbox', { name: 'Milk' })
    ).toBeChecked()
  })

  test('the kitchen booking note is kept', async ({ page }) => {
    await pickRows(page, DAHL)
    await plan(page)
      .getByLabel('Kitchen booking')
      .fill('Shared kitchen, Saturday 9 am')
    await page.reload()
    await expect(plan(page).getByLabel('Kitchen booking')).toHaveValue(
      'Shared kitchen, Saturday 9 am'
    )
  })
})
