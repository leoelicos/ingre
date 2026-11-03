import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import {
  CURRY,
  DAHL,
  box,
  explore,
  fab,
  ingredientsRegion,
  openExplore,
  pickRows,
  recipesRegion,
  row,
  toIngredients,
  toTop
} from './page'

/*
 * #192: one workspace. Recipes then Ingredients (side by side from 576px), the recipes in a
 * snapping sideways row on the phone, swipe to delete with Undo, a sticky Ingredients
 * header, rows that are labels, discovery in a bottom sheet or a centred modal, and a FAB.
 */

const BEEF = 'Shaking beef'

/** Somewhere to press: the middle of an element. */
const middle = async (l: Locator) => {
  const b = await box(l)
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

/** A finger dragging from one point to another, in steps, then lifting (Chrome's touch input). */
const touchDrag = async (
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number }
) => {
  const cdp = await page.context().newCDPSession(page)
  const at = (i: number) => ({
    x: from.x + ((to.x - from.x) * i) / 10,
    y: from.y + ((to.y - from.y) * i) / 10
  })
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [from]
  })
  for (let i = 1; i <= 10; i++)
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [at(i)]
    })
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: []
  })
  await cdp.detach()
}

/** A mouse (or pen) doing the same. */
const mouseDrag = async (
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number }
) => {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(to.x, to.y, { steps: 10 })
  await page.mouse.up()
}

const phone = (page: Page) => (page.viewportSize()?.width ?? 0) < 576

/** The <li> card or row a picked recipe sits in. */
const card = (page: Page, title: string) =>
  recipesRegion(page)
    .locator('li[data-recipe]')
    .filter({
      has: page.getByRole('button', { name: title, exact: true })
    })

test.describe('layout (#192)', () => {
  test('575px stacks Recipes above Ingredients; 576px puts them side by side, Recipes left', async ({
    page
  }) => {
    await page.setViewportSize({ width: 575, height: 800 })
    await page.goto('/')
    const recipes = await box(recipesRegion(page))
    const ingredients = await box(ingredientsRegion(page))
    expect(recipes.y + recipes.height).toBeLessThanOrEqual(ingredients.y)
    expect(Math.abs(recipes.x - ingredients.x)).toBeLessThan(2)

    await page.setViewportSize({ width: 576, height: 800 })
    await expect
      .poll(async () => (await box(ingredientsRegion(page))).x)
      .toBeGreaterThan((await box(recipesRegion(page))).x + 100)
    const left = await box(recipesRegion(page))
    const right = await box(ingredientsRegion(page))
    expect(Math.abs(left.y - right.y)).toBeLessThan(2)
    // 50/50
    expect(Math.abs(left.width - right.width)).toBeLessThan(2)
  })

  test('on the phone the picked recipes are one sideways row that snaps; from 576px a column', async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await pickRows(page, DAHL, CURRY, BEEF)
    const list = recipesRegion(page).locator('ul').first()
    await expect(list).toHaveCSS('scroll-snap-type', 'x mandatory')
    await expect(list).toHaveCSS('overflow-x', 'auto')
    await expect(card(page, DAHL)).toHaveCSS('scroll-snap-align', 'start')
    const [a, b] = [await box(card(page, DAHL)), await box(card(page, CURRY))]
    expect(Math.abs(a.y - b.y)).toBeLessThan(2)
    expect(b.x).toBeGreaterThan(a.x)
    // the next card peeks in
    expect(b.x).toBeLessThan(390)
    expect(await list.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
      true
    )

    await page.setViewportSize({ width: 576, height: 800 })
    await expect
      .poll(async () => (await box(card(page, CURRY))).y)
      .toBeGreaterThan((await box(card(page, DAHL))).y + 20)
  })

  test('on a phone one recipe card stays short of the screen and clear of the FAB', async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await pickRows(page, 'Lemongrass beef noodle salad')
    await toTop(page)
    const size = page.viewportSize() ?? { height: 0, width: 0 }
    const recipe = card(page, 'Lemongrass beef noodle salad')
    const closed = await box(recipe)
    const button = await box(fab(page))
    expect(closed.height).toBeLessThan(size.height * 0.75)
    expect(closed.y + closed.height).toBeLessThanOrEqual(button.y)
    await page
      .getByRole('button', { name: 'Lemongrass beef noodle salad details' })
      .click()
    const opened = await box(recipe)
    expect(opened.height).toBeLessThan(size.height)
    expect(opened.y + opened.height).toBeLessThanOrEqual(button.y + 1)
  })

  test('the Ingredients header sticks to the top while its list scrolls under it', async ({
    page
  }) => {
    await page.goto('/')
    await pickRows(page, DAHL, CURRY)
    const heading = page.getByRole('heading', { level: 2, name: 'Ingredients' })
    await expect(heading).toHaveCSS('position', 'sticky')
    await expect(heading).toHaveCSS('top', '0px')
    expect(
      Number(await heading.evaluate((el) => getComputedStyle(el).zIndex))
    ).toBeGreaterThan(0)
    await expect(heading).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight)
    )
    await expect.poll(async () => (await box(heading)).y).toBeLessThan(2)
    await expect(heading).toBeInViewport()
  })

  test('each ingredient row is a label around its checkbox, at least 44px tall, and a tap on the words crosses it off', async ({
    page
  }) => {
    await page.goto('/')
    await pickRows(page, DAHL)
    const labels = ingredientsRegion(page).locator('[data-scope="chip"] label')
    expect(await labels.count()).toBeGreaterThan(5)
    for (const height of await labels.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().height)
    ))
      expect(height).toBeGreaterThanOrEqual(44)
    const tomato = ingredientsRegion(page)
      .locator('[data-chip="tomato"]')
      .locator('label')
    await expect(tomato.locator('input[type="checkbox"]')).toHaveCount(1)
    await tomato.getByText('Tomatoes', { exact: true }).click()
    await expect(tomato.getByRole('checkbox')).toBeChecked()
  })
})

