import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { DAHL, chevron, panel, pickRows } from './page'

/* #213 Core food-safety notes appear at the decision points, in every mode, and cannot be dismissed. */

const BUTTER_CHICKEN = 'Butter chicken'

const notes = (page: Page) => page.getByRole('region', { name: 'Food safety' })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('food safety (#213)', () => {
  test('a chicken recipe brings raw-food, hand-wash and storage notes above the list', async ({
    page
  }) => {
    await pickRows(page, BUTTER_CHICKEN)
    const list = notes(page).first()
    await expect(list).toContainText('Keep raw meat and eggs apart')
    await expect(list).toContainText('Wash and dry your hands')
    await expect(list).toContainText('5 °C or below')
    await expect(list.getByRole('button')).toHaveCount(0)
  })

  test('a vegetarian dahl with no chilled raw food has no hand-wash note', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await expect(page.getByText('Wash and dry your hands')).toHaveCount(0)
  })

  test('the raw chicken chip carries its own notes in its details', async ({
    page
  }) => {
    await pickRows(page, BUTTER_CHICKEN)
    await chevron(page, 'chicken-thigh').click()
    await expect(
      panel(page, 'Chicken thigh fillets').getByRole('region', {
        name: 'Food safety'
      })
    ).toContainText('Wash and dry your hands')
  })
})
