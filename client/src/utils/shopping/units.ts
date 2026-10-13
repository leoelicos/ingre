import type { Amount, BaseUnit, LibraryIngredient } from '../../types/library'

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

const BIG_UNIT: Readonly<Record<'g' | 'ml', string>> = { g: 'kg', ml: 'L' }

/** "1.5", "250 g", "1 kg", "1.5 L". */
export const formatAmount = ({ amount, unit }: Amount): string => {
  if (unit === 'count') return `${round(amount)}`
  return amount >= 1000
    ? `${round(amount / 1000)} ${BIG_UNIT[unit]}`
    : `${round(amount)} ${unit}`
}
