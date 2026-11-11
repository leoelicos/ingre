/* Japanese (ja) across the whole app: one switch on Profile changes every screen at once. */
import '@testing-library/jest-dom'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { FC } from 'react'
import { useLocale as useAriaLocale } from 'react-aria-components'
import { Ingre } from '../App'
import { LOCALE_KEY, LocaleBoundary, setLocale } from '../i18n'
import { FIRST_RUN_KEY } from '../utils/firstRun/firstRun'

const openAt = (path: string) => {
  window.history.pushState({}, '', path)
  return render(<Ingre />)
}

describe('switching the app to Japanese', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(FIRST_RUN_KEY, '"done"')
  })
  afterEach(() => act(() => setLocale('en')))

  it('relabels the open page, the header, the tabs and the title, and sets <html lang>', async () => {
    const user = userEvent.setup()
    openAt('/profile')
    expect(document.title).toBe('Profile')
    await user.click(screen.getByRole('radio', { name: '日本語' }))

    expect(document.documentElement.lang).toBe('ja')
    expect(localStorage.getItem(LOCALE_KEY)).toBe('ja')
    expect(document.title).toBe('マイページ')
    expect(
      screen.getByRole('heading', { level: 1, name: 'マイページ' })
    ).toBeInTheDocument()
    const tabs = within(screen.getByRole('navigation', { name: 'メイン' }))
    expect(tabs.getByRole('link', { name: 'さがす' })).toBeInTheDocument()
    expect(tabs.getByRole('link', { name: '料理' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'アカウント' })
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '日本語' })).toBeChecked()
  })

  it('then every screen opens in Japanese, labels resolved at render time', async () => {
    const user = userEvent.setup()
    openAt('/profile')
    await user.click(screen.getByRole('radio', { name: '日本語' }))
    await user.click(screen.getByRole('link', { name: 'さがす' }))
    expect(document.title).toBe('買い物リスト')
    expect(
      screen.getByRole('searchbox', { name: '食材とレシピを検索' })
    ).toBeInTheDocument()
    // the Explore tab opens the Explore sheet (#192), a modal, so the page behind is hidden
    expect(
      screen.getByRole('link', { name: '本文へスキップ', hidden: true })
    ).toBeTruthy()
  })

  it('starts in the saved language on the next visit', () => {
    act(() => setLocale('ja'))
    openAt('/login')
    expect(document.title).toBe('ログイン')
    expect(screen.getByRole('link', { name: '新規登録' })).toBeInTheDocument()
  })
})

const AriaLocale: FC = () => <p>{useAriaLocale().locale}</p>

describe('React Aria follows the app locale', () => {
  it('number fields, lists and dates format in the same locale', () => {
    const { rerender } = render(
      <LocaleBoundary locale="en">
        <AriaLocale />
      </LocaleBoundary>
    )
    expect(screen.getByText('en')).toBeInTheDocument()
    rerender(
      <LocaleBoundary locale="ja">
        <AriaLocale />
      </LocaleBoundary>
    )
    expect(screen.getByText('ja')).toBeInTheDocument()
  })
})
