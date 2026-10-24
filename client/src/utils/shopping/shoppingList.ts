/* Shared wording for amounts and names on the list (#182: no packs, real amounts only). */
import { capitaliseFirst } from '../capitaliseFirst'
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

const FRACTIONS: readonly (readonly [number, string])[] = [
  [0.25, '¼'],
  [0.5, '½'],
  [0.75, '¾']
]

/** Two decimals at most: 37.5 -> 37.5, 1/3 -> 0.33. */
export const rounded = (n: number): number => Math.round(n * 100) / 100

/** 0.5 -> "½", 1.25 -> "1¼", 0.3 -> "0.3" (two decimals at most). */
export const fraction = (n: number): string => {
  const value = rounded(n)
  const whole = Math.floor(value)
  const part = rounded(value - whole)
  const glyph = FRACTIONS.find(([v]) => v === part)?.[1]
  return glyph === undefined
    ? String(value)
    : whole === 0
    ? glyph
    : `${whole}${glyph}`
}

/** Irregular or -o/-i nouns used in the catalogue: singular -> plural. */
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

/** Measures written as plain decimals: weights and volumes. */
const DECIMAL_MEASURES: readonly string[] = ['g', 'ml', 'g tin', 'ml tin']

/** Measures that take a plural (spoons never do). */
const COUNTED_MEASURES: readonly string[] = ['cup', 'clove', 'stalk', 'bunch']

/**
 * The unit word after a recipe amount (#182): "g", "tbsp", "cloves", "clove"; empty for
 * whole items, which are just a number.
 */
export const measureWord = (quantity: number, measure: string): string => {
  if (measure === 'whole') return ''
  if (!COUNTED_MEASURES.includes(measure)) return measure
  return quantity === 1 ? measure : pluralise(measure)
}

/** A recipe amount in its own unit (#182): "37.5 g", "½ tbsp", "1½ cloves", "2". */
export const amountText = (quantity: number, measure: string): string => {
  const number = DECIMAL_MEASURES.includes(measure)
    ? String(rounded(quantity))
    : fraction(quantity)
  const word = measureWord(quantity, measure)
  return word === '' ? number : `${number} ${word}`
}

/** Shop section for free-text extras (they have no catalogue category). */
export const FREE_TEXT_SECTION: ShopSection = 'Other'
