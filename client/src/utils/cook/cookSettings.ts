import { useStored } from '../storage/useStored'
import { parseDay } from './cook'

/** What the cook sets for the plan (#221): all optional, kept on this device. */
export interface CookSettings {
  /** the day of cooking as "YYYY-MM-DD", or null when not set */
  readonly day: string | null
  /** allergens, lowercased, that someone eating must not have */
  readonly avoid: readonly string[]
  /** where and when the kitchen is booked, free text */
  readonly kitchen: string
}

export const COOK_SETTINGS_KEY = 'ingre.cook'
export const NO_COOK_SETTINGS: CookSettings = {
  day: null,
  avoid: [],
  kitchen: ''
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const wordsOf = (value: unknown): string[] =>
  Array.isArray(value)
    ? [...new Set(value.filter((v): v is string => typeof v === 'string'))]
    : []

export const parseCookSettings = (value: unknown): CookSettings | null =>
  isRecord(value)
    ? {
        day: parseDay(value['day']),
        avoid: wordsOf(value['avoid']),
        kitchen: typeof value['kitchen'] === 'string' ? value['kitchen'] : ''
      }
    : null

/** The settings and a way to change some of them. */
export const useCookSettings = (): [
  CookSettings,
  (change: Partial<CookSettings>) => void
] => {
  const [settings, update] = useStored(
    COOK_SETTINGS_KEY,
    parseCookSettings,
    NO_COOK_SETTINGS
  )
  return [
    settings,
    (change) => update((previous) => ({ ...previous, ...change }))
  ]
}
