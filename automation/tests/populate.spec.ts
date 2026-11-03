import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import {
  DAHL,
  explore,
  exploreRow,
  ingredientsRegion,
  openExplore,
  recipesRegion
} from './page'

/* #229 Populate from recipes: a compact "From a recipe" menu beside Filter, and a swipe right on an
   Explore row. Both fill Recipes and Ingredients; neither un-picks. */

const FROM = 'From a recipe'

/** A real touch swipe (finger down, moves, up) across the row, through the browser's touch input. */
const swipeRight = async (page: Page, title: string, dx: number, dy = 0) => {
  const box = await exploreRow(page, title).boundingBox()
  if (box === null) throw new Error(`no box for ${title}`)
  const x = box.x + 40
  const y = box.y + box.height / 2
  const cdp = await page.context().newCDPSession(page)
  const touch = (
    type: 'touchStart' | 'touchMove' | 'touchEnd',
    px: number,
    py: number
  ) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x: px, y: py }]
    })
  await touch('touchStart', x, y)
  for (const step of [0.25, 0.5, 0.75, 1])
    await touch('touchMove', x + dx * step, y + dy * step)
  await touch('touchEnd', x + dx, y + dy)
}

test.describe('populate from recipes (#229)', () => {
  test('From a recipe is a compact menu button beside Filter, not full width', async ({
    page
  }) => {
    await page.goto('/')
    await openExplore(page)
    const toolbar = explore(page).getByRole('toolbar', {
      name: 'Explore actions'
    })
    const button = toolbar.getByRole('button', { name: FROM })
    await expect(button).toBeVisible()
    await expect(toolbar.getByRole('button', { name: /^Filter/ })).toBeVisible()
    const [b, t] = await Promise.all([
      button.boundingBox(),
      toolbar.boundingBox()
    ])
    expect(b?.height).toBeGreaterThanOrEqual(44)
    expect((b?.width ?? 0) / (t?.width ?? 1)).toBeLessThan(0.6)
  })

  test('choosing a recipe from the menu fills Recipes and Ingredients, once', async ({
    page
  }) => {
    await page.goto('/')
    await openExplore(page)
    await explore(page).getByRole('button', { name: FROM }).click()
    await page.getByRole('menuitem', { name: DAHL }).click()
    await expect(
      recipesRegion(page).getByRole('button', { name: DAHL, exact: true })
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      ingredientsRegion(page)
        .getByText(/red lentils/i)
        .first()
    ).toBeVisible()
    await explore(page).getByRole('button', { name: FROM }).click()
    await expect(
      page.getByRole('menuitem', { name: `✓ ${DAHL}` })
    ).toHaveAttribute('aria-disabled', 'true')
  })

  test('the menu works from the keyboard', async ({ page }) => {
    await page.goto('/')
    await openExplore(page)
    await explore(page).getByRole('button', { name: FROM }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menu', { name: FROM })).toBeVisible()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(
      recipesRegion(page).getByRole('button', { pressed: true })
    ).toHaveCount(1)
  })

  test('a swipe right on a recipe picks it, and a second swipe leaves it picked', async ({
    page
  }) => {
    await page.goto('/')
    await openExplore(page)
    await swipeRight(page, DAHL, 140)
    await expect(exploreRow(page, DAHL)).toHaveAttribute('aria-pressed', 'true')
    await expect(
      recipesRegion(page).getByRole('button', { name: DAHL, exact: true })
    ).toBeVisible()
    await swipeRight(page, DAHL, 140)
    await expect(exploreRow(page, DAHL)).toHaveAttribute('aria-pressed', 'true')
  })

  test('a mostly vertical drag scrolls and does not pick', async ({ page }) => {
    await page.goto('/')
    await openExplore(page)
    await swipeRight(page, DAHL, 20, 160)
    await expect(exploreRow(page, DAHL)).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })
})
