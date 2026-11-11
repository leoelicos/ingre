import { expect, test } from './fixtures'
import { DAHL, pickRows, searchBox } from './page'

/* #210 The bottom-right area: a fixed FAB cluster on the list page, content scrolling under it. */

test.describe('bottom-right area (#210)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('the FAB (#192) sits in the bottom-right corner, above the tabs', async ({
    page
  }) => {
    const add = page.getByRole('button', { name: 'Add a recipe', exact: true })
    await expect(add).toBeVisible()
    const box = await add.boundingBox()
    const viewport = page.viewportSize()
    if (box === null || viewport === null) throw new Error('no box')
    expect(box.x + box.width).toBeGreaterThan(viewport.width - 40)
    /* just above the bottom tabs (#227), which never cover it */
    const navTop =
      (await page.getByRole('navigation', { name: 'Main' }).boundingBox())?.y ??
      0
    expect(box.y + box.height).toBeLessThanOrEqual(navTop)
    expect(box.y + box.height).toBeGreaterThan(navTop - 40)
    expect(box.width).toBeGreaterThanOrEqual(44)
  })

  test('it stays put while the page scrolls underneath', async ({ page }) => {
    /* the FAB's label changes as Ingredients comes up (#192), so watch the corner it sits in */
    const area = page.getByRole('group', { name: 'Quick actions' })
    const corner = async () => {
      const box = await area.boundingBox()
      if (box === null) throw new Error('no box')
      return { right: box.x + box.width, bottom: box.y + box.height }
    }
    const before = await corner()
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
    )
    await expect(area).toBeVisible()
    expect(await corner()).toEqual(before)
  })

  test('the last content can be scrolled clear of the buttons', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
    )
    const cluster = page.getByRole('group', { name: 'Quick actions' })
    const clusterTop = (await cluster.boundingBox())?.y ?? 0
    const lastBottom = await page.evaluate(
      () =>
        document.querySelector('[data-workspace]')?.getBoundingClientRect()
          .bottom ?? 0
    )
    expect(lastBottom).toBeLessThanOrEqual(clusterTop + 1)
  })

  test('+ Recipe opens Explore and puts the cursor in search', async ({
    page
  }) => {
    await page
      .getByRole('button', { name: 'Add a recipe', exact: true })
      .click()
    await expect(searchBox(page)).toBeFocused()
  })
})
