import { expect, test } from './fixtures'
import {
  CURRY,
  DAHL,
  box,
  chevron,
  chip,
  chipToggle,
  panel,
  pickRows,
  setBox,
  sourceBox,
  crossOff
} from './page'

/* #181 Ingredient chips: checkbox, no "1×" for mass/volume, neumorphic chevron, fan, no Done. */

test.describe('ingredient chips (#181)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
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
    await crossOff(page, 'tomato')
    await expect(check).toHaveText('✓')
  })

  test('a tap anywhere on the chip, the checkbox included, crosses it off; it does not open the panel', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const check = chip(page, 'tomato').getByTestId('chip-check')
    await check.click()
    await expect(chipToggle(page, 'tomato')).toBeChecked()
    await chip(page, 'tomato').getByText('Tomatoes').click()
    await expect(chipToggle(page, 'tomato')).not.toBeChecked()
    await expect(
      page.getByRole('group', { name: 'Tomatoes details' })
    ).toBeHidden()
  })

  test('the chip shows the total; masses and volumes drop "1×" (#182, F3)', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const lentils = chip(page, 'red-lentils').locator('label').first()
    await expect(lentils).toContainText('150 g')
    await expect(lentils).not.toContainText('×')
    await chevron(page, 'red-lentils').click()
    const details = panel(page, 'Red lentils')
    await setBox(sourceBox(details, DAHL), '520')
    await expect(lentils).toContainText('520 g')
    await expect(lentils).not.toContainText('×')
    await expect(details.getByText('Total: 520 g')).toBeVisible()
  })

  test('the chevron lies flat in the raised chip (no fill or shadow); it opens and closes the panel', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const chevron = page.getByRole('button', { name: 'Tomatoes details' })
    const shadow = () =>
      chevron.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(await shadow()).toBe('none')
    await expect(chevron).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(
      chip(page, 'tomato').locator('[role="separator"]')
    ).toHaveCount(0)
    await chevron.click()
    await expect(
      page.getByRole('group', { name: 'Tomatoes details' })
    ).toBeVisible()
    await expect(chevron).toHaveAttribute('aria-expanded', 'true')
    expect(await shadow()).toBe('none')
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
    // each recipe with its box, which reads in onions (#182, owner decision 2)
    await expect(panel.getByRole('listitem')).toContainText([DAHL, CURRY])
    await expect(panel.getByRole('listitem')).toHaveCount(2)
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

  test('neumorphic chip: a raised platform with no fill or gradient, pressed in once crossed off', async ({
    page
  }) => {
    await pickRows(page, DAHL)
    const tomato = chip(page, 'tomato')
    const shadow = () => tomato.evaluate((el) => getComputedStyle(el).boxShadow)
    const raised = await shadow()
    expect(raised).not.toBe('none')
    expect(raised).not.toContain('inset')
    await expect(tomato).toHaveCSS('background-image', 'none')
    await expect(tomato).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(tomato).toHaveCSS('border-top-style', 'solid')
    const check = tomato.getByTestId('chip-check')
    await expect(check).toHaveCSS('box-shadow', 'none')
    await expect(check).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await crossOff(page, 'tomato')
    await expect.poll(shadow).toContain('inset')
    await expect(check).toHaveCSS('box-shadow', 'none')
    await expect(check).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  })

  test('no Done button: changes apply at once', async ({ page }) => {
    await pickRows(page, DAHL)
    await chevron(page, 'tomato').click()
    const details = panel(page, 'Tomatoes')
    await expect(details.getByRole('button', { name: 'Done' })).toHaveCount(0)
    await setBox(sourceBox(details, DAHL), '2')
    await expect(chipToggle(page, 'tomato')).toHaveAccessibleName(
      /^Tomatoes, 2\b/
    )
    await expect(details).toBeVisible()
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
