/*
 * Every locale the app ships. Adding one is a new file in ./locales plus its line in
 * LOCALES and resources; English is the fallback for any key a locale leaves out.
 */
import en from './locales/en.json'
import ja from './locales/ja.json'

export type Messages = typeof en

export const FALLBACK_LOCALE = 'en'

/** The locales a visitor can pick, each named in its own language (for the selector). */
export const LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' }
] as const

export type Locale = (typeof LOCALES)[number]['code']

/**
 * Messages per locale. Japanese has one plural form ("other"), so it carries only the
 * _other half of each English _one/_other pair; i18next asks Intl.PluralRules which to use.
 */
export const resources: Readonly<
  Record<Locale, { translation: Record<string, unknown> }>
> = {
  en: { translation: en },
  ja: { translation: ja }
}
