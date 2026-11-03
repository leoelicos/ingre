import { useStored } from '../storage/useStored'

/** What the user sets for the risk checks (#220): both optional, kept on this device. */
export interface RiskSettings {
  /** dollars for this shop, or null when not set */
  readonly budget: number | null
  /** free fridge space in litres, or null when not set */
  readonly fridge: number | null
}

export const RISK_SETTINGS_KEY = 'ingre.risks'
export const NO_SETTINGS: RiskSettings = { budget: null, fridge: null }

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** A positive finite number, or null for anything else. */
export const amountOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : null

export const parseRiskSettings = (value: unknown): RiskSettings | null =>
  isRecord(value)
    ? {
        budget: amountOrNull(value['budget']),
        fridge: amountOrNull(value['fridge'])
      }
    : null

/** The settings and a way to change one. */
export const useRiskSettings = (): [
  RiskSettings,
  (change: Partial<RiskSettings>) => void
] => {
  const [settings, update] = useStored(
    RISK_SETTINGS_KEY,
    parseRiskSettings,
    NO_SETTINGS
  )
  return [
    settings,
    (change) => update((previous) => ({ ...previous, ...change }))
  ]
}
