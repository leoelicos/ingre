import { expect, test } from './fixtures'
import { explore, openExplore, recipesRegion, searchBox } from './page'

/* #204 Ingredient-first core loop: pick ingredients, see what is missing and its cost, add in one action. */

const CHOPS = 'Pork chops with apples and onion'

test.describe('ingredient-first core loop (#204)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await openExplore(page)
  })

  const suggestions = (page: import('@playwright/test').Page) =>
    page.getByRole('region', { name: 'Suggestions', exact: true })

  test('browse ingredients, select two, and the first suggestion lists what is missing and about what it costs', async ({
    page
  }) => {
    await expect(suggestions(page)).toHaveCount(0)
    await explore(page)
      .getByRole('button', { name: 'Browse ingredients' })
      .click()
    await explore(page)
      .getByRole('button', { name: 'Apples', exact: true })
      .click()
    await explore(page)
      .getByRole('button', { name: 'Brown onion', exact: true })
      .click()
    await expect(
      suggestions(page).getByRole('list', { name: 'Using' })
    ).toContainText('Apples')
    const note = suggestions(page).getByTestId('suggestion-note').first()
    await expect(note).toContainText('Missing: pork loin chops, butter')
    await expect(note).toContainText('About $14.00 more')
  })

  test('search for an ingredient, press Use, and add the suggestion to the list in one tap, with an acknowledgement', async ({
    page
  }) => {
    await searchBox(page).fill('apples')
    await explore(page).getByRole('button', { name: 'Use apples' }).click()
    await suggestions(page)
      .getByRole('button', { name: `Add ${CHOPS} to your list` })
      .click()
    await expect(suggestions(page).getByRole('status')).toHaveText(
      `${CHOPS} added to your list`
    )
    await expect(
      recipesRegion(page).getByRole('button', { name: CHOPS, exact: true })
    ).toBeVisible()
    await expect(
      suggestions(page).getByTestId('suggestion-note').first()
    ).toContainText('✓ On your list')
  })

  test('the full recipe stays closed until See recipe is pressed', async ({
    page
  }) => {
    await searchBox(page).fill('apples')
    await explore(page).getByRole('button', { name: 'Use apples' }).click()
    await expect(suggestions(page).getByText('Method')).toHaveCount(0)
    await suggestions(page)
      .getByRole('button', { name: `See recipe: ${CHOPS}` })
      .click()
    await expect(suggestions(page).getByText('Method')).toBeVisible()
  })

  test('Stop using takes an ingredient out and the suggestions go with it', async ({
    page
  }) => {
    await searchBox(page).fill('apples')
    await explore(page).getByRole('button', { name: 'Use apples' }).click()
    await suggestions(page)
      .getByRole('button', { name: 'Stop using apples' })
      .click()
    await expect(suggestions(page)).toHaveCount(0)
  })
})
