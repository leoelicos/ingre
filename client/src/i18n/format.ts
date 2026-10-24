/*
 * Plural and unit formatting. Unit words come from the locale's _one/_other keys,
 * which i18next picks with Intl.PluralRules; numbers go through Intl.NumberFormat.
 */
import type { CountUnit } from '../types/library'
import { locale, translate, translateOr } from './i18n'

/** Two decimals at most: 37.5 -> 37.5, 1/3 -> 0.33. */
export const rounded = (n: number): number => Math.round(n * 100) / 100

/** A plain decimal, two places at most and no grouping: 37.5 -> "37.5", 1250 -> "1250". */
export const formatNumber = (n: number): string =>
  new Intl.NumberFormat(locale(), {
    maximumFractionDigits: 2,
    useGrouping: false
  }).format(rounded(n) + 0)

const FRACTIONS: readonly (readonly [number, string])[] = [
  [0.25, '¼'],
  [0.5, '½'],
  [0.75, '¾']
]

/** Quarters as glyphs, else a plain decimal: 0.5 -> "½", 1.25 -> "1¼", 0.3 -> "0.3". */
export const formatFraction = (n: number): string => {
  const value = rounded(n)
  const whole = Math.floor(value)
  const glyph = FRACTIONS.find(([v]) => v === rounded(value - whole))?.[1]
  return glyph === undefined
    ? formatNumber(value)
    : whole === 0
    ? glyph
    : `${formatNumber(whole)}${glyph}`
}

/**
 * The count a unit word is chosen by. Owner decision (#182): an amount up to 1 reads
 * singular ("½ clove", "1 head"), so (0, 1] counts as 1; anything else is the amount
 * itself and goes through the locale's plural rules (0 -> "items", 1.5 -> "onions").
 */
export const pluralCount = (quantity: number): number => {
  const value = rounded(quantity)
  return value > 0 && value <= 1 ? 1 : value
}

/** The generic unit of counted things with no unit of their own: "item", "items". */
export const formatItemUnit = (quantity: number): string =>
  translate('item', { count: pluralCount(quantity) })

/**
 * A counted item's unit word (#182): its own ("head", "heads"), else the generic one.
 * "1 head", "½ clove", "2 tomatoes", "0 items".
 */
export const formatCountUnit = (
  quantity: number,
  unit: CountUnit | null
): string =>
  unit === null
    ? formatItemUnit(quantity)
    : translate('countUnit', {
        count: pluralCount(quantity),
        one: unit.one,
        other: unit.other
      })

/** "a number and its unit word": "2 cloves", "250 g". */
const joinQuantity = (number: string, unit: string): string =>
  translate('quantity', { number, unit })

/** Measures written as plain decimals: weights and volumes. */
const DECIMAL_MEASURES: readonly string[] = ['g', 'ml', 'g tin', 'ml tin']

/**
 * A recipe measure's word: "g" and "tbsp" never pluralise, "cup"/"cups",
 * "clove"/"cloves"; a measure the locale does not know is shown as written.
 */
export const formatMeasure = (quantity: number, measure: string): string =>
  translateOr(`measure.${measure}`, measure, { count: pluralCount(quantity) })

/**
 * A recipe amount in its own unit (#182): "37.5 g", "½ tbsp", "1½ cloves", "2 onions";
 * "whole" takes the item's count unit.
 */
export const formatQuantity = (
  quantity: number,
  measure: string,
  unit: CountUnit | null = null
): string =>
  joinQuantity(
    DECIMAL_MEASURES.includes(measure)
      ? formatNumber(quantity)
      : formatFraction(quantity),
    measure === 'whole'
      ? formatCountUnit(quantity, unit)
      : formatMeasure(quantity, measure)
  )

/** A counted amount: "3 eggs", "1½ onions", "1 item". */
export const formatCount = (quantity: number, unit: CountUnit | null): string =>
  joinQuantity(formatFraction(quantity), formatCountUnit(quantity, unit))

const BIG_UNIT: Readonly<Record<'g' | 'ml', string>> = { g: 'kg', ml: 'L' }

/** An abbreviation that never pluralises: "g", "kg", "ml", "L". */
const abbreviation = (unit: string): string => translate(`measure.${unit}`)

/** A weight or volume, never pluralised: "250 g", "1 kg", "1.5 L". */
export const formatMass = (amount: number, unit: 'g' | 'ml'): string =>
  amount >= 1000
    ? joinQuantity(formatNumber(amount / 1000), abbreviation(BIG_UNIT[unit]))
    : joinQuantity(formatNumber(amount), abbreviation(unit))

/** "2 recipes", "1 recipe". */
export const formatRecipeCount = (n: number): string =>
  joinQuantity(formatNumber(n), translate('recipe', { count: n }))

/** "2 items", "1 item". */
export const formatItemCount = (n: number): string =>
  joinQuantity(formatNumber(n), formatItemUnit(n))
