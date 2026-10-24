import type { Locator, Page } from '@playwright/test'
import { expect, signUp, newAccount, test } from './fixtures'

/* #179: the ingredients-first single page. One test per user-facing acceptance scenario. */

const DAHL = 'Red lentil dahl'
const CURRY = 'Potato, cauliflower and chickpea curry'

const chip = (page: Page, id: string): Locator =>
  page.locator(`[data-chip="${id}"]`)
const chipToggle = (page: Page, id: string): Locator =>
  chip(page, id).getByRole('button').first()
const chipOrder = (page: Page) =>
  page
    .locator('[data-chip]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-chip')))
/** The category heading a chip sits under. */
const groupOf = (page: Page, id: string) =>
  chip(page, id).evaluate(
    (el) => el.closest('[role="group"]')?.querySelector('h3')?.textContent
  )
const row = (page: Page, title: string) =>
  page.getByRole('button', { name: title, exact: true })
const section = (page: Page, name: 'Ingredients' | 'Recipes') =>
  page.getByRole('heading', { level: 2, name }).getByRole('button')
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

/** Picks recipes by tapping their rows. */
const pickRows = async (page: Page, ...titles: string[]) => {
  for (const title of titles) {
    await row(page, title).click()
    await expect(row(page, title)).toHaveAttribute('aria-pressed', 'true')
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('ingredients-first page (#179)', () => {
  test('One page: Ingredients above Recipes; no steps, Home control, recipe chips, modals or overlays', async ({
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
    await expect(chip(page, 'onion').getByTestId('chip-count')).toHaveText('2')
    await row(page, CURRY).click()
    await expect(chip(page, 'potato')).toHaveCount(0)
    await expect(chip(page, 'onion')).toHaveCount(1)
    await expect(chip(page, 'onion').getByTestId('chip-count')).toHaveCount(0)
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

  test('Chip panel opens inline, pushes content down, and lists every recipe using it', async ({
    page
  }) => {
    await pickRows(page, DAHL, CURRY)
    const recipes = page.getByRole('heading', { level: 2, name: 'Recipes' })
    const before = (await recipes.boundingBox())?.y ?? 0
    const chevron = page.getByRole('button', { name: 'Brown onion details' })
    await chevron.click()
    await expect(chevron).toHaveAttribute('aria-expanded', 'true')
    const panel = page.getByRole('group', { name: 'Brown onion details' })
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('listitem')).toHaveText([DAHL, CURRY])
    await expect
      .poll(async () => (await recipes.boundingBox())?.y ?? 0)
      .toBeGreaterThan(before)
    await panel.getByRole('button', { name: 'Done' }).click()
    await expect(panel).toBeHidden()
    await expect(chevron).toBeFocused()
  })

  test('Edit quantity: Tomatoes to 2', async ({ page }) => {
    await pickRows(page, DAHL)
    await page.getByRole('button', { name: 'Tomatoes details' }).click()
    const quantity = page
      .getByRole('group', { name: 'Tomatoes details' })
      .getByRole('textbox', { name: 'Quantity' })
    await quantity.fill('2')
    await quantity.press('Tab')
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
      chip(page, 'tomato').evaluate(
        (el) => getComputedStyle(el).backgroundColor
      )
    const fruit = await colour()
    await page.getByRole('button', { name: 'Tomatoes details' }).click()
    const panel = page.getByRole('group', { name: 'Tomatoes details' })
    await chooseCategory(panel, 'Dairy')
    await expect(chip(page, 'tomato')).toHaveAttribute('data-category', 'Dairy')
    expect(await colour()).not.toBe(fruit)
    expect(await colour()).toBe(
      await chip(page, 'butter').evaluate(
        (el) => getComputedStyle(el).backgroundColor
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

  test('Add an extra: plus, Dairy tab, Butter', async ({ page }) => {
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
    expect(await groupOf(page, 'butter')).toBe('Dairy')
  })

  test('Add an existing ingredient: scrolls to it and opens its panel, no duplicate', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await plus(page).click()
    await plusArea(page).getByRole('tab', { name: 'Dairy' }).click()
    await plusArea(page)
      .getByRole('button', { name: 'Butter, on your list' })
      .click()
    await expect(chip(page, 'butter')).toHaveCount(1)
    const chevron = page.getByRole('button', { name: 'Butter details' })
    await expect(chevron).toHaveAttribute('aria-expanded', 'true')
    await expect(chevron).toBeFocused()
    await expect(chip(page, 'butter')).toBeInViewport()
    await expect(
      page.getByRole('group', { name: 'Butter details' })
    ).toBeVisible()
    await expect(plusArea(page)).toBeHidden()
  })

  test('Close the plus area: click outside, or Escape back to the plus', async ({
    page
  }) => {
    await plus(page).click()
    await expect(plusArea(page)).toBeVisible()
    await plusArea(page).getByRole('tab', { name: 'Bakery' }).click()
    await expect(plusArea(page)).toBeVisible()
    await page
      .getByRole('heading', { level: 2, name: 'Recipes' })
      .locator('..')
      .locator('span')
      .last()
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
    const dahl = row(page, DAHL)
    const item = page.getByRole('listitem').filter({ has: dahl })
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
      page
        .getByRole('region', { name: 'Recipes' })
        .getByRole('button', { name: /\bAdd\b/ })
    ).toHaveCount(0)
    await dahl.click()
    await expect(dahl).toHaveAttribute('aria-pressed', 'false')
  })

  test('Multiple rows stay open together', async ({ page }) => {
    const dahl = page.getByRole('button', { name: `${DAHL} details` })
    const curry = page.getByRole('button', { name: `${CURRY} details` })
    await dahl.click()
    await curry.click()
    await expect(dahl).toHaveAttribute('aria-expanded', 'true')
    await expect(curry).toHaveAttribute('aria-expanded', 'true')
    for (const chevron of [dahl, curry]) {
      const id = (await chevron.getAttribute('aria-controls')) ?? ''
      const details = page.locator(`[id="${id}"]`)
      for (const name of ['Ingredients', 'Method', 'Notes'])
        await expect(details.getByRole('heading', { name })).toBeVisible()
      await expect(details.getByRole('radiogroup')).toBeVisible()
    }
    await expect(row(page, DAHL)).toHaveAttribute('aria-pressed', 'false')
  })

  test('Save visibility: hidden signed out, shown signed in', async ({
    page
  }) => {
    await page.getByRole('button', { name: `${DAHL} details` }).click()
    await expect(page.getByText('Method').first()).toBeVisible()
    await expect(
      page.getByRole('button', { name: `Save ${DAHL}` })
    ).toHaveCount(0)
    await signUp(page, newAccount())
    await page.getByRole('button', { name: `${DAHL} details` }).click()
    await page.getByRole('button', { name: `Save ${DAHL}` }).click()
    await expect(
      page.getByRole('button', { name: `Unsave ${DAHL}` })
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('Collapsible sections announce collapsed and hide their content', async ({
    page
  }) => {
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
    await pickRows(page, DAHL)
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
    await page.getByRole('button', { name: 'Butter details' }).click()
    const butter = page.getByRole('group', { name: 'Butter details' })
    await butter.getByRole('button', { name: /Increase/ }).click()
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
      /^Butter, 2\b.*, Deli, /
    )
    expect(await groupOf(page, 'butter')).toBe('Dairy')
    expect(await chipOrder(page)).toEqual(order)
    await expect(
      page.getByRole('heading', { level: 3, name: 'Bakery' })
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
      'Brown onion, 1, Fruit & Veg, in 2 recipes, crossed off'
    )
    await expect(onion).toHaveAttribute('aria-pressed', 'true')
    const ring = (l: Locator) =>
      l.evaluate((el) => getComputedStyle(el).outlineStyle)
    expect(await ring(onion)).toBe('solid')

    await page.keyboard.press('Tab')
    const chevron = page.getByRole('button', { name: 'Brown onion details' })
    await expect(chevron).toBeFocused()
    expect(await ring(chevron)).toBe('solid')
    await page.keyboard.press('Enter')
    await expect(chevron).toHaveAttribute('aria-expanded', 'true')

    const expanders = [
      section(page, 'Ingredients'),
      section(page, 'Recipes'),
      chevron,
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

    const beef = row(page, 'Shaking beef')
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
