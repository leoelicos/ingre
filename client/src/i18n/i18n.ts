/*
 * The one i18next instance. Only files in src/i18n may import i18next or
 * react-i18next (eslint no-restricted-imports), so the library can be swapped later.
 */
import i18next, { type TOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { FALLBACK_LOCALE, resources } from './locales'

const instance = i18next.createInstance()

void instance.use(initReactI18next).init({
  lng: FALLBACK_LOCALE,
  fallbackLng: FALLBACK_LOCALE,
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
export const locale = (): string => instance.language

export { instance as i18n }