test.describe('the FAB (#192)', () => {
  test('fixed bottom right above the safe area, "+ Recipe" at the top and "+ Pantry Item" in Ingredients', async ({
    page
  }) => {
    await page.goto('/')
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      /viewport-fit=cover/
    )
    await pickRows(page, DAHL, CURRY)
    const button = fab(page)
    await expect(button).toHaveCSS('position', 'fixed')
    const size = page.viewportSize() ?? { width: 0, height: 0 }
    const b = await box(button)
    expect(Math.round(size.height - (b.y + b.height))).toBe(16)
    expect(Math.round(size.width - (b.x + b.width))).toBe(16)
    expect(b.height).toBeGreaterThanOrEqual(44)
    // 1rem above the home indicator: env(safe-area-inset-bottom) is 0 here
    await expect(button).toHaveClass(/env\(safe-area-inset-bottom\)/)

    await toTop(page)
    await expect(button).toHaveText(/\+\s*Recipe/)
    await toIngredients(page)
    await expect(button).toHaveText(/\+\s*Pantry Item/)
    await toTop(page)
    await expect(button).toHaveText(/\+\s*Recipe/)
  })

  test('never covers the last ingredient row', async ({ page }) => {
    await page.goto('/')
    await pickRows(page, DAHL, CURRY)
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight)
    )
    const last = ingredientsRegion(page)
      .locator('[data-scope="chip"] label')
      .last()
    await expect(last).toBeInViewport()
    const button = await box(fab(page))
    const lastRow = await box(last)
    expect(lastRow.y + lastRow.height).toBeLessThanOrEqual(button.y)
  })
})

