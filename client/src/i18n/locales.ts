/*
 * Every locale the app ships. Adding one is a new file in ./locales plus its line here;
 * English is the fallback for any key a locale leaves out.
 */
import en from './locales/en.json'

export type Messages = typeof en

export const FALLBACK_LOCALE = 'en'

export const resources: Readonly<Record<string, { translation: Messages }>> = {
  en: { translation: en }
}
