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
  pageTop,
  panel,
  pickRows,
  recipesRegion,
  row,
  section,
  setBox,
  sourceBox,
  useVertical
} from './page'

/* #179: the ingredients-first single page, updated for #181 (Explore picks, no Done). */

/** Picks a category in a chip panel by its visible label (the radio itself is visually hidden). */
const chooseCategory = (panel: Locator, name: string) =>
  panel
    .getByRole('radiogroup', { name: 'Category' })
    .locator('label')
    .filter({ hasText: new RegExp(`^✓?${name}$`) })
    .click()
const plus = (page: Page) =>
  page.getByRole('button', { name: 'Add an ingredient' })
const plusArea = (page: Page) =>
  page.getByRole('group', { name: 'Add an ingredient' })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('ingredients-first page (#179)', () => {
  test('One page: Ingredients above Recipes; no steps, Home control, recipe chips, modals or overlays', async ({
    page
  }) => {
    await useVertical(page)
    await expect(page).toHaveTitle(/Shopping list/)
    const ingredients = page.getByRole('heading', {
      level: 2,
      name: 'Ingredients'
    })
    const recipes = page.getByRole('heading', { level: 2, name: 'Recipes' })
    await expect(ingredients).toBeVisible()
    await expect(recipes).toBeVisible()
    const top = async (l: Locator) => (await l.boundingBox())?.y ?? 0
    expect(await top(ingredients)).toBeLessThan(await top(recipes))
    await expect(page.getByRole('button', { name: 'Home' })).toHaveCount(0)
    await expect(page.getByText(/At home|At the shop/)).toHaveCount(0)
    await expect(page.getByRole('checkbox')).toHaveCount(0)
    await expect(page.getByRole('link', { name: /View recipe/ })).toHaveCount(0)
    await pickRows(page, DAHL)
    await chip(page, 'tomato')
      .getByRole('button', { name: 'Tomatoes details' })
      .click()
    await plus(page).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.locator('[aria-modal="true"]')).toHaveCount(0)
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
    await exploreRow(page, CURRY).click()
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
    await chipToggle(page, 'tomato').click()
    await expect(chipToggle(page, 'tomato')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(
      chipToggle(page, 'tomato').getByText('Tomatoes').locator('..')
    ).toHaveCSS('text-decoration-line', 'line-through')
    expect(await chipOrder(page)).toEqual(before)
    expect(await place()).toEqual(box)
    await chipToggle(page, 'tomato').click()
    await expect(chipToggle(page, 'tomato')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    await expect(page.getByText(/undo/i)).toHaveCount(0)
  })

  test('Chip panel opens inline, pushes content down, lists every recipe using it; the chevron closes it', async ({
    page
  }) => {
    await useVertical(page)
    await pickRows(page, DAHL, CURRY)
    const recipes = page.getByRole('heading', { level: 2, name: 'Recipes' })
    const before = await pageTop(recipes)
    const chevron = page.getByRole('button', { name: 'Brown onion details' })
    await chevron.click()
    await expect(chevron).toHaveAttribute('aria-expanded', 'true')
    const panel = page.getByRole('group', { name: 'Brown onion details' })
    await expect(panel).toBeVisible()
    // each recipe with its box, which reads in onions (#182, owner decision 2)
    await expect(panel.getByRole('listitem')).toContainText([DAHL, CURRY])
    await expect(panel.getByRole('listitem')).toHaveCount(2)
    await expect.poll(() => pageTop(recipes)).toBeGreaterThan(before)
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
    await expect(chipToggle(page, 'tomato')).toContainText('2')
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

  test('Add an extra: the plus in Extra, Dairy tab, Butter (#182, answer 9)', async ({
    page
  }) => {
    await expect(
      ingredientsRegion(page).getByRole('button', { name: 'Add an ingredient' })
    ).toHaveCount(0)
    await plus(page).click()
    await expect(plus(page)).toHaveAttribute('aria-expanded', 'true')
    const area = plusArea(page)
    await expect(area).toBeVisible()
    const plusBox = await plus(page).boundingBox()
    const areaBox = await area.boundingBox()
    expect(areaBox?.y ?? 0).toBeGreaterThan(plusBox?.y ?? 0)
    await area.getByRole('tab', { name: 'Dairy' }).click()
    await area.getByRole('button', { name: 'Butter', exact: true }).click()
    await expect(chip(page, 'butter')).toHaveCount(1)
    await expect(chip(page, 'butter', 'extra')).toContainText('1 g')
    expect(await groupOf(page, 'butter')).toBe('Dairy')
    expect(await groupOf(page, 'butter', 'extra')).toBe('Dairy')
  })

  test('Add an existing ingredient: an Extra source at 1, then scrolls to it and opens its panel, no duplicate (#182, answer 8)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await plus(page).click()
    await plusArea(page).getByRole('tab', { name: 'Dairy' }).click()
    await plusArea(page)
      .getByRole('button', { name: 'Butter, on your list' })
      .click()
    await expect(chip(page, 'butter')).toHaveCount(1)
    await expect(chip(page, 'butter', 'extra')).toContainText('1 g')
    const butter = chevron(page, 'butter')
    await expect(butter).toHaveAttribute('aria-expanded', 'true')
    await expect(butter).toBeFocused()
    await expect(chip(page, 'butter')).toBeInViewport()
    await expect(sourceBox(panel(page, 'Butter'), 'Extra')).toHaveValue('1')
    await expect(plusArea(page)).toBeHidden()
  })

  test('Close the plus area: click outside, or Escape back to the plus', async ({
    page
  }) => {
    await plus(page).click()
    await expect(plusArea(page)).toBeVisible()
    await plusArea(page).getByRole('tab', { name: 'Bakery' }).click()
    await expect(plusArea(page)).toBeVisible()
    await recipesRegion(page)
      .getByText(/No recipes picked yet/)
      .click()
    await expect(plusArea(page)).toBeHidden()
    await expect(plus(page)).toHaveAttribute('aria-expanded', 'false')
    await plus(page).click()
    await page.keyboard.press('Escape')
    await expect(plusArea(page)).toBeHidden()
    await expect(plus(page)).toBeFocused()
  })

  test('Recipe rows: one tap selects; pressed, bordered, ticked, announced; no Add button', async ({
    page
  }) => {
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
    await expect(row(page, DAHL)).toBeVisible()
    await dahl.click()
    await expect(dahl).toHaveAttribute('aria-pressed', 'false')
    await expect(row(page, DAHL)).toHaveCount(0)
  })

  test('Multiple rows stay open together', async ({ page }) => {
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
    await see().click()
    await expect(page.getByText('Method').first()).toBeVisible()
    await expect(
      page.getByRole('button', { name: `Save ${DAHL}` })
    ).toHaveCount(0)
    await signUp(page, newAccount())
    await see().click()
    await page.getByRole('button', { name: `Save ${DAHL}` }).click()
    await expect(
      page.getByRole('button', { name: `Unsave ${DAHL}` })
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('Collapsible sections announce collapsed and hide their content', async ({
    page
  }) => {
    await useVertical(page)
    await pickRows(page, DAHL)
    await section(page, 'Ingredients').click()
    await expect(section(page, 'Ingredients')).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    await expect(chip(page, 'tomato')).toBeHidden()
    await section(page, 'Ingredients').click()
    await expect(chip(page, 'tomato')).toBeVisible()
    await section(page, 'Recipes').click()
    await expect(section(page, 'Recipes')).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    await expect(row(page, DAHL)).toBeHidden()
    await section(page, 'Recipes').click()
    await expect(row(page, DAHL)).toBeVisible()
  })

  test('Motion: every open and close takes 0.2 s', async ({ page }) => {
    await pickRows(page, DAHL)
    await page.getByRole('button', { name: 'Tomatoes details' }).click()
    await plus(page).click()
    const durations = await page
      .locator('[data-collapse], [id$="-panel"], #add-ingredient-area')
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).transitionDuration)
      )
    expect(durations.length).toBeGreaterThan(4)
    durations.forEach((d) => expect(d.split(', ')[0]).toBe('0.2s'))
  })

  test('Scroll to top brings the chips back and focuses the Ingredients heading', async ({
    page
  }) => {
    await useVertical(page)
    await pickRows(page, DAHL, CURRY)
    // open both picked rows so the page is long enough to scroll the chips away
    for (const title of [DAHL, CURRY])
      await recipesRegion(page)
        .getByRole('button', { name: `${title} details` })
        .click()
    const toTop = page.getByRole('button', { name: 'Scroll to top' })
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await expect(toTop).toHaveCount(0)
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
    )
    await expect(toTop).toBeVisible()
    await toTop.click()
    const heading = page.getByRole('heading', { level: 2, name: 'Ingredients' })
    await expect(heading).toBeFocused()
    await expect(chip(page, 'tomato')).toBeInViewport()
    await expect(toTop).toHaveCount(0)
  })

  test('State kept: picks, crossed off, edits, extras and chip order survive a refresh', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await chipToggle(page, 'tomato').click()
    await chevron(page, 'butter').click()
    const butter = panel(page, 'Butter')
    await setBox(sourceBox(butter, DAHL), '30')
    await chooseCategory(butter, 'Deli')
    await plus(page).click()
    await plusArea(page).getByRole('tab', { name: 'Bakery' }).click()
    await plusArea(page)
      .getByRole('tabpanel')
      .getByRole('button')
      .first()
      .click()
    const order = await chipOrder(page)
    await page.reload()
    await expect(row(page, DAHL)).toHaveAttribute('aria-pressed', 'true')
    await expect(chipToggle(page, 'tomato')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(chipToggle(page, 'butter')).toHaveAccessibleName(
      /^Butter, 30 g, Deli, /
    )
    expect(await groupOf(page, 'butter')).toBe('Dairy')
    expect(await chipOrder(page)).toEqual(order)
    await expect(
      ingredientsRegion(page).getByRole('heading', { level: 3, name: 'Bakery' })
    ).toBeVisible()
    await expect(
      extraRegion(page).getByRole('heading', { level: 3, name: 'Bakery' })
    ).toBeVisible()
  })

  test('Accessibility: keyboard, visible focus, aria-expanded and what VoiceOver reads', async ({
    page
  }) => {
    await useVertical(page)
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
    await expect(onion).toHaveAttribute('aria-pressed', 'true')
    const ring = (l: Locator) =>
      l.evaluate((el) => getComputedStyle(el).outlineStyle)
    expect(await ring(onion)).toBe('solid')

    await page.keyboard.press('Tab')
    const onionChevron = chevron(page, 'onion')
    await expect(onionChevron).toBeFocused()
    expect(await ring(onionChevron)).toBe('solid')
    await page.keyboard.press('Enter')
    await expect(onionChevron).toHaveAttribute('aria-expanded', 'true')

    const expanders = [
      section(page, 'Ingredients'),
      section(page, 'Recipes'),
      section(page, 'Extra'),
      onionChevron,
      page.getByRole('button', { name: `${DAHL} details` }),
      plus(page)
    ]
    for (const button of expanders) {
      await expect(button).toHaveAttribute('aria-expanded', /true|false/)
      expect(await button.evaluate((el) => el.tagName)).toBe('BUTTON')
    }

    const sort = page.getByRole('button', { name: 'Sort', exact: true })
    await sort.focus()
    await page.keyboard.press('Enter')
    await plus(page).focus()
    await page.keyboard.press('Enter')
    await expect(plusArea(page)).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(plusArea(page).getByRole('tab').first()).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(plusArea(page).getByRole('tab').nth(1)).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(plus(page)).toBeFocused()

    const beef = exploreRow(page, 'Shaking beef')
    await beef.focus()
    await page.keyboard.press('Enter')
    await expect(beef).toHaveAttribute('aria-pressed', 'true')
    expect(await ring(beef)).toBe('solid')

    await section(page, 'Recipes').focus()
    await page.keyboard.press('Enter')
    await expect(section(page, 'Recipes')).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('every open and close is instant', async ({ page }) => {
    await pickRows(page, DAHL)
    await page.getByRole('button', { name: 'Tomatoes details' }).click()
    await plus(page).click()
    const durations = await page
      .locator('[data-collapse], [id$="-panel"], #add-ingredient-area')
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).transitionDuration)
      )
    expect(durations.length).toBeGreaterThan(4)
    durations.forEach((d) => expect(d.split(', ')[0]).toBe('0s'))
  })
})
