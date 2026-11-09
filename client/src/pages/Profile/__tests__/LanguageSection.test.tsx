/* The language picker (ja): labelled, each option in its own language, keyboard only. */
import '@testing-library/jest-dom'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { LOCALE_KEY, setLocale } from '../../../i18n'
import { LanguageSection, pickLocale } from '../LanguageSection'

expect.extend(toHaveNoViolations)

describe('Language section', () => {
  afterEach(() => {
    act(() => setLocale('en'))
    localStorage.clear()
  })

  it('is a labelled region with a labelled, described radio group', () => {
    render(<LanguageSection />)
    const region = screen.getByRole('region', { name: 'Language' })
    const group = within(region).getByRole('radiogroup', { name: 'Language' })
    expect(group).toHaveAccessibleDescription(
      'Changes the words in the app. Recipe and ingredient names stay in English for now.'
    )
    expect(within(group).getByRole('radio', { name: 'English' })).toBeChecked()
    expect(
      within(group).getByRole('radio', { name: '日本語' })
    ).not.toBeChecked()
  })

  it('names each option in its own language, marked with lang', () => {
    render(<LanguageSection />)
    expect(screen.getByText('English')).toHaveAttribute('lang', 'en')
    expect(screen.getByText('日本語')).toHaveAttribute('lang', 'ja')
  })

  it('has no axe violations, in English and in Japanese', async () => {
    const { container } = render(<LanguageSection />)
    expect(await axe(container)).toHaveNoViolations()
    act(() => setLocale('ja'))
    expect(await axe(container)).toHaveNoViolations()
  })

  it('switches by keyboard alone: Tab to the group, arrow to 日本語', async () => {
    const user = userEvent.setup()
    render(<LanguageSection />)
    await user.tab()
    expect(screen.getByRole('radio', { name: 'English' })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    const japanese = screen.getByRole('radio', { name: '日本語' })
    expect(japanese).toBeChecked()
    expect(japanese).toHaveFocus()
    expect(document.documentElement.lang).toBe('ja')
    expect(localStorage.getItem(LOCALE_KEY)).toBe('ja')
    expect(
      screen.getByRole('radiogroup', { name: '言語' })
    ).toHaveAccessibleDescription(
      'アプリの表示言語を変更します。レシピ名と食材名は、現在は英語のままです。'
    )
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked()
    expect(document.documentElement.lang).toBe('en')
  })

  it('switches by pointer too', async () => {
    render(<LanguageSection />)
    await userEvent.click(screen.getByText('日本語'))
    expect(screen.getByRole('heading', { name: '言語' })).toBeInTheDocument()
  })

  it('ignores a value that is not a locale', () => {
    expect(pickLocale('ja', 'en')).toBe('ja')
    expect(pickLocale('fr', 'en')).toBe('en')
  })
})
