import type { Locator, Page } from '@playwright/test'
import { expect, newAccount, signUp, test } from './fixtures'
import {
  CURRY,
  DAHL,
  box,
  chevron,
  chip,
  chipToggle,
  explore,
  exploreRow,
  extraRegion,
  ingredientsRegion,
  openExplore,
  panel,
  pickRows,
  recipesRegion,
  row,
  section,
  setBox,
  sourceBox,
  useVertical
} from './page'

/* #182 Stage 2: balance-sheet ingredients, per-source amounts, recipe copies, filters. */

const BUTTER_CHICKEN = 'Butter chicken'

const question = (page: Page, name: string): Locator =>
  page.getByRole('group', { name, exact: true })
const answer = (page: Page, name: string, reply: 'Yes' | 'No') =>
  question(page, name).getByRole('button', { name: reply, exact: true }).click()
const toolbar = (page: Page, name: string): Locator =>
  page.getByRole('toolbar', { name })
const openFilter = (page: Page, section: string) =>
  toolbar(page, `${section} actions`)
    .getByRole('button', { name: /^Filter/ })
    .click()
/** Ticks a filter checkbox by its visible text (the input itself is visually hidden). */
const tick = (filter: Locator, name: string) =>
  filter.locator('label').filter({ hasText: name }).click()
/** Picks an ingredient in a filter's combo box. */
const choose = async (
  page: Page,
  filter: Locator,
  picker: string,
  option: string
) => {
  const input = filter.getByRole('combobox', { name: picker })
  // retried: the panel is still opening when the first keys arrive, and on a phone
  // the list can still be moving when it is first tapped
  await expect(async () => {
    await input.click()
    await input.fill('')
    await input.pressSequentially(option)
    const shown = page.getByRole('option', { name: option, exact: true })
    if (!(await shown.isVisible())) await input.press('ArrowDown')
    await shown.click({ timeout: 2000 })
  }).toPass()
  await page.keyboard.press('Escape')
}
/** Closes Explore however this width shows it, so it can't take focus from the filter. */
const closeExplore = async (page: Page) => {
  const close = page.getByRole('button', { name: 'Close Explore' })
  if (await close.isVisible()) await close.click()
}
const openRow = (page: Page, title: string) =>
  recipesRegion(page)
    .getByRole('button', { name: `${title} details` })
    .click()

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('balance-sheet ingredients (#182)', () => {
  test('a chip shows the total, with a box per recipe in its own unit (answers 1-2, F3)', async ({
    page
  }) => {
    await pickRows(page, BUTTER_CHICKEN, DAHL)
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(
      /^Butter, 40 g, /
    )
    await chevron(page, 'butter').click()
    const butter = panel(page, 'Butter')
    await expect(sourceBox(butter, BUTTER_CHICKEN)).toHaveValue('25')
    await expect(sourceBox(butter, DAHL)).toHaveValue('15')
    await expect(butter.getByText('Total: 40 g')).toBeVisible()
    await setBox(sourceBox(butter, DAHL), '17.5')
    await expect(butter.getByText('Total: 42.5 g')).toBeVisible()
    await expect(butter.getByRole('textbox', { name: 'Quantity' })).toHaveCount(
      0
    )
  })

  test('0 asks inline; No puts the box back to 1, Yes takes it off that recipe (answers 4-5, F2)', async ({
    page
  }) => {
    await pickRows(page, BUTTER_CHICKEN, DAHL)
    await chevron(page, 'butter').click()
    const butter = panel(page, 'Butter')
    const ask = `Remove butter from ${DAHL}?`
    await setBox(sourceBox(butter, DAHL), '0')
    await expect(
      question(page, ask).getByRole('button', { name: 'Yes' })
    ).toBeFocused()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await answer(page, ask, 'No')
    await expect(sourceBox(butter, DAHL)).toHaveValue('1')
    await setBox(sourceBox(butter, DAHL), '0')
    await answer(page, ask, 'Yes')
    await expect(butter.getByText('Total: 25 g')).toBeVisible()
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(/in 1 recipe/)
  })

  test('removed from every recipe, a chip greys at 0, cannot be crossed off, stays after Sort and a reload, and a number restores it (answers 16-19)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await chevron(page, 'red-lentils').click()
    const lentils = panel(page, 'Red lentils')
    await setBox(sourceBox(lentils, DAHL), '0')
    await answer(page, `Remove red lentils from ${DAHL}?`, 'Yes')
    await expect(chip(page, 'red-lentils')).toHaveAttribute(
      'data-greyed',
      'true'
    )
    await expect(chipToggle(page, 'red-lentils')).toBeDisabled()
    await expect(chipToggle(page, 'red-lentils')).toContainText('0')
    await page.getByRole('button', { name: 'Sort', exact: true }).click()
    await page.reload()
    await expect(chip(page, 'red-lentils')).toHaveAttribute(
      'data-greyed',
      'true'
    )
    await chevron(page, 'red-lentils').click()
    await setBox(sourceBox(lentils, DAHL), '150')
    await expect(chip(page, 'red-lentils')).toHaveAttribute(
      'data-greyed',
      'false'
    )
  })

  test('Refresh asks, then resets every recipe to its original (answer 35)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await chevron(page, 'butter').click()
    await setBox(sourceBox(panel(page, 'Butter'), DAHL), '30')
    const refresh = toolbar(page, 'Ingredients actions').getByRole('button', {
      name: 'Refresh'
    })
    const ask = 'Reset every recipe to its original ingredients and 2 portions?'
    await refresh.click()
    await answer(page, ask, 'No')
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(
      /^Butter, 30 g, /
    )
    await refresh.click()
    await answer(page, ask, 'Yes')
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(
      /^Butter, 15 g, /
    )
    await expect(
      toolbar(page, 'Ingredients actions').getByRole('button', {
        name: 'Clean up'
      })
    ).toHaveCount(0)
  })
})

