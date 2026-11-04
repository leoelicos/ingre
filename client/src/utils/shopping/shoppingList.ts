/* Shared wording for amounts and names on the list (#182: no packs, real amounts only). */
import {
  formatCountUnit,
  formatFraction,
  formatItemUnit,
  formatMeasure,
  formatQuantity,
  rounded as roundedNumber
} from '../../i18n'
import { capitaliseFirst } from '../capitaliseFirst'
import type { CountUnit, LibraryIngredient } from '../../types/library'
import type { ShopSection } from './sections'

/** Generic grouping: groups in `order`, then unknown keys alphabetically; item order kept. */
export const groupBy = <T, K extends string>(
  items: readonly T[],
  keyOf: (item: T) => K,
  order: readonly K[] = []
): { key: K; items: T[] }[] => {
  const keys = [...new Set(items.map(keyOf))]
  const rank = (k: K) => {
    const i = order.indexOf(k)
    return i === -1 ? order.length : i
  }
  return keys
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    .map((key) => ({ key, items: items.filter((i) => keyOf(i) === key) }))
}

/** Display name: "Brown onion". */
export const displayName = ({ name }: { readonly name: string }) =>
  capitaliseFirst(name)

/** Two decimals at most: 37.5 -> 37.5, 1/3 -> 0.33. */
export const rounded = roundedNumber

/** 0.5 -> "½", 1.25 -> "1¼", 0.3 -> "0.3" (two decimals at most). */
export const fraction = (n: number): string => formatFraction(n)

/**
 * Irregular or -o/-i nouns used in the catalogue: singular -> plural. English search only
 * (searchTerms): words shown to the user come from the locale (src/i18n).
 */
export const IRREGULAR_PLURALS: Readonly<Record<string, string>> = {
  leaf: 'leaves',
  chilli: 'chillies',
  potato: 'potatoes',
  tomato: 'tomatoes',
  egg: 'eggs'
}
const SINGULARS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(IRREGULAR_PLURALS).map(([one, many]) => [many, one])
)

/** Ends in a plural -s (not -ss or -us, e.g. "glass", "hummus"). */
const looksPlural = (word: string) => /[^su]s$/.test(word)

/** Applies `fn` to the last word of a phrase ("red chilli" -> "red chillies"). */
const onLastWord = (phrase: string, fn: (word: string) => string): string => {
  const i = phrase.lastIndexOf(' ') + 1
  return phrase.slice(0, i) + fn(phrase.slice(i))
}

/** Plural, never doubled: egg -> eggs, eggs -> eggs, leaf -> leaves, bunch -> bunches. */
export const pluralise = (phrase: string): string =>
  onLastWord(
    phrase,
    (word) =>
      IRREGULAR_PLURALS[word] ??
      (SINGULARS[word] !== undefined || looksPlural(word)
        ? word
        : /(s|x|ch|sh)$/.test(word)
        ? `${word}es`
        : /[^aeiou]y$/.test(word)
        ? `${word.slice(0, -1)}ies`
        : `${word}s`)
  )

/** Singular for catalogue names given in the plural: eggs -> egg, tomatoes -> tomato. */
export const singularise = (phrase: string): string =>
  onLastWord(
    phrase,
    (word) => SINGULARS[word] ?? (looksPlural(word) ? word.slice(0, -1) : word)
  )

/** What a counted item needs for its unit word. */
export type CountItem = Pick<LibraryIngredient, 'countUnit'>

/** The unit word of free text (#182): counted things are never a bare number. */
export const GENERIC_COUNT_UNIT: CountUnit = {
  one: formatItemUnit(1),
  other: formatItemUnit(2)
}

/** A counted item's unit: its own ("head", "eggs"), else the generic one. */
export const countUnitOf = (item: CountItem | null): CountUnit =>
  item?.countUnit ?? GENERIC_COUNT_UNIT

/** A counted item's unit word for an amount (#182): "1 head", "2 heads", "3 eggs". */
export const countWord = (quantity: number, item: CountItem | null): string =>
  formatCountUnit(quantity, countUnitOf(item))

/**
 * The unit word after a recipe amount (#182): "g", "tbsp", "cloves", "½ clove"; whole items
 * take the item's own unit ("2 onions", "1 head"). Up to 1 is singular.
 */
export const measureWord = (
  quantity: number,
  measure: string,
  item: CountItem | null = null
): string =>
  measure === 'whole'
    ? countWord(quantity, item)
    : formatMeasure(quantity, measure)

/** A recipe amount in its own unit (#182): "37.5 g", "½ tbsp", "1½ cloves", "2 onions". */
export const amountText = (
  quantity: number,
  measure: string,
  item: CountItem | null = null
): string => formatQuantity(quantity, measure, countUnitOf(item))

/** Shop section for free-text extras (they have no catalogue category). */
export const FREE_TEXT_SECTION: ShopSection = 'Other'
