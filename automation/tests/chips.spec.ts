import { expect, test } from './fixtures'
import {
  CURRY,
  DAHL,
  box,
  chip,
  chipToggle,
  pickRows,
  useVertical
} from './page'

/* #181 Ingredient chips: checkbox, no "1×" for mass/volume, neumorphic chevron, fan, no Done. */

test.describe('ingredient chips (#181)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await useVertical(page)
  })

  test('a checkbox replaces the three-letter code and ticks when crossed off', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const check = chip(page, 'tomato').getByTestId('chip-check')
    await expect(check).toBeVisible()
    await expect(check).toHaveText('')
    await expect(chip(page, 'tomato')).not.toContainText('TOM')
    await expect(
      page.locator('[data-chip]').getByText(/^[A-Z]{3}$/)
    ).toHaveCount(0)
    await chipToggle(page, 'tomato').click()
    await expect(check).toHaveText('✓')
  })

  test('a tap anywhere on the chip, the checkbox included, crosses it off; it does not open the panel', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const check = chip(page, 'tomato').getByTestId('chip-check')
    await check.click()
    await expect(chipToggle(page, 'tomato')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await chip(page, 'tomato').getByText('Tomatoes').click()
    await expect(chipToggle(page, 'tomato')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    await expect(
      page.getByRole('group', { name: 'Tomatoes details' })
    ).toBeHidden()
  })

  test('masses and volumes drop "1×"; two packs read "2 × 500 g"', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const lentils = chipToggle(page, 'red-lentils')
    await expect(lentils).toContainText('500 g')
    await expect(lentils).not.toContainText('×')
    await chip(page, 'red-lentils')
      .getByRole('button', { name: 'Red lentils details' })
      .click()
    await page
      .getByRole('group', { name: 'Red lentils details' })
      .getByRole('button', { name: /Increase/ })
      .click()
    await expect(lentils).toContainText('2 × 500 g')
  })

  test('the chevron is a neumorphic button of its own, pressed in while open; it opens and closes the panel', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const chevron = page.getByRole('button', { name: 'Tomatoes details' })
    const shadow = () =>
      chevron.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(await shadow()).not.toBe('none')
    expect(await shadow()).not.toContain('inset')
    await expect(
      chip(page, 'tomato').locator('[role="separator"]')
    ).toHaveCount(0)
    await chevron.click()
    await expect(
      page.getByRole('group', { name: 'Tomatoes details' })
    ).toBeVisible()
    await expect.poll(shadow).toContain('inset')
    await chevron.click()
    await expect(
      page.getByRole('group', { name: 'Tomatoes details' })
    ).toBeHidden()
  })

  test('no recipe-count badge on the chip; "Used in" stays inside the open panel', async ({
    page
  }) => {
    await pickRows(page, DAHL, CURRY)
    await expect(chip(page, 'onion').getByTestId('chip-count')).toHaveCount(0)
    await expect(chip(page, 'onion')).not.toContainText(/\b2\b.*recipes/)
    await page.getByRole('button', { name: 'Brown onion details' }).click()
    const panel = page.getByRole('group', { name: 'Brown onion details' })
    await expect(panel.getByRole('heading', { name: 'Used in' })).toBeVisible()
    await expect(panel.getByRole('listitem')).toHaveText([DAHL, CURRY])
  })

  test('the open panel stays in place, with a fan stemming down from its chip', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    await page.getByRole('button', { name: 'Tomatoes details' }).click()
    const fan = await page
      .locator('[data-fan]:not([hidden])')
      .evaluate((el) => {
        const before = getComputedStyle(el, '::before')
        return {
          content: before.content,
          left: parseFloat(before.left),
          width: parseFloat(before.width),
          height: parseFloat(before.height)
        }
      })
    expect(fan.content).not.toBe('none')
    expect(fan.width).toBeGreaterThan(0)
    expect(fan.height).toBeGreaterThan(0)
    // the fan is centred under the tomato chip
    const chipBox = await box(chip(page, 'tomato'))
    const panelBox = await box(page.locator('[data-fan]:not([hidden])'))
    const centre = chipBox.x + chipBox.width / 2 - panelBox.x
    expect(Math.abs(fan.left - centre)).toBeLessThan(chipBox.width / 2)
    expect(panelBox.y).toBeGreaterThanOrEqual(chipBox.y + chipBox.height - 1)
    await expect(
      page.getByRole('group', { name: 'Tomatoes details' })
    ).toBeVisible()
  })

  test('chips do not look joined: each has its own shadow and a gap from its neighbours', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const chips = page.locator('[data-chip]')
    const boxes = await chips.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect()
        return { x: r.x, y: r.y, right: r.right, bottom: r.bottom }
      })
    )
    for (let i = 1; i < boxes.length; i++) {
      const a = boxes[i - 1]
      const b = boxes[i]
      if (a === undefined || b === undefined) continue
      if (Math.abs(a.y - b.y) < 2)
        expect(b.x - a.right).toBeGreaterThanOrEqual(8)
    }
    const shadows = await chips.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).boxShadow)
    )
    shadows.forEach((s) => expect(s).not.toBe('none'))
  })

  test('skeuomorphic chip: raised, then pressed in once crossed off', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const shadow = () =>
      chip(page, 'tomato').evaluate((el) => getComputedStyle(el).boxShadow)
    const raised = await shadow()
    expect(raised).not.toContain('inset')
    expect(
      await chip(page, 'tomato').evaluate(
        (el) => getComputedStyle(el).backgroundImage
      )
    ).toContain('gradient')
    await chipToggle(page, 'tomato').click()
    await expect.poll(shadow).toContain('inset')
  })

  test('no Done button: changes apply at once', async ({ page }) => {
    await pickRows(page, DAHL)
    await page.getByRole('button', { name: 'Tomatoes details' }).click()
    const panel = page.getByRole('group', { name: 'Tomatoes details' })
    await expect(panel.getByRole('button', { name: 'Done' })).toHaveCount(0)
    await panel.getByRole('button', { name: /Increase/ }).click()
    await expect(chipToggle(page, 'tomato')).toHaveAccessibleName(
      /^Tomatoes, 2\b/
    )
    await expect(panel).toBeVisible()
  })

  test('allergens show as tags on the ingredient', async ({ page }) => {
    await pickRows(page, DAHL)
    await page.getByRole('button', { name: 'Butter details' }).click()
    const tags = page
      .getByRole('group', { name: 'Butter details' })
      .getByRole('list', { name: 'Allergens' })
    await expect(tags.getByRole('listitem')).toHaveText(['milk'])
  })
})
