/* The app's i18n API: import from here, never from i18next or react-i18next. */
export { LOCALE_KEY, setLocale, translate } from './i18n'
export type { Values } from './i18n'
export { LOCALES } from './locales'
export type { Locale } from './locales'
export { useLocale, useT } from './useT'
export type { Translate } from './useT'
export { RichText, richParts } from './rich'
export type { Renderers } from './rich'
export { LocaleBoundary } from './LocaleBoundary'
export {
  formatCount,
  formatCountUnit,
  formatFraction,
  formatItemCount,
  formatItemUnit,
  formatMass,
  formatMoney,
  formatMeasure,
  formatNumber,
  formatQuantity,
  formatRecipeCount,
  pluralCount,
  rounded
} from './format'
