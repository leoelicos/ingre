import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

/* Japanese (ja): a ja-JP browser opens the app in Japanese; axe-clean, nothing spills
   off a phone screen, and the Profile picker switches back by keyboard alone. */

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const violations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  return results.violations.map((v) => ({
    id: v.id,
    targets: v.nodes.map((n) => n.target.join(' '))
  }))
}

/** True when the page is wider than the screen (a Japanese line that will not wrap). */
const overflows = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  )

const nav = (page: Page) =>
  page.getByRole('navigation', { name: 'メイン', exact: true })

const exploreSheet = (page: Page) =>
  page.getByRole('dialog', { name: 'さがす', exact: true })

/** Opens the Explore sheet (#192) from the FAB, "+ レシピ", unless it is open already. */
const openExplore = async (page: Page) => {
  if (await exploreSheet(page).isVisible()) return
  await page.getByRole('button', { name: 'レシピを追加', exact: true }).click()
  await expect(exploreSheet(page)).toBeVisible()
}

test.describe('Japanese (ja)', () => {
  test.use({ locale: 'ja-JP' })

  for (const scheme of ['light', 'dark'] as const) {
    test(`the list opens in Japanese from a ja-JP browser, axe-clean (${scheme})`, async ({
      page
    }) => {
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto('/')
      await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
      await expect(page).toHaveTitle('買い物リスト')
      await expect(nav(page).getByRole('link')).toHaveText([
        'さがす',
        '在庫',
        '料理',
        'マイページ'
      ])
      await openExplore(page)
      await expect(
        page.getByRole('searchbox', { name: '食材とレシピを検索' })
      ).toBeVisible()
      expect(await overflows(page)).toBe(false)
      expect(await violations(page)).toEqual([])
    })
  }

  test('Explore and a picked recipe read in Japanese, fit the screen and are axe-clean', async ({
    page
  }) => {
    await page.goto('/')
    await openExplore(page)
    const explore = exploreSheet(page)
    await expect(
      explore.getByRole('searchbox', { name: '食材とレシピを検索' })
    ).toBeFocused()
    const dahl = explore.getByRole('button', {
      name: 'Red lentil dahl',
      exact: true
    })
    await dahl.click()
    await expect(dahl).toHaveAttribute('aria-pressed', 'true')
    expect(await overflows(page)).toBe(false)
    expect(await violations(page)).toEqual([])
    await page.getByRole('button', { name: 'さがすを閉じる' }).click()
    await expect(explore).toHaveCount(0)
    await expect(
      page.getByRole('region', { name: '材料', exact: true })
    ).toBeVisible()
    expect(await overflows(page)).toBe(false)
    expect(await violations(page)).toEqual([])
  })

  test('Japanese text uses a Japanese font after Poppins, without keep-all', async ({
    page
  }) => {
    await page.goto('/')
    const style = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement)
      return { font: s.fontFamily, wordBreak: s.wordBreak }
    })
    expect(style.font).toMatch(/^Poppins, "Hiragino Sans".*"Noto Sans JP"/)
    expect(style.wordBreak).toBe('normal')
  })

  test('Profile and Log in read in Japanese, fit the screen and are axe-clean', async ({
    page
  }) => {
    await page.goto('/profile')
    await expect(
      page.getByRole('heading', { level: 1, name: 'マイページ' })
    ).toBeVisible()
    await expect(page.getByRole('radio', { name: '日本語' })).toBeChecked()
    expect(await overflows(page)).toBe(false)
    expect(await violations(page)).toEqual([])

    await page.goto('/login')
    await expect(page).toHaveTitle('ログイン')
    const alt = page.locator('.auth-page__alt')
    await expect(alt).toHaveText('アカウントをお持ちでない方は新規登録')
    await expect(alt.getByRole('link', { name: '新規登録' })).toBeVisible()
    expect(await overflows(page)).toBe(false)
    expect(await violations(page)).toEqual([])
  })

  test('switches back to English by keyboard alone, and remembers it', async ({
    page
  }) => {
    await page.goto('/profile')
    const japanese = page.getByRole('radio', { name: '日本語' })
    await japanese.focus()
    await page.keyboard.press('ArrowUp')
    await expect(page.getByRole('radio', { name: 'English' })).toBeChecked()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Profile' })
    ).toBeVisible()
    await expect(page).toHaveTitle('Profile')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(
      page.getByRole('navigation', { name: 'Main', exact: true })
    ).toBeVisible()
  })
})

test.describe('an English browser', () => {
  test('starts in English and can pick 日本語 on Profile', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    const option = page.getByText('日本語', { exact: true })
    await expect(option).toHaveAttribute('lang', 'ja')
    await option.click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
    await expect(page.getByRole('heading', { name: '言語' })).toBeVisible()
    await nav(page).getByRole('link', { name: 'さがす' }).click()
    await expect(page).toHaveTitle('買い物リスト')
  })
})
