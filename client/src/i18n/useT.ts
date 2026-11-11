/* Components translate through this, never react-i18next directly. */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Values } from './i18n'
import type { Locale } from './locales'
import { locale, setLocale } from './i18n'

/** A translate function: the message for a key, with its values filled in. */
export type Translate = (key: string, values?: Values) => string

/**
 * The active locale's translate function, for components; re-renders when it changes.
 * The function is the same between renders until the language changes, so it can be an
 * effect dependency (page titles re-run on a switch).
 */
export const useT = (): Translate => {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  return useMemo<Translate>(
    () =>
      (key, values = {}) =>
        t(key, { ...values, lng: language }),
    [t, language]
  )
}

/** The active locale and a setter; the component re-renders on every switch. */
export const useLocale = (): readonly [Locale, (next: Locale) => void] => {
  useTranslation()
  return [locale(), setLocale]
}
