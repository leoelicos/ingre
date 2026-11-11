/* The app's i18n API: import from here, never from i18next or react-i18next. */
export { locale, translate } from './i18n'
export type { Values } from './i18n'
export { useT } from './useT'
export { formatClock, formatDayName } from './dates'
export type { Translate } from './useT'
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
