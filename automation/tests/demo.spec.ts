import { expect, test } from './fixtures'

/* #216 The permanent /demo loop: ingredient -> suggestion -> ticket, no backend. */

test.beforeEach(async ({ page }) => {
  await page.goto('/demo')
})

test.describe('/demo (#216)', () => {
  test('search, pick, see what is missing and the cost, add a ticket', async ({
    page
  }) => {
    await page.getByLabel('Find an ingredient').fill('carr')
    await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(1)
    await page.getByRole('button', { name: 'Add carrot' }).click()
    await expect(page.getByRole('status')).toHaveText('carrot picked')
    await page.getByLabel('Find an ingredient').fill('')
    await page.getByRole('button', { name: 'Add flour' }).click()
    const card = page
      .getByRole('main')
      .getByRole('listitem')
      .filter({ hasText: 'Carrot cake' })
    await expect(card).toContainText('Add sugar · $2 to buy')
    await card.getByRole('button', { name: 'Add ticket' }).click()
    await expect(page.getByRole('status')).toHaveText(
      'Carrot cake is on your tickets'
    )
    const tickets = page.getByRole('region', { name: 'Tickets' })
    await expect(tickets).toContainText('Carrot cake')
  })

  test('the bottom-right button adds the top suggestion and stays in the corner, above the tabs', async ({
    page
  }) => {
    const disabled = page.getByRole('button', { name: 'Add ticket' })
    await expect(disabled).toBeDisabled()
    await page.getByRole('button', { name: 'Add carrot' }).click()
    const fab = page.getByRole('button', {
      name: 'Add ticket for Carrot cake'
    })
    const box = await fab.boundingBox()
    const viewport = page.viewportSize()
    if (box === null || viewport === null) throw new Error('no box')
    expect(box.x + box.width).toBeGreaterThan(viewport.width - 40)
    /* just above the bottom tabs (#227), which never cover it */
    const navTop =
      (await page.getByRole('navigation', { name: 'Main' }).boundingBox())?.y ??
      0
    expect(box.y + box.height).toBeLessThanOrEqual(navTop)
    expect(box.y + box.height).toBeGreaterThan(navTop - 40)
    await fab.click()
    await expect(page.getByRole('region', { name: 'Tickets' })).toContainText(
      'Carrot cake'
    )
  })

  test('nothing scrolls sideways', async ({ page }) => {
    await page.getByRole('button', { name: 'Add carrot' }).click()
    const wide = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )
    expect(wide).toBe(false)
  })
})
