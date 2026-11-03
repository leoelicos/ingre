import { readFile } from 'node:fs/promises'
import { accountMenu, expect, test } from './fixtures'
import { DAHL, exploreRow, openExplore, row, searchBox } from './page'

/* #230: import and export, from the account menu. */

const SOUP = {
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  name: 'Lentil soup',
  recipeYield: '4 servings',
  recipeIngredient: ['200 g red lentils', '1 brown onion', '2 unicorn horns'],
  recipeInstructions: [{ '@type': 'HowToStep', text: 'Simmer.' }]
}

test.describe('import and export (#230)', () => {
  test('the account menu opens the page', async ({ page }) => {
    await page.goto('/')
    await accountMenu(page, 'Import and export')
    await expect(page).toHaveURL(/\/transfer$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Import and export' })
    ).toBeVisible()
  })

  test('exports every recipe as schema.org JSON-LD', async ({ page }) => {
    await page.goto('/transfer')
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'All recipes' }).click()
    const file = await download
    expect(file.suggestedFilename()).toBe('ingre-all-recipes.json')
    const recipes: unknown = JSON.parse(
      await readFile(await file.path(), 'utf8')
    )
    expect(Array.isArray(recipes) ? recipes.length : 0).toBe(14)
    expect(JSON.stringify(recipes)).toContain('"@type":"Recipe"')
  })

  test('imports a recipe file; it shows in Explore and goes on the list', async ({
    page
  }) => {
    await page.goto('/transfer')
    await page.locator('input[type="file"]').setInputFiles({
      name: 'soup.json',
      mimeType: 'application/ld+json',
      buffer: Buffer.from(JSON.stringify(SOUP))
    })
    const status = page.getByRole('status')
    await expect(status).toContainText('Added Lentil soup: 2 of 3 ingredients.')
    await expect(status).toContainText('Not matched: 2 unicorn horns')
    await page.getByRole('link', { name: 'Back to your list' }).click()
    await openExplore(page)
    await searchBox(page).fill('lentil soup')
    await exploreRow(page, 'Lentil soup').click()
    await expect(row(page, 'Lentil soup')).toBeVisible()
  })

  test('an imported recipe is still there after a reload, and can be removed', async ({
    page
  }) => {
    await page.goto('/transfer')
    await page.getByLabel('Or paste recipe JSON').fill(JSON.stringify(SOUP))
    await page.getByRole('button', { name: 'Import pasted recipe' }).click()
    await page.reload()
    const imported = page.getByRole('region', { name: 'Imported recipes' })
    await expect(imported.getByText('Lentil soup')).toBeVisible()
    await page.getByRole('button', { name: 'Remove Lentil soup' }).click()
    await expect(page.getByText('Nothing imported yet.')).toBeVisible()
  })

  test('says so for text that is not a recipe', async ({ page }) => {
    await page.goto('/transfer')
    await page.getByLabel('Or paste recipe JSON').fill('hello')
    await page.getByRole('button', { name: 'Import pasted recipe' }).click()
    await expect(page.getByRole('status')).toHaveText('That is not valid JSON.')
  })

  test('exports the shopping list as CSV', async ({ page }) => {
    await page.goto('/')
    await openExplore(page)
    await exploreRow(page, DAHL).click()
    await accountMenu(page, 'Import and export')
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Shopping list (CSV)' }).click()
    const file = await download
    expect(file.suggestedFilename()).toBe('ingre-shopping-list.csv')
    const csv = await readFile(await file.path(), 'utf8')
    expect(csv.split('\r\n')[0]).toBe('Item,Quantity,Section')
    expect(csv).toContain('red lentils')
  })
})
