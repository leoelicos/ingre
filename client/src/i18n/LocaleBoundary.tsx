/*
 * React Aria's own locale (number fields, date and list formatting, RTL) follows the app's.
 * Wrap the app once; the parent re-renders on a switch through useLocale().
 */
import type { FC, ReactNode } from 'react'
import { I18nProvider } from 'react-aria-components'
import type { Locale } from './locales'

export const LocaleBoundary: FC<{ locale: Locale; children: ReactNode }> = ({
  locale,
  children
}) => <I18nProvider locale={locale}>{children}</I18nProvider>
