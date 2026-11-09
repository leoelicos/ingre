import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { ingredientsRegion } from './page'

/*
 * #207 War room: a button in the menu bar opens a bare, fast capture list.
 * t26u: suggestions as you type (WAI-ARIA combobox), rapid entry with Undo, paste a list,
 * one-tap recent and examples, and a history kept on the device.
 */

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const field = (page: Page) =>
  page.getByRole('combobox', { name: 'Add an item', exact: true })
const status = (page: Page) => page.getByRole('status')
const history = (page: Page) =>
  page.getByRole('region', { name: 'History', exact: true })

const violations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  return results.violations.map((v) => ({
    id: v.id,
    targets: v.nodes.map((n) => n.target.join(' '))
  }))
}

test.describe('war room (#207)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'War room', exact: true })
      .click()
    await expect(field(page)).toBeFocused()
  })

  test('opens from the menu bar with the field ready to type into', async ({
    page
  }) => {
    await expect(page).toHaveURL(/\/war-room$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'War room' })
    ).toBeVisible()
    await expect(field(page)).toBeFocused()
    await expect(
      page.getByRole('region', { name: 'Try one', exact: true })
    ).toBeVisible()
  })

  test('typing and Enter, over and over, with an inline acknowledgement each time', async ({
    page
  }) => {
    for (const [text, said] of [
      ['3 carrots', 'Carrot added'],
      ['2 tins of chickpeas', 'Chickpeas added'],
      ['brocoli', 'Broccoli added'],
      ['egg', 'Eggs added']
    ] as const) {
      await page.keyboard.type(text)
      await page.keyboard.press('Enter')
      await expect(status(page)).toHaveText(said)
      await expect(field(page)).toHaveValue('')
      await expect(field(page)).toBeFocused()
    }
    await expect(
      history(page).getByRole('button', { name: /again$/ })
    ).toHaveCount(4)
    await expect(
      history(page).getByRole('button', {
        name: 'Add carrot ×3 again',
        exact: true
      })
    ).toBeVisible()
  })

  test('suggestions by keyboard only: arrows, Tab to complete, Enter to add, Esc to close', async ({
    page
  }) => {
    await page.keyboard.type('2 car')
    await expect(field(page)).toHaveAttribute('aria-expanded', 'true')
    const listbox = page.getByRole('listbox', { name: 'Matches' })
    await expect(listbox.getByRole('option', { name: 'Carrot' })).toBeVisible()
    await page.keyboard.press('ArrowDown')
    const first = listbox.getByRole('option').first()
    await expect(first).toHaveAttribute('aria-selected', 'true')
    await expect(field(page)).toHaveAttribute(
      'aria-activedescendant',
      (await first.getAttribute('id')) ?? ''
    )
    await page.keyboard.press('Tab')
    await expect(field(page)).toHaveValue('2 carrot')
    await expect(field(page)).toBeFocused()
    await page.keyboard.type(', oni')
    await page.keyboard.press('Escape')
    await expect(field(page)).toHaveAttribute('aria-expanded', 'false')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(status(page)).toHaveText('Carrot, Brown onion added')
  })

  test('a tap on a suggestion adds it and keeps the field focused', async ({
    page
  }) => {
    await page.keyboard.type('car')
    await page.getByRole('option', { name: 'Carrot', exact: true }).click()
    await expect(status(page)).toHaveText('Carrot added')
    await expect(field(page)).toBeFocused()
  })

  test('a pasted list goes on at once, and Undo takes it off again', async ({
    page
  }) => {
    await page.evaluate(() => {
      const data = new DataTransfer()
      data.setData('text/plain', '- garlic\n- [ ] 2 eggs\n3. honey')
      document
        .getElementById('war-room-field')
        ?.dispatchEvent(
          new ClipboardEvent('paste', {
            clipboardData: data,
            bubbles: true,
            cancelable: true
          })
        )
    })
    await expect(status(page)).toHaveText('Garlic, Eggs, Honey added')
    await page.getByRole('button', { name: /^Undo adding/ }).click()
    await expect(status(page)).toContainText('taken off your list')
    await expect(field(page)).toBeFocused()
    await expect(history(page)).toContainText('Nothing yet')
  })

  test('history survives a reload; an entry is added again in one tap', async ({
    page
  }) => {
    await page.keyboard.type('garlic')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Control+z')
    await expect(status(page)).toHaveText('Garlic taken off your list')
    await page.keyboard.type('lime')
    await page.keyboard.press('Enter')
    await page.reload()
    await expect(
      page.getByRole('region', { name: 'Recently added', exact: true })
    ).toHaveCount(0)
    await history(page)
      .getByRole('button', { name: 'Add lime again', exact: true })
      .click()
    await expect(status(page)).toHaveText('Lime already on your list')
  })

  test('clear history asks first, with the safe answer focused', async ({
    page
  }) => {
    await page.keyboard.type('garlic')
    await page.keyboard.press('Enter')
    await page
      .getByRole('button', { name: 'Clear history', exact: true })
      .click()
    await expect(
      page.getByRole('button', { name: 'Keep', exact: true })
    ).toBeFocused()
    await page.getByRole('button', { name: 'Clear all', exact: true }).click()
    await expect(status(page)).toHaveText('History cleared')
    await expect(history(page)).toContainText('Nothing yet')
  })

  test('"/" jumps back to the field from anywhere on the page', async ({
    page
  }) => {
    await page.getByRole('link', { name: 'Back to your list' }).focus()
    await page.keyboard.press('/')
    await expect(field(page)).toBeFocused()
    await expect(field(page)).toHaveValue('')
  })

  test('every target is at least 44 px, and axe finds nothing in light or dark', async ({
    page
  }) => {
    await page.keyboard.type('carrot')
    await page.keyboard.press('Enter')
    await page.keyboard.type('oni')
    await page.keyboard.press('ArrowDown')
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme })
      expect(await violations(page)).toEqual([])
    }
    const small = await page
      .locator('main button:visible, main [role="option"]:visible')
      .evaluateAll((elements) =>
        elements
          .map((e) => e.getBoundingClientRect())
          .filter((r) => r.height < 44)
          .map((r) => r.height)
      )
    expect(small).toEqual([])
  })

  test('what was captured is on the shopping list', async ({ page }) => {
    await page.keyboard.type('2 onions')
    await page.keyboard.press('Enter')
    await expect(status(page)).toHaveText('Brown onion added')
    await page
      .getByRole('link', { name: 'Back to your list', exact: true })
      .click()
    await expect(ingredientsRegion(page)).toContainText('Brown onion')
  })
})
