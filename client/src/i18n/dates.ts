/* Dates and times in the active locale (t26u, War room history): Intl, never hand-built strings. */
import { locale } from './i18n'

/** "Monday 9 November" in English; the locale decides the order and words. */
export const formatDayName = (at: number): string =>
  new Intl.DateTimeFormat(locale(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(at)

/** "9:41 am" in English, "9:41" in locales that use a 24-hour clock. */
export const formatClock = (at: number): string =>
  new Intl.DateTimeFormat(locale(), {
    hour: 'numeric',
    minute: '2-digit'
  }).format(at)
