import type { Locator, Page } from '@playwright/test'
import { expect, newAccount, signUp, test } from './fixtures'
import {
  DAHL,
  chevron,
  chip,
  chipToggle,
  explore,
  exploreRow,
  extraRegion,
  openExplore,
  openPantry,
  panel,
  pickOption,
  pickRows,
  recipesRegion,
  row,
  setBox,
  sourceBox
} from './page'

/* #182 Stage 2: the remaining behaviours, one scenario each. */

const BUTTER_CHICKEN = 'Butter chicken'

const answer = (page: Page, name: string, reply: 'Yes' | 'No') =>
  page
    .getByRole('group', { name, exact: true })
    .getByRole('button', { name: reply, exact: true })
    .click()
const toolbar = (page: Page, name: string): Locator =>
  page.getByRole('toolbar', { name })
const openRow = (page: Page, title: string) =>
  recipesRegion(page)
    .getByRole('button', { name: `${title} details` })
    .click()
const portions = (page: Page): Locator =>
  recipesRegion(page).getByRole('textbox', { name: 'Portions' })
const removeButterFromDahl = async (page: Page) => {
  await chevron(page, 'butter').click()
  await setBox(sourceBox(panel(page, 'Butter'), DAHL), '0')
  await answer(page, `Remove butter from ${DAHL}?`, 'Yes')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('recipe copies, more (#182)', () => {
  test('an edit changes only that recipe', async ({ page }) => {
    await pickRows(page, BUTTER_CHICKEN, DAHL)
    await chevron(page, 'butter').click()
    const butter = panel(page, 'Butter')
    await setBox(sourceBox(butter, DAHL), '30')
    await expect(sourceBox(butter, BUTTER_CHICKEN)).toHaveValue('25')
    await expect(butter.getByText('Total: 55 g')).toBeVisible()
  })

  test('portions are whole numbers from 1 to 12 (answer 30)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await openRow(page, DAHL)
    await setBox(portions(page), '13')
    await expect(portions(page)).toHaveValue('12')
    await setBox(portions(page), '0')
    await expect(portions(page)).toHaveValue('1')
  })

  test('there is no Undo, and Refresh resets only customisations and portions (answers 25, 35)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await chevron(page, 'butter').click()
    await setBox(sourceBox(panel(page, 'Butter'), DAHL), '30')
    await openRow(page, DAHL)
    await setBox(portions(page), '4')
    await chipToggle(page, 'tomato').click()
    await expect(page.getByRole('button', { name: /undo/i })).toHaveCount(0)
    await toolbar(page, 'Ingredients actions')
      .getByRole('button', { name: 'Refresh' })
      .click()
    await answer(
      page,
      'Reset every recipe to its original ingredients and 2 portions?',
      'Yes'
    )
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(
      /^Butter, 15 g, /
    )
    await expect(portions(page)).toHaveValue('2')
    await expect(chipToggle(page, 'tomato')).toBeChecked()
    // staples belong to the recipe (owner decision 1): Refresh keeps them and adds no Extra
    await expect(chip(page, 'salt')).toHaveCount(1)
    await expect(chip(page, 'salt', 'extra')).toHaveCount(0)
  })

  test('an expanded row has no "You\'ll also need" (F6)', async ({ page }) => {
    await pickRows(page, DAHL)
    await openRow(page, DAHL)
    await expect(recipesRegion(page).getByText('Method')).not.toHaveCount(0)
    await expect(page.getByText(/also need/i)).toHaveCount(0)
  })

  test('the Explore filter uses the originals (answer 37)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await removeButterFromDahl(page)
    await openExplore(page)
    await toolbar(page, 'Explore actions')
      .getByRole('button', { name: /^Filter/ })
      .click()
    const filter = page.getByRole('group', { name: 'Filter Explore' })
    const input = filter.getByRole('combobox', { name: 'Contains' })
    await input.click()
    await input.pressSequentially('Butter')
    await expect(input).toHaveValue('Butter')
    await pickOption(page, 'Butter')
    await page.keyboard.press('Escape')
    await expect(exploreRow(page, DAHL)).toBeVisible()
    await expect(exploreRow(page, 'Shaking beef (bò lúc lắc)')).toHaveCount(0)
  })

  test('signed in, a saved recipe picked again starts from the original (answer 49)', async ({
    page
  }) => {
    await signUp(page, newAccount())
    await pickRows(page, DAHL)
    await chevron(page, 'butter').click()
    await setBox(sourceBox(panel(page, 'Butter'), DAHL), '30')
    await openRow(page, DAHL)
    await recipesRegion(page)
      .getByRole('button', { name: `Save ${DAHL}` })
      .click()
    await expect(
      recipesRegion(page).getByRole('button', { name: `Unsave ${DAHL}` })
    ).toBeVisible()
    await openExplore(page)
    await exploreRow(page, DAHL).click()
    await expect(row(page, DAHL)).toHaveCount(0)
    await exploreRow(page, DAHL).click()
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(
      /^Butter, 15 g, /
    )
    await expect(explore(page).getByText('Butter 15 g → 30 g')).toHaveCount(0)
  })
})

test.describe('kept from before this release (#182, answers 6, 10, 45)', () => {
  test('old picks keep their Serves as portions, typed extras stay under Other, old Quantity overrides are dropped', async ({
    page
  }) => {
    await page.evaluate(() => {
      localStorage.clear()
      localStorage.setItem('ingre.list.picked', JSON.stringify(['dahl']))
      localStorage.setItem('ingre.people', JSON.stringify(3))
      localStorage.setItem(
        'ingre.list.extras',
        JSON.stringify([
          {
            id: 'birthday-candles',
            name: 'birthday candles',
            ingredientId: null,
            quantity: 1
          }
        ])
      )
      localStorage.setItem(
        'ingre.chips.edits',
        JSON.stringify({ butter: { quantity: 5, section: 'Dairy' } })
      )
    })
    await page.reload()
    await expect(row(page, DAHL)).toBeVisible()
    await openRow(page, DAHL)
    await expect(portions(page)).toHaveValue('3')
    await expect(recipesRegion(page).getByText('Portions 2 → 3')).toBeVisible()
    // 15 g at 2 portions is 22.5 g at 3; the old 5-pack override is gone
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(
      /^Butter, 22\.5 g, /
    )
    await openPantry(page)
    await expect(
      extraRegion(page).getByText('birthday candles', { exact: false })
    ).not.toHaveCount(0)
  })
})
