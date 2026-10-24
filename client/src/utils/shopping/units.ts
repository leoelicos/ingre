import type { Amount, BaseUnit, LibraryIngredient } from '../../types/library'
import { formatCount, formatMass } from '../../i18n'
import { amountText, countUnitOf } from './shoppingList'

/** Recipe measures that map directly onto a base unit (Australian spoons/cups). */
const MEASURE_TO_BASE: Readonly<Record<string, Amount>> = {
  g: { amount: 1, unit: 'g' },
  'g tin': { amount: 1, unit: 'g' },
  ml: { amount: 1, unit: 'ml' },
  'ml tin': { amount: 1, unit: 'ml' },
  tsp: { amount: 5, unit: 'ml' },
  tbsp: { amount: 20, unit: 'ml' },
  cup: { amount: 250, unit: 'ml' },
  whole: { amount: 1, unit: 'count' },
  bunch: { amount: 1, unit: 'count' }
}

/** Converts a recipe quantity to a base amount, or null when the measure is unknown for this item. */
export const toBase = (
  quantity: number,
  measure: string,
  item: Pick<LibraryIngredient, 'measureGrams'>
): Amount | null => {
  const direct = MEASURE_TO_BASE[measure]
  if (direct) return { amount: quantity * direct.amount, unit: direct.unit }
  const grams = item.measureGrams?.[measure]
  return grams === undefined ? null : { amount: quantity * grams, unit: 'g' }
}

const isMass = (unit: BaseUnit) => unit === 'g' || unit === 'ml'

/**
 * Converts between base units. g and ml are treated as equal (density 1);
 * counts convert to grams via the item's approxGrams. Returns null when impossible.
 */
export const convert = (
  { amount, unit }: Amount,
  to: BaseUnit,
  item: Pick<LibraryIngredient, 'approxGrams'>
): number | null => {
  if (unit === to || (isMass(unit) && isMass(to))) return amount
  const each = item.approxGrams
  if (each === undefined) return null
  return unit === 'count' ? amount * each : amount / each
}

const round = (n: number) => Math.round(n * 100) / 100

/** What a counted total needs: its unit word, and a part for totals that are not whole. */
export type CountedItem = Pick<
  LibraryIngredient,
  'countUnit' | 'partMeasure' | 'approxGrams' | 'measureGrams'
>

/** A counted amount in parts: garlic 0.3 -> 3 cloves. */
export interface Parts {
  readonly quantity: number
  readonly measure: string
}

/** The amount in the item's parts, or null when it has none. */
export const partsOf = (
  amount: number,
  item: CountedItem | null
): Parts | null => {
  const measure = item?.partMeasure
  const each = item?.approxGrams
  const grams =
    measure === undefined ? undefined : item?.measureGrams?.[measure]
  return measure === undefined || each === undefined || grams === undefined
    ? null
    : { quantity: (amount * each) / grams, measure }
}

/**
 * A counted total (#182): "2 heads", "1½ onions", "3 eggs"; items bought whole but used in
 * parts read in parts until the total is whole: "3 cloves", "13 cloves", "1 head".
 */
export const countText = (amount: number, item: CountedItem | null): string => {
  const parts = partsOf(amount, item)
  return parts === null || Number.isInteger(round(amount))
    ? formatCount(amount, countUnitOf(item))
    : amountText(parts.quantity, parts.measure)
}

/** "3 eggs", "250 g", "1 kg", "1.5 L". */
export const formatAmount = (
  { amount, unit }: Amount,
  item: CountedItem | null = null
): string => {
  return unit === 'count' ? countText(amount, item) : formatMass(amount, unit)
}

/**
 * The unit an item is totalled in (#182): its first sized sold option's unit, else grams.
 * Free text (no item) is counted.
 */
export const itemUnit = (
  item: Pick<LibraryIngredient, 'sold'> | null
): BaseUnit =>
  item === null
    ? 'count'
    : item.sold.find((option) => option.size !== null)?.size?.unit ?? 'g'

/** The recipe measure for an item's unit (#182): counted items are "whole". */
export const unitMeasure = (unit: BaseUnit): string =>
  unit === 'count' ? 'whole' : unit
