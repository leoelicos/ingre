import { expect, test } from './fixtures'
import { DAHL, explore, openExplore, pickRows, searchBox } from './page'

/* The ingredient pictograms (#290) in Explore and the chips: they load, and stay decorative. */

test('Explore results and the chips show each ingredient picture, decorative and lazy', async ({
  page
}) => {
  await page.goto('/')
  await pickRows(page, DAHL)
  const chipPicture = page
    .locator('[data-chip="garlic"] img[src="/ingredients/garlic.svg"]')
    .first()
  await chipPicture.scrollIntoViewIfNeeded()
  await expect(chipPicture).toHaveJSProperty('complete', true)
  expect(
    await chipPicture.evaluate((img: HTMLImageElement) => img.naturalWidth)
  ).toBeGreaterThan(0)
  await openExplore(page)
  await searchBox(page).fill('banana')
  const add = explore(page).getByRole('button', { name: 'Add banana' }).first()
  await expect(add).toBeVisible()
  const picture = add.locator('img')
  await expect(picture).toHaveAttribute('src', '/ingredients/banana.svg')
  await expect(picture).toHaveAttribute('alt', '')
  await expect(picture).toHaveAttribute('aria-hidden', 'true')
  await expect(picture).toHaveAttribute('loading', 'lazy')
  await expect
    .poll(() => picture.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0)
})
