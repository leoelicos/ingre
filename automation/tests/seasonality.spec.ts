import { expect, test } from './fixtures'
import { explore, openExplore } from './page'
import { clearStripeCalls, stripeCalls } from './wiremock'

/*
 * #218 Seasonality (Sydney) and the stubbed micropayment, each behind its own flag.
 * The date is fixed (15 Nov 2026, Sydney) so the month is the same on every run.
 * The micropayment is a stub: no Stripe or WireMock call is made, nothing is charged.
 */

const NOVEMBER = new Date('2026-11-15T10:00:00+11:00')

test.describe('seasonality (#218)', () => {
  test.beforeEach(async ({ page, request }) => {
    await clearStripeCalls(request)
    await page.clock.setFixedTime(NOVEMBER)
  })

  test('flag off: Explore has no in-season group', async ({ page }) => {
    await page.goto('/')
    await openExplore(page)
    await expect(
      page.getByRole('region', { name: 'In season now' })
    ).toHaveCount(0)
  })

  test('flag on: what is in season this month in Sydney, and recipes that use it', async ({
    page
  }) => {
    await page.goto('/?flags=seasonality')
    await openExplore(page)
    const group = page.getByRole('region', { name: 'In season now' })
    await expect(group).toBeVisible()
    await expect(group.getByText('November in Sydney')).toBeVisible()
    await expect(
      group.getByRole('button', { name: 'Add tomatoes' })
    ).toBeVisible()
    await expect(group.getByText('A guide only.')).toBeVisible()
    await group
      .getByRole('button', { name: /Pick Greek salad with haloumi/ })
      .click()
    await expect(
      page
        .getByRole('region', { name: 'Recipes' })
        .getByText('Greek salad with haloumi')
        .first()
    ).toBeVisible()
    // the library below is untouched
    await expect(
      explore(page).getByRole('heading', { name: 'Browse recipes' })
    ).toBeVisible()
  })

  test('micropayment stub: unlock the editor’s pick, no charge, no Stripe call', async ({
    page,
    request
  }) => {
    await page.goto('/?flags=seasonality,micropayments')
    await openExplore(page)
    await expect(page.getByText("Editor's pick")).toBeVisible()
    await page
      .getByRole('button', { name: /Unlock why it is in season/ })
      .click()
    await expect(
      page.getByRole('region', { name: 'In season now' }).getByRole('status')
    ).toHaveText('Unlocked. This is a stub: you were not charged.')
    await expect(page.getByText(/Why it is in season:/)).toBeVisible()
    expect(await stripeCalls(request)).toEqual([])
    await page.reload()
    await expect(
      page.getByRole('region', { name: 'In season now' }).getByRole('status')
    ).toBeVisible()
  })
})
