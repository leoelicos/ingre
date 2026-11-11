/*
 * The one i18next instance. Only files in src/i18n may import i18next or
 * react-i18next (eslint no-restricted-imports), so the library can be swapped later.
 */
import i18next, { type TOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Locale } from './locales'
import { FALLBACK_LOCALE, LOCALES, resources } from './locales'

/** Where the visitor's pick is kept on this device. */
export const LOCALE_KEY = 'ingre.locale'

/** A supported locale for a BCP 47 tag: "ja", "ja-JP" -> "ja"; anything else -> null. */
export const supportedLocale = (tag: unknown): Locale | null =>
  typeof tag === 'string'
    ? LOCALES.find(({ code }) => tag.toLowerCase().split('-')[0] === code)
        ?.code ?? null
    : null

/**
 * The locale to start in: the visitor's saved pick, else the browser's language when the
 * app speaks it (ja* -> ja), else English.
 */
export const initialLocale = (
  storage: Pick<Storage, 'getItem'> = localStorage,
  languages: readonly string[] = navigator.languages ?? [navigator.language]
): Locale =>
  supportedLocale(storage.getItem(LOCALE_KEY)) ??
  supportedLocale(languages[0]) ??
  FALLBACK_LOCALE

const instance = i18next.createInstance()

/** <html lang> follows the locale, so screen readers and :lang(ja) CSS switch with it. */
const syncDocument = (lng: string): void => {
  document.documentElement.lang = lng
}

instance.on('languageChanged', syncDocument)

void instance.use(initReactI18next).init({
  lng: initialLocale(),
  fallbackLng: FALLBACK_LOCALE,
  supportedLngs: LOCALES.map(({ code }) => code),
  resources,
  initAsync: false,
  interpolation: { escapeValue: false }
})

/** Values a message can interpolate, plus `count` for plural keys. */
export type Values = Readonly<Record<string, string | number>>

/** The message for `key` (plural keys pick _one/_other from `count`). */
export const translate = (key: string, values: Values = {}): string =>
  instance.t(key, values)

/** The message for `key`, or `fallback` when no locale has it. */
export const translateOr = (
  key: string,
  fallback: string,
  values: Values = {}
): string => {
  const options: TOptions = { ...values, defaultValue: fallback }
  return instance.t(key, options)
}

/** The active locale, for Intl formatters. */
export const locale = (): Locale => supportedLocale(instance.language) ?? 'en'

/** Switches the app's language now and remembers the pick on this device. */
export const setLocale = (next: Locale): void => {
  localStorage.setItem(LOCALE_KEY, next)
  void instance.changeLanguage(next)
}

export { instance as i18n }
