import { expect, test } from './fixtures'
import { DAHL, explore, openExplore, pickRows, searchBox } from './page'

/* #232 Dashboard: macros, estimated cost and the spread over shop sections for the current list. */

const dashboard = (page: import('@playwright/test').Page) =>
  page.getByRole('region', { name: 'Dashboard', exact: true })

test.describe('dashboard (#232)', () => {
  test('is empty until something is on the list', async ({ page }) => {
    await page.goto('/')
    await expect(
      dashboard(page).getByText(/Nothing on your list yet/)
    ).toBeVisible()
  })

  test('a recipe on the list gives cost, macros and a spread by section', async ({
    page
  }) => {
    await page.goto('/')
    await openExplore(page)
    await pickRows(page, DAHL)
    await expect(dashboard(page).getByText('Estimated cost')).toBeVisible()
    await expect(dashboard(page).getByText(/^About \$\d+\.\d\d$/)).toBeVisible()
    await expect(dashboard(page).getByText('Energy')).toBeVisible()
    await expect(dashboard(page).getByText(/^\d+ kJ$/)).toBeVisible()
    await expect(dashboard(page).getByText('Protein')).toBeVisible()
    const meters = dashboard(page).getByRole('meter')
    expect(await meters.count()).toBeGreaterThan(1)
    await expect(
      dashboard(page).getByRole('meter', { name: 'Fruit & Veg' })
    ).toBeVisible()
  })

  test('adding an ingredient from Explore raises the cost', async ({
    page
  }) => {
    await page.goto('/')
    await openExplore(page)
    await searchBox(page).fill('beef rump')
    await explore(page).getByRole('button', { name: 'Add beef rump' }).click()
    await expect(dashboard(page).getByText(/^About \$\d+\.\d\d$/)).toBeVisible()
    await expect(
      dashboard(page).getByRole('meter', { name: 'Meat & Seafood' })
    ).toBeVisible()
  })
})