test.describe('Extra (#182)', () => {
  test('empty Extra says so and offers the plus (answer 11)', async ({
    page
  }) => {
    await expect(extraRegion(page)).toContainText('Nothing extra yet')
    await expect(
      extraRegion(page).getByRole('button', { name: 'Add an ingredient' })
    ).toBeVisible()
  })

  test('staples go in Extra on pick and stay after unpicking; they show in Ingredients too (answer 7, F1)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await expect(chip(page, 'salt', 'extra')).toHaveCount(1)
    await expect(chip(page, 'salt')).toHaveCount(1)
    await exploreRow(page, DAHL).click()
    await expect(chip(page, 'salt', 'extra')).toHaveCount(1)
    await expect(chip(page, 'butter')).toHaveCount(0)
  })

  test('the Extra box holds whole numbers in the base unit; 0 asks, Yes leaves the recipe amount (answers 3, 12)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await openExplore(page)
    await page.getByRole('searchbox').fill('butter')
    await page.getByRole('button', { name: 'Butter, on your list' }).click()
    await expect(chip(page, 'butter', 'extra')).toContainText('1 g')
    await chevron(page, 'butter', 'extra').click()
    const extra = panel(page, 'Butter', 'extra')
    await setBox(sourceBox(extra, 'Extra'), '3')
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(
      /^Butter, 18 g, /
    )
    await setBox(sourceBox(extra, 'Extra'), '0')
    await answer(page, 'Remove butter from Extra?', 'Yes')
    await expect(chip(page, 'butter', 'extra')).toHaveCount(0)
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(
      /^Butter, 15 g, /
    )
  })

  test('crossed off is one state across Ingredients, Extra and rows (answer 13)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await chipToggle(page, 'salt', 'extra').click()
    await expect(chipToggle(page, 'salt')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await openRow(page, DAHL)
    await expect(chipToggle(page, 'salt', 'row-dahl')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await chipToggle(page, 'salt', 'row-dahl').click()
    await expect(chipToggle(page, 'salt', 'extra')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  test('the Extra filter offers category and crossed off, with "N hidden by filter" and Clear (answers 41, 43)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await chipToggle(page, 'salt', 'extra').click()
    await openFilter(page, 'Extra')
    const filter = page.getByRole('group', { name: 'Filter extra' })
    await expect(filter.getByRole('checkbox')).not.toHaveCount(0)
    await expect(
      filter.getByRole('checkbox', { name: /Customised|Removed/ })
    ).toHaveCount(0)
    await tick(filter, 'Fruit & Veg')
    await expect(extraRegion(page).getByText(/hidden by filter/)).toBeVisible()
    await extraRegion(page).getByRole('button', { name: 'Clear' }).click()
    await expect(chip(page, 'salt', 'extra')).toBeVisible()
  })
})

test.describe('layout (#182, answers 14-15)', () => {
  test('Ingredients, Recipes, Extra; side by side, Extra sits under Recipes; only vertical collapses Extra', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await pickRows(page, DAHL)
    const heading = (name: string) =>
      page.getByRole('heading', { level: 2, name, exact: true })
    await expect(section(page, 'Extra')).toHaveCount(0)
    const ingredients = await box(heading('Ingredients'))
    const recipes = await box(heading('Recipes'))
    const extra = await box(heading('Extra'))
    expect(recipes.x).toBeGreaterThan(ingredients.x)
    expect(Math.abs(extra.x - recipes.x)).toBeLessThan(2)
    expect(extra.y).toBeGreaterThan(recipes.y)
    await useVertical(page)
    const top = async (name: string) => (await box(heading(name))).y
    expect(await top('Ingredients')).toBeLessThan(await top('Recipes'))
    expect(await top('Recipes')).toBeLessThan(await top('Extra'))
    await section(page, 'Extra').click()
    await expect(section(page, 'Extra')).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    await expect(chip(page, 'salt', 'extra')).toBeHidden()
  })
})

