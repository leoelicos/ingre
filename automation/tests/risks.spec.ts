import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { chipToggle, pickRows } from './page'

/* #220 Risk handling: five risks on the list page, each with what to do. */

const CHOPS = 'Pork chops with apples and onion'
const BUTTER_CHICKEN = 'Butter chicken'

const risks = (page: Page): Locator =>
  page.getByRole('region', { name: 'Risks', exact: true })
const risk = (page: Page, name: string): Locator =>
  risks(page)
    .getByRole('heading', { level: 3, name, exact: true })
    .locator('..')
const budgetBox = (page: Page): Locator =>
  risks(page).getByRole('textbox', { name: 'Budget for this shop, in dollars' })
const fridgeBox = (page: Page): Locator =>
  risks(page).getByRole('textbox', { name: 'Free fridge space, in litres' })

test.describe('Risk handling (#220)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has no Risks until a recipe is picked, then the five risks', async ({
    page
  }) => {
    await expect(risks(page)).toHaveCount(0)
    await pickRows(page, BUTTER_CHICKEN)
    await expect(risks(page).getByRole('heading', { level: 3 })).toHaveText([
      'If the shop is out of something',
      'If you cannot get to a shop',
      'Budget',
      'Fridge space',
      'If the oven fails'
    ])
    await expect(
      risk(page, 'If the shop is out of something').getByText(
        'Butter: use ghee, or a neutral oil.'
      )
    ).toBeVisible()
    await expect(
      risk(page, 'If the oven fails').getByText(
        'Nothing on your list needs the oven.'
      )
    ).toBeVisible()
  })

  test('crossing items off shows what can still be cooked without a shop', async ({
    page
  }) => {
    await pickRows(page, CHOPS)
    const access = risk(page, 'If you cannot get to a shop')
    await expect(
      access.getByText(`${CHOPS}: 4 items still to get.`)
    ).toBeVisible()
    for (const id of ['pork-loin-chop', 'apple', 'onion', 'butter'])
      await chipToggle(page, id).click()
    await expect(
      access.getByText(`${CHOPS}: you have everything to cook it.`)
    ).toBeVisible()
  })

  test('a budget set below the cost is flagged in words, names the recipe to drop, and is kept', async ({
    page
  }) => {
    await pickRows(page, BUTTER_CHICKEN)
    await budgetBox(page).fill('1')
    await budgetBox(page).blur()
    const budget = risk(page, 'Budget')
    await expect(budget.getByText(/^Check: Over budget by \$/)).toBeVisible()
    await expect(
      budget.getByText(/^Dropping Butter chicken saves about \$/)
    ).toBeVisible()
    await expect(risks(page).getByText('1 to check')).toBeVisible()
    await page.reload()
    await expect(budgetBox(page)).toHaveValue('1')
    await budgetBox(page).fill('500')
    await budgetBox(page).blur()
    await expect(budget.getByText(/^Within budget: about \$/)).toBeVisible()
  })

  test('chilled food too big for the fridge space is flagged, and fits when there is room', async ({
    page,
    outsideRequests
  }) => {
    await pickRows(page, BUTTER_CHICKEN)
    await fridgeBox(page).fill('0.1')
    await fridgeBox(page).blur()
    const fridge = risk(page, 'Fridge space')
    await expect(
      fridge.getByText(/^Check: Too much for the fridge: about /)
    ).toBeVisible()
    await fridgeBox(page).fill('30')
    await fridgeBox(page).blur()
    await expect(fridge.getByText(/^Fits: about .* in 30 L\.$/)).toBeVisible()
    expect(outsideRequests).toEqual([])
  })
})