test.describe('the sheet (#192)', () => {
  const panelOf = (page: Page) => explore(page).locator('xpath=..')

  test('575px: a bottom sheet, full width, with a grip; 576px: a centred modal with none', async ({
    page
  }) => {
    await page.setViewportSize({ width: 575, height: 800 })
    await page.goto('/')
    await openExplore(page)
    await expect(page.getByRole('searchbox')).toBeFocused()
    // once it has slid in
    await expect
      .poll(async () => {
        const b = await box(panelOf(page))
        return Math.round(b.y + b.height)
      })
      .toBe(800)
    const sheet = await box(panelOf(page))
    expect(Math.round(sheet.width)).toBe(575)
    await expect(
      explore(page).locator('[data-sheet-grip] > span')
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(explore(page)).toHaveCount(0)

    await page.setViewportSize({ width: 576, height: 800 })
    await openExplore(page)
    await expect(panelOf(page)).not.toHaveAttribute('data-entering', /.*/)
    const modal = await box(panelOf(page))
    expect(modal.y + modal.height).toBeLessThan(800 - 10)
    expect(Math.abs(modal.x - (576 - modal.x - modal.width))).toBeLessThan(2)
    await expect(explore(page).locator('[data-sheet-grip] > span')).toBeHidden()
  })

  test('a swipe down on the grip closes the sheet on the phone; focus goes back to the FAB', async ({
    page
  }) => {
    test.skip(!phone(page), 'the sheet is a centred modal from 576px')
    await page.goto('/')
    await openExplore(page)
    const grip = explore(page).locator('[data-sheet-grip]')
    const from = await middle(grip)
    // React Aria holds the sheet back (unhittable) while a phone keyboard may open for the
    // autofocused search, so wait until a finger on the grip lands on the grip
    await expect
      .poll(() =>
        page.evaluate(
          ({ x, y }) =>
            document.elementFromPoint(x, y)?.closest('[data-sheet-grip]') !=
            null,
          from
        )
      )
      .toBe(true)
    // a short one is not enough
    await touchDrag(page, from, { x: from.x, y: from.y + 40 })
    await expect(explore(page)).toBeVisible()
    await touchDrag(page, from, { x: from.x, y: from.y + 250 })
    await expect(explore(page)).toHaveCount(0)
    await expect(fab(page)).toBeFocused()
  })
})

test.describe('swipe to delete (#192)', () => {
  test('a recipe swiped away goes, with Undo that puts it back where it was', async ({
    page
  }) => {
    await page.goto('/')
    await pickRows(page, DAHL, CURRY)
    const start = await middle(row(page, DAHL))
    const end = phone(page)
      ? { x: start.x, y: start.y - 200 }
      : { x: start.x - 260, y: start.y }
    await (phone(page) ? touchDrag : mouseDrag)(page, start, end)
    await expect(row(page, DAHL)).toHaveCount(0)
    await expect(recipesRegion(page).getByText(`Removed ${DAHL}`)).toBeVisible()
    const undo = recipesRegion(page).getByRole('button', { name: 'Undo' })
    await expect(undo).toBeFocused()
    await undo.click()
    await expect(row(page, DAHL)).toBeVisible()
    const first = recipesRegion(page).locator('li[data-recipe]').first()
    await expect(first).toHaveAttribute('data-recipe', 'dahl')
    await expect(row(page, DAHL)).toHaveAttribute('aria-pressed', 'true')
  })

  test('a short swipe springs back and keeps the recipe; Dismiss drops the note', async ({
    page
  }) => {
    await page.goto('/')
    await pickRows(page, DAHL)
    const start = await middle(row(page, DAHL))
    const short = phone(page)
      ? { x: start.x, y: start.y - 40 }
      : { x: start.x - 50, y: start.y }
    await (phone(page) ? touchDrag : mouseDrag)(page, start, short)
    await expect(row(page, DAHL)).toBeVisible()
    await expect(card(page, DAHL)).not.toHaveAttribute('style', /translate/)
    const far = phone(page)
      ? { x: start.x, y: start.y - 200 }
      : { x: start.x - 260, y: start.y }
    await (phone(page) ? touchDrag : mouseDrag)(page, start, far)
    await expect(row(page, DAHL)).toHaveCount(0)
    await recipesRegion(page).getByRole('button', { name: 'Dismiss' }).click()
    await expect(recipesRegion(page).getByText(`Removed ${DAHL}`)).toHaveCount(
      0
    )
    await expect(row(page, DAHL)).toHaveCount(0)
  })
})