test.describe('recipe copies (#182)', () => {
  test('editing in Ingredients customises the copy; bullets in recipe units; kept after a reload (answers 22-24, 45-46)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await chevron(page, 'butter').click()
    await setBox(sourceBox(panel(page, 'Butter'), DAHL), '30')
    await openRow(page, DAHL)
    await expect(
      recipesRegion(page).getByText('Butter 15 g → 30 g')
    ).toBeVisible()
    await page.reload()
    await expect(row(page, DAHL)).toHaveAttribute('aria-pressed', 'true')
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(
      /^Butter, 30 g, /
    )
    await openRow(page, DAHL)
    await expect(
      recipesRegion(page).getByText('Butter 15 g → 30 g')
    ).toBeVisible()
  })

  test('a row adds an ingredient with the category tabs; removing asks the same question (answers 26, 28)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await openRow(page, DAHL)
    const name = `Add an ingredient to ${DAHL}`
    await recipesRegion(page).getByRole('button', { name }).click()
    const area = page.getByRole('group', { name })
    await area.getByRole('tab', { name: 'Dairy' }).click()
    await area.getByRole('button', { name: 'Feta', exact: true }).click()
    await expect(chip(page, 'feta', 'row-dahl')).toHaveCount(1)
    await expect(chip(page, 'feta')).toHaveCount(1)
    await expect(recipesRegion(page).getByText(/^Added feta /)).toBeVisible()
    const feta = panel(page, 'Feta', 'row-dahl')
    await setBox(sourceBox(feta, DAHL), '0')
    await answer(page, `Remove feta from ${DAHL}?`, 'Yes')
    // an added ingredient taken out again is no longer a customisation
    await expect(chip(page, 'feta')).toHaveCount(0)
    await expect(recipesRegion(page).getByText(/^Added feta /)).toHaveCount(0)
  })

  test('the same recipe picked again starts from the original (answers 20, 49)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await chevron(page, 'butter').click()
    await setBox(sourceBox(panel(page, 'Butter'), DAHL), '30')
    await exploreRow(page, DAHL).click()
    await expect(chip(page, 'butter')).toHaveCount(0)
    await exploreRow(page, DAHL).click()
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(
      /^Butter, 15 g, /
    )
  })

  test('allergens follow the customised ingredients; Explore keeps the original (answer 29)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await openRow(page, DAHL)
    await expect(recipesRegion(page).getByText('Contains: milk')).toBeVisible()
    await chevron(page, 'butter', 'row-dahl').click()
    await setBox(sourceBox(panel(page, 'Butter', 'row-dahl'), DAHL), '0')
    await answer(page, `Remove butter from ${DAHL}?`, 'Yes')
    await expect(recipesRegion(page).getByText('Butter removed')).toBeVisible()
    await expect(recipesRegion(page).getByText('Contains: milk')).toHaveCount(0)
    await openExplore(page)
    await explore(page)
      .getByRole('button', { name: `See recipe: ${DAHL}` })
      .click()
    await expect(explore(page).getByText('Contains: milk')).toBeVisible()
  })

  test('signed in, a copy saves with its customisations (answers 47-48)', async ({
    page
  }) => {
    await signUp(page, newAccount())
    await pickRows(page, DAHL)
    await chevron(page, 'butter').click()
    await setBox(sourceBox(panel(page, 'Butter'), DAHL), '30')
    await openRow(page, DAHL)
    const responses = page.waitForResponse(
      (r) =>
        r.url().includes('/graphql') &&
        (r.request().postData() ?? '').includes('saveRecipe')
    )
    await recipesRegion(page)
      .getByRole('button', { name: `Save ${DAHL}` })
      .click()
    const response = await responses
    expect(response.ok()).toBe(true)
    const body: unknown = await response.json()
    expect(JSON.stringify(body)).not.toContain('"errors"')
    await expect(
      recipesRegion(page).getByRole('button', { name: `Unsave ${DAHL}` })
    ).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('filters (#182)', () => {
  test('Ingredients filter by status, with "N hidden by filter" and Clear (answers 33-34, 40, 43)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await chevron(page, 'butter').click()
    await setBox(sourceBox(panel(page, 'Butter'), DAHL), '30')
    await openFilter(page, 'Ingredients')
    const filter = page.getByRole('group', { name: 'Filter ingredients' })
    // answer 44: no allergen filter
    await expect(filter.getByText(/allergen/i)).toHaveCount(0)
    await tick(filter, 'Customised')
    await expect(
      toolbar(page, 'Ingredients actions').getByRole('button', {
        name: 'Filter (1)'
      })
    ).toBeVisible()
    await expect(chip(page, 'butter')).toBeVisible()
    await expect(chip(page, 'tomato')).toHaveCount(0)
    await expect(
      ingredientsRegion(page).getByText(/^\d+ hidden by filter$/)
    ).toBeVisible()
    await ingredientsRegion(page).getByRole('button', { name: 'Clear' }).click()
    await expect(chip(page, 'tomato')).toBeVisible()
  })

  test('Recipes filter: contains and excludes take several ingredients; filters reset on reload (answers 37, 39, 42)', async ({
    page
  }) => {
    await pickRows(page, DAHL, CURRY)
    await closeExplore(page)
    await openFilter(page, 'Recipes')
    const filter = page.getByRole('group', { name: 'Filter recipes' })
    await choose(page, filter, 'Contains', 'Butter')
    await expect(row(page, CURRY)).toHaveCount(0)
    await expect(
      recipesRegion(page).getByText('1 hidden by filter')
    ).toBeVisible()
    await filter.getByRole('button', { name: /^Remove Butter/ }).click()
    await choose(page, filter, 'Excludes', 'Potato')
    await choose(page, filter, 'Excludes', 'Red lentils')
    await expect(
      recipesRegion(page).getByText('2 hidden by filter')
    ).toBeVisible()
    await page.reload()
    await expect(row(page, DAHL)).toBeVisible()
    await expect(row(page, CURRY)).toBeVisible()
  })
})

test.describe('#181 fixes', () => {
  test('the /search route is gone', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByText('Page Not Found')).toBeVisible()
  })
})
