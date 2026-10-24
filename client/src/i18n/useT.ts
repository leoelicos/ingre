/* Components translate through this, never react-i18next directly. */
import { useTranslation } from 'react-i18next'
import type { Values } from './i18n'

/** A translate function: the message for a key, with its values filled in. */
export type Translate = (key: string, values?: Values) => string

/** The active locale's translate function, for components; re-renders when it changes. */
export const useT = (): Translate => {
  const { t } = useTranslation()
  return (key, values = {}) => t(key, { ...values })
}
