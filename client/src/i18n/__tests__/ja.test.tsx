/* Japanese (ja): the start locale, switching at run time, <html lang>, and Japanese amounts. */
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { FC } from 'react'
import { useRef } from 'react'
import {
  LOCALE_KEY,
  formatCount,
  formatItemCount,
  formatMass,
  formatMoney,
  formatQuantity,
  formatRecipeCount,
  setLocale,
  translate,
  useLocale,
  useT
} from '..'
import { i18n, initialLocale, locale, supportedLocale } from '../i18n'

const storageWith = (value: string | null) => ({ getItem: () => value })

describe('the locale the app starts in', () => {
  it('is the saved pick first', () => {
    expect(initialLocale(storageWith('ja'), ['en-AU'])).toBe('ja')
    expect(initialLocale(storageWith('en'), ['ja-JP'])).toBe('en')
  })

  it('else the browser’s language when the app speaks it: ja* -> ja', () => {
    expect(initialLocale(storageWith(null), ['ja-JP', 'en'])).toBe('ja')
    expect(initialLocale(storageWith(null), ['JA'])).toBe('ja')
    expect(initialLocale(storageWith('klingon'), ['ja'])).toBe('ja')
  })

  it('else English', () => {
    expect(initialLocale(storageWith(null), ['fr-FR'])).toBe('en')
    expect(initialLocale(storageWith(null), [])).toBe('en')
  })

  it('reads this device and this browser by default (jsdom: en-US)', () => {
    localStorage.clear()
    expect(initialLocale()).toBe('en')
    localStorage.setItem(LOCALE_KEY, 'ja')
    expect(initialLocale()).toBe('ja')
    localStorage.clear()
  })

  it('falls back to navigator.language when navigator.languages is missing', () => {
    const spy = jest
      .spyOn(navigator, 'languages', 'get')
      .mockReturnValue(undefined as unknown as readonly string[])
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('ja-JP')
    expect(initialLocale(storageWith(null))).toBe('ja')
    spy.mockRestore()
  })

  it('only names a supported locale', () => {
    expect(supportedLocale('ja-JP')).toBe('ja')
    expect(supportedLocale('en-AU')).toBe('en')
    expect(supportedLocale('fr')).toBeNull()
    expect(supportedLocale(null)).toBeNull()
  })
})

describe('switching to Japanese', () => {
  afterEach(() => {
    act(() => setLocale('en'))
    localStorage.clear()
  })

  it('switches messages, <html lang> and the Intl locale, and remembers the pick', () => {
    expect(document.documentElement.lang).toBe('en')
    act(() => setLocale('ja'))
    expect(locale()).toBe('ja')
    expect(document.documentElement.lang).toBe('ja')
    expect(localStorage.getItem(LOCALE_KEY)).toBe('ja')
    expect(translate('nav.explore')).toBe('さがす')
    act(() => setLocale('en'))
    expect(document.documentElement.lang).toBe('en')
    expect(translate('nav.explore')).toBe('Explore')
  })

  it('an unsupported language reads as English to the formatters', () => {
    act(() => {
      void i18n.changeLanguage('fr')
    })
    expect(locale()).toBe('en')
    const replaced = jest.replaceProperty(i18n, 'language', 'fr')
    expect(locale()).toBe('en')
    replaced.restore()
  })

  it('writes spoons and cups before the number, as Japanese recipes do', () => {
    act(() => setLocale('ja'))
    expect(formatQuantity(1, 'tbsp')).toBe('大さじ1')
    expect(formatQuantity(0.5, 'tsp')).toBe('小さじ½')
    expect(formatQuantity(1.5, 'cup')).toBe('カップ1½')
    expect(formatQuantity(2, 'clove')).toBe('2かけ')
    expect(formatQuantity(1, 'bunch')).toBe('1束')
    expect(formatQuantity(400, 'g tin')).toBe('400g缶')
  })

  it('keeps g, kg, ml and L, with no space', () => {
    act(() => setLocale('ja'))
    expect(formatQuantity(250, 'g')).toBe('250g')
    expect(formatMass(1500, 'g')).toBe('1.5kg')
    expect(formatMass(2000, 'ml')).toBe('2L')
  })

  it('counts with one counter whatever the amount (Japanese has no plural)', () => {
    act(() => setLocale('ja'))
    const egg = { one: 'egg', other: 'eggs' }
    expect(formatCount(1, egg)).toBe('1個')
    expect(formatCount(3, egg)).toBe('3個')
    expect(formatQuantity(2, 'whole', egg)).toBe('2個')
    expect(formatItemCount(0)).toBe('0個')
    expect(formatRecipeCount(1)).toBe('1件のレシピ')
    expect(formatRecipeCount(2)).toBe('2件のレシピ')
    expect(translate('profile.savedCount', { count: 1 })).toBe(
      '保存したレシピ：1件'
    )
    expect(formatMoney(2)).toBe('$2.00')
  })

  it('English amounts read as before', () => {
    expect(formatQuantity(1, 'tbsp')).toBe('1 tbsp')
    expect(formatQuantity(2, 'cup')).toBe('2 cups')
    expect(formatRecipeCount(2)).toBe('2 recipes')
  })
})

const Probe: FC = () => {
  const t = useT()
  const [current, change] = useLocale()
  const first = useRef(t)
  return (
    <>
      <p>{t('nav.explore')}</p>
      <p>{`locale ${current}`}</p>
      <p>{`same t ${String(first.current === t)}`}</p>
      <button onClick={() => change(current === 'en' ? 'ja' : 'en')}>
        switch
      </button>
    </>
  )
}

describe('components follow a switch at once', () => {
  afterEach(() => {
    act(() => setLocale('en'))
    localStorage.clear()
  })

  it('re-render in the new language, with a new translate function', async () => {
    render(<Probe />)
    expect(screen.getByText('Explore')).toBeTruthy()
    expect(screen.getByText('locale en')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'switch' }))
    expect(screen.getByText('さがす')).toBeTruthy()
    expect(screen.getByText('locale ja')).toBeTruthy()
    expect(screen.getByText('same t false')).toBeTruthy()
  })

  it('keep the same translate function while the language stays', async () => {
    const { rerender } = render(<Probe />)
    rerender(<Probe />)
    expect(screen.getByText('same t true')).toBeTruthy()
  })
})
