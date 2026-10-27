import type { Locator, Page } from '@playwright/test'
import { expect, signUp, newAccount, test } from './fixtures'
import {
  CURRY,
  DAHL,
  chevron,
  chip,
  chipOrder,
  chipToggle,
  explore,
  exploreRow,
  groupOf,
  extraRegion,
  ingredientsRegion,
  panel,
  pickRows,
  row,
  setBox,
  sourceBox,
  closeSheet,
  fab,
  openExplore,
  openExtra,
  toIngredients,
  toTop,
  crossOff
} from './page'

/* #179: the single page, updated for #181 (Explore picks, no Done) and #192 (one workspace, sheets). */

/** Picks a category in a chip panel by its visible label (the radio itself is visually hidden). */
const chooseCategory = (panel: Locator, name: string) =>
  panel
    .getByRole('radiogroup', { name: 'Category' })
    .locator('label')
    .filter({ hasText: new RegExp(`^✓?${name}$`) })
    .click()
/** The catalogue in the Extra sheet (#192), by category. */
const catalogueIn = (page: Page) =>
  extraRegion(page).getByRole('region', { name: 'Add an ingredient' })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('ingredients-first page (#179)', () => {
  test('One page: Recipes then Ingredients; no steps, Home control, recipe chips or accordions (#192)', async ({
    page
  }) => {
    await expect(page).toHaveTitle(/Shopping list/)
    const ingredients = page.getByRole('heading', {
      level: 2,
      name: 'Ingredients'
    })
    const recipes = page.getByRole('heading', { level: 2, name: 'Recipes' })
    await expect(ingredients).toBeVisible()
    await expect(recipes).toBeVisible()
    const top = async (l: Locator) => (await l.boundingBox())?.y ?? 0
    // stacked on the phone, side by side (same top) on desktop
    expect(await top(recipes)).toBeLessThanOrEqual(await top(ingredients))
    await expect(
      page.getByRole('heading', { level: 2 }).getByRole('button')
    ).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Home' })).toHaveCount(0)
    await expect(page.getByText(/At home|At the shop/)).toHaveCount(0)
    await expect(page.getByRole('link', { name: /View recipe/ })).toHaveCount(0)
    await pickRows(page, DAHL)
    await chip(page, 'tomato')
      .getByRole('button', { name: 'Tomatoes details' })
      .click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('old step URLs redirect to /', async ({ page }) => {
    for (const path of ['/ingredients', '/tapoff']) {
      await page.goto(path)
      await expect(page).toHaveURL('/')
      await expect(
        page.getByRole('heading', { level: 2, name: 'Ingredients' })
      ).toBeVisible()
    }
  })

  test('Chips from recipes, grouped by category', async ({ page }) => {
    await pickRows(page, DAHL, CURRY)
    expect(await groupOf(page, 'onion')).toBe('Fruit & Veg')
    expect(await groupOf(page, 'potato')).toBe('Fruit & Veg')
    expect(await groupOf(page, 'butter')).toBe('Dairy')
    expect(await groupOf(page, 'red-lentils')).toBe('Pantry')
    await openExplore(page)
    await exploreRow(page, CURRY).click()
    await closeSheet(page)
    await expect(chip(page, 'potato')).toHaveCount(0)
    await expect(chip(page, 'onion')).toHaveCount(1)
  })

  test('Cross off stays in place, and there is no Undo', async ({ page }) => {
    await pickRows(page, DAHL)
    const before = await chipOrder(page)
    const place = () =>
      chip(page, 'tomato').evaluate((el) =>
        el instanceof HTMLElement ? [el.offsetLeft, el.offsetTop] : []
      )
    const box = await place()
    await crossOff(page, 'tomato')
    await expect(chipToggle(page, 'tomato')).toBeChecked()
    await expect(
      chip(page, 'tomato').getByText('Tomatoes', { exact: true }).locator('..')
    ).toHaveCSS('text-decoration-line', 'line-through')
    expect(await chipOrder(page)).toEqual(before)
    expect(await place()).toEqual(box)
    await crossOff(page, 'tomato')
    await expect(chipToggle(page, 'tomato')).not.toBeChecked()
    await expect(page.getByText(/undo/i)).toHaveCount(0)
  })

  test('Chip panel opens inline, pushes content down, lists every recipe using it; the chevron closes it', async ({
    page
  }) => {
    await pickRows(page, DAHL, CURRY)
    const height = async () =>
      (await ingredientsRegion(page).boundingBox())?.height ?? 0
    const before = await height()
    const chevron = page.getByRole('button', { name: 'Brown onion details' })
    await chevron.click()
    await expect(chevron).toHaveAttribute('aria-expanded', 'true')
    const panel = page.getByRole('group', { name: 'Brown onion details' })
    await expect(panel).toBeVisible()
    // each recipe with its box, which reads in onions (#182, owner decision 2)
    await expect(panel.getByRole('listitem')).toContainText([DAHL, CURRY])
    await expect(panel.getByRole('listitem')).toHaveCount(2)
    await expect.poll(height).toBeGreaterThan(before)
    await chevron.click()
    await expect(panel).toBeHidden()
    await expect(chevron).toHaveAttribute('aria-expanded', 'false')
  })

  test('Edit the recipe amount: Tomatoes to 2 (#182)', async ({ page }) => {
    await pickRows(page, DAHL)
    await chevron(page, 'tomato').click()
    const details = panel(page, 'Tomatoes')
    // #182, answer 6: no Quantity override, only the recipe's box
    await expect(
      details.getByRole('textbox', { name: 'Quantity' })
    ).toHaveCount(0)
    await setBox(sourceBox(details, DAHL), '2')
    await expect(chipToggle(page, 'tomato')).toHaveAccessibleName(
      /^Tomatoes, 2\b/
    )
    await expect(chip(page, 'tomato')).toContainText('2')
  })

  test('Category change only recolours; Sort now moves it into Dairy', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const before = await chipOrder(page)
    const colour = () =>
      chip(page, 'tomato').evaluate((el) => getComputedStyle(el).borderTopColor)
    const fruit = await colour()
    await page.getByRole('button', { name: 'Tomatoes details' }).click()
    const panel = page.getByRole('group', { name: 'Tomatoes details' })
    await chooseCategory(panel, 'Dairy')
    await expect(chip(page, 'tomato')).toHaveAttribute('data-category', 'Dairy')
    expect(await colour()).not.toBe(fruit)
    expect(await colour()).toBe(
      await chip(page, 'butter').evaluate(
        (el) => getComputedStyle(el).borderTopColor
      )
    )
    expect(await chipOrder(page)).toEqual(before)
    expect(await groupOf(page, 'tomato')).toBe('Fruit & Veg')
    const sortNow = panel.getByRole('button', { name: 'Sort now' })
    await expect(sortNow).toBeVisible()
    await sortNow.click()
    expect(await groupOf(page, 'tomato')).toBe('Dairy')
    await expect(sortNow).toHaveCount(0)
  })

  test('Sort regroups every chip by its current category', async ({ page }) => {
    await pickRows(page, DAHL)
    await page.getByRole('button', { name: 'Tomatoes details' }).click()
    await chooseCategory(
      page.getByRole('group', { name: 'Tomatoes details' }),
      'Deli'
    )
    await page.getByRole('button', { name: 'Butter details' }).click()
    await chooseCategory(
      page.getByRole('group', { name: 'Butter details' }),
      'Frozen'
    )
    expect(await groupOf(page, 'tomato')).toBe('Fruit & Veg')
    expect(await groupOf(page, 'butter')).toBe('Dairy')
    await page.getByRole('button', { name: 'Sort', exact: true }).click()
    expect(await groupOf(page, 'tomato')).toBe('Deli')
    expect(await groupOf(page, 'butter')).toBe('Frozen')
  })

  test('Add an extra: "+ Pantry Item" opens Extra, Dairy tab, Butter (#182, #192)', async ({
    page
  }) => {
    await expect(
      ingredientsRegion(page).getByRole('button', { name: 'Add an ingredient' })
    ).toHaveCount(0)
    await openExtra(page)
    await catalogueIn(page).getByRole('tab', { name: 'Dairy' }).click()
    await catalogueIn(page)
      .getByRole('button', { name: 'Butter', exact: true })
      .click()
    await expect(chip(page, 'butter', 'extra')).toContainText('1 g')
    expect(await groupOf(page, 'butter', 'extra')).toBe('Dairy')
    await expect(
      extraRegion(page).getByText('Butter added to Extra')
    ).toBeAttached()
    await closeSheet(page)
    await expect(chip(page, 'butter')).toHaveCount(1)
    expect(await groupOf(page, 'butter')).toBe('Dairy')
  })

  test('Add an existing ingredient: an Extra source at 1, no duplicate (#182, #192)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await openExtra(page)
    await catalogueIn(page).getByRole('tab', { name: 'Dairy' }).click()
    await catalogueIn(page)
      .getByRole('button', { name: 'Butter, on your list' })
      .click()
    await expect(chip(page, 'butter', 'extra')).toContainText('1 g')
    await closeSheet(page)
    await expect(chip(page, 'butter')).toHaveCount(1)
    await chevron(page, 'butter').click()
    await expect(sourceBox(panel(page, 'Butter'), 'Extra')).toHaveValue('1')
  })

  test('The Extra sheet: a press inside keeps it, Escape closes it back to the FAB (#192)', async ({
    page
  }) => {
    await openExtra(page)
    await catalogueIn(page).getByRole('tab', { name: 'Bakery' }).click()
    await expect(extraRegion(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(extraRegion(page)).toHaveCount(0)
    await expect(fab(page)).toBeFocused()
  })

  test('Recipe rows: one tap selects; pressed, bordered, ticked, announced; no Add button', async ({
    page
  }) => {
    await openExplore(page)
    const dahl = exploreRow(page, DAHL)
    const item = explore(page)
      .getByRole('listitem')
      .filter({ has: page.getByRole('button', { name: DAHL, exact: true }) })
    const shadow = () => item.evaluate((el) => getComputedStyle(el).boxShadow)
    const raised = await shadow()
    await expect(dahl).toHaveAttribute('aria-pressed', 'false')
    await dahl.click()
    await expect(dahl).toHaveAttribute('aria-pressed', 'true')
    expect(await shadow()).not.toBe(raised)
    expect(await shadow()).toContain('inset')
    await expect(item).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)')
    await expect(dahl.getByTestId('row-check')).toHaveText('✓')
    await expect(item.getByRole('button')).toHaveCount(2)
    await expect(
      explore(page).getByRole('button', { name: /\bAdd\b.*dahl/i })
    ).toHaveCount(0)
    await closeSheet(page)
    await expect(row(page, DAHL)).toBeVisible()
    await openExplore(page)
    await dahl.click()
    await expect(dahl).toHaveAttribute('aria-pressed', 'false')
    await closeSheet(page)
    await expect(row(page, DAHL)).toHaveCount(0)
  })

  test('Multiple rows stay open together', async ({ page }) => {
    await openExplore(page)
    const dahl = explore(page).getByRole('button', {
      name: `See recipe: ${DAHL}`
    })
    const curry = explore(page).getByRole('button', {
      name: `See recipe: ${CURRY}`
    })
    await dahl.click()
    await curry.click()
    await expect(dahl).toHaveAttribute('aria-expanded', 'true')
    await expect(curry).toHaveAttribute('aria-expanded', 'true')
    for (const chevron of [dahl, curry]) {
      const id = (await chevron.getAttribute('aria-controls')) ?? ''
      const details = page.locator(`[id="${id}"]`)
      for (const name of ['Ingredients', 'Method'])
        await expect(details.getByRole('heading', { name })).toBeVisible()
      // #182, answer 32: Explore shows the original at 2 portions, with no picker
      await expect(details.getByRole('radiogroup')).toHaveCount(0)
      await expect(
        details.getByRole('textbox', { name: 'Portions' })
      ).toHaveCount(0)
    }
    await expect(exploreRow(page, DAHL)).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  test('Save visibility: hidden signed out, shown signed in', async ({
    page
  }) => {
    const see = () =>
      explore(page).getByRole('button', { name: `See recipe: ${DAHL}` })
    await openExplore(page)
    await see().click()
    await expect(page.getByText('Method').first()).toBeVisible()
    await expect(
      page.getByRole('button', { name: `Save ${DAHL}` })
    ).toHaveCount(0)
    await signUp(page, newAccount())
    await openExplore(page)
    await see().click()
    await page.getByRole('button', { name: `Save ${DAHL}` }).click()
    await expect(
      page.getByRole('button', { name: `Unsave ${DAHL}` })
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('Motion: every open and close takes 0.2 s', async ({ page }) => {
    await pickRows(page, DAHL)
    await page.getByRole('button', { name: 'Tomatoes details' }).click()
    const durations = await page
      .locator('[data-collapse], [id$="-panel"]')
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).transitionDuration)
      )
    expect(durations.length).toBeGreaterThan(2)
    durations.forEach((d) => expect(d.split(', ')[0]).toBe('0.2s'))
  })

  test('Scroll to top brings Recipes back and focuses the Recipes heading (#192)', async ({
    page
  }) => {
    await pickRows(page, DAHL, CURRY)
    const up = page.getByRole('button', { name: 'Scroll to top' })
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await expect(up).toHaveCount(0)
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
    )
    await expect(up).toBeVisible()
    await up.click()
    const heading = page.getByRole('heading', { level: 2, name: 'Recipes' })
    await expect(heading).toBeFocused()
    await expect(row(page, DAHL)).toBeInViewport()
    await expect(up).toHaveCount(0)
  })

  test('State kept: picks, crossed off, edits, extras and chip order survive a refresh', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await crossOff(page, 'tomato')
    await chevron(page, 'butter').click()
    const butter = panel(page, 'Butter')
    await setBox(sourceBox(butter, DAHL), '30')
    await chooseCategory(butter, 'Deli')
    await openExtra(page)
    await catalogueIn(page).getByRole('tab', { name: 'Bakery' }).click()
    await catalogueIn(page)
      .getByRole('tabpanel')
      .getByRole('button')
      .first()
      .click()
    await closeSheet(page)
    const order = await chipOrder(page)
    await page.reload()
    await expect(row(page, DAHL)).toHaveAttribute('aria-pressed', 'true')
    await expect(chipToggle(page, 'tomato')).toBeChecked()
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(
      /^Butter, 30 g, Deli, /
    )
    expect(await groupOf(page, 'butter')).toBe('Dairy')
    expect(await chipOrder(page)).toEqual(order)
    await expect(
      ingredientsRegion(page).getByRole('heading', { level: 3, name: 'Bakery' })
    ).toBeVisible()
    await openExtra(page)
    await expect(
      extraRegion(page).getByRole('heading', { level: 3, name: 'Bakery' })
    ).toBeVisible()
  })

  test('Accessibility: keyboard, visible focus, aria-expanded and what VoiceOver reads', async ({
    page
  }) => {
    await pickRows(page, DAHL, CURRY)
    const onion = chipToggle(page, 'onion')
    await onion.focus()
    // arrive by keyboard, so the focus ring is the keyboard one
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(onion).toBeFocused()
    await page.keyboard.press('Space')
    await expect(onion).toHaveAccessibleName(
      'Brown onion, 1 onion, Fruit & Veg, in 2 recipes, crossed off'
    )
    await expect(onion).toBeChecked()
    const ring = (l: Locator) =>
      l.evaluate((el) => getComputedStyle(el).outlineStyle)
    // the ring is drawn on the row the checkbox lives in (#192)
    expect(await ring(chip(page, 'onion').locator('label'))).toBe('solid')

    await page.keyboard.press('Tab')
    const onionChevron = chevron(page, 'onion')
    await expect(onionChevron).toBeFocused()
    expect(await ring(onionChevron)).toBe('solid')
    await page.keyboard.press('Enter')
    await expect(onionChevron).toHaveAttribute('aria-expanded', 'true')

    const expanders = [
      onionChevron,
      page.getByRole('button', { name: `${DAHL} details` })
    ]
    for (const button of expanders) {
      await expect(button).toHaveAttribute('aria-expanded', /true|false/)
      expect(await button.evaluate((el) => el.tagName)).toBe('BUTTON')
    }

    await toIngredients(page)
    await fab(page).focus()
    await page.keyboard.press('Enter')
    await expect(extraRegion(page)).toBeVisible()
    const tab = catalogueIn(page).getByRole('tab').first()
    await tab.focus()
    await page.keyboard.press('ArrowRight')
    await expect(catalogueIn(page).getByRole('tab').nth(1)).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(fab(page)).toBeFocused()

    await toTop(page)
    await fab(page).press('Enter')
    const beef = exploreRow(page, 'Shaking beef')
    await beef.focus()
    await page.keyboard.press('Enter')
    await expect(beef).toHaveAttribute('aria-pressed', 'true')
    expect(await ring(beef)).toBe('solid')
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('every open and close is instant', async ({ page }) => {
    await pickRows(page, DAHL)
    await page.getByRole('button', { name: 'Tomatoes details' }).click()
    const durations = await page
      .locator('[data-collapse], [id$="-panel"]')
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).transitionDuration)
      )
    expect(durations.length).toBeGreaterThan(2)
    durations.forEach((d) => expect(d.split(', ')[0]).toBe('0s'))
  })
})
