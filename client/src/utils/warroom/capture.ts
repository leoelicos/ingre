/*
 * The War room's pure part (#207): what typing or saying "2 carrots, onion and garlic" finds.
 * No ranking rules of our own beyond Explore's: names that start with the text first.
 */
import Fuse from 'fuse.js'
import type { LibraryIngredient } from '../../types/library'
import { ranked } from '../explore/exploreSearch'
import { catalogue } from '../library/recipeLibrary'
import { normaliseTerm } from '../library/searchTerms'

/** The autofill shows a few, not a page: the thumb is faster than the eye. */
export const MAX_MATCHES = 6

const holdsEveryWord = (text: string, query: string): boolean => {
  const held = normaliseTerm(text)
  return normaliseTerm(query)
    .split(' ')
    .every((word) => held.includes(word))
}

/** The long name ("thickened cream") or the short one, the id ("cream"), holds every word. */
const matchesCapture = (item: LibraryIngredient, query: string): boolean =>
  holdsEveryWord(item.name, query) ||
  holdsEveryWord(item.id.replaceAll('-', ' '), query)

/**
 * How far a typo may be from a name (Fuse.js score, 0 is exact). Strict on purpose:
 * "brocoli" and "carot" find theirs, "zzzz" finds nothing.
 */
export const TYPO_THRESHOLD = 0.34

/** Names close to a misspelt query, best first; only asked when no name holds every word. */
const typoMatches = (
  items: readonly LibraryIngredient[],
  query: string
): LibraryIngredient[] =>
  new Fuse(items, {
    keys: [
      'name',
      { name: 'words', getFn: (item) => item.id.replaceAll('-', ' ') }
    ],
    threshold: TYPO_THRESHOLD,
    ignoreLocation: true
  })
    .search(query.trim())
    .map((result) => result.item)

/** Ingredients for what has been typed so far, typos forgiven; nothing for blank text. */
export const autofill = (
  query: string,
  items: readonly LibraryIngredient[] = catalogue
): LibraryIngredient[] => {
  if (query.trim() === '') return []
  const held = items.filter((item) => matchesCapture(item, query))
  return (
    held.length > 0 ? ranked(held, query) : typoMatches(items, query)
  ).slice(0, MAX_MATCHES)
}

export interface Quantified {
  readonly quantity: number
  readonly term: string
}

/** Words for what the shop hands over: "2 tins of" is two of them. */
const PACKS =
  'x|packs?|packets?|bags?|tins?|cans?|jars?|bottles?|cartons?|tubs?|tubes?|boxe?s?|bunch(?:es)?|heads?|loaf|loaves|punnets?|trays?|blocks?'

/** Weights and volumes: "500 g flour" is one of flour, the shop sells the size. */
const MEASURES =
  'g|grams?|kg|kilos?|kilograms?|ml|millilitres?|milliliters?|l|litres?|liters?'

/**
 * The quantity at the start: "3", "3x", "2 tins of", "500 g", "a", "a dozen".
 * Groups: 1 the number or a/an, 2 a measure word, 3 dozen.
 */
const LEADING_QUANTITY = new RegExp(
  `^(\\d+(?:[.,]\\d+)?|an?\\b)\\s*(?:(${MEASURES})\\b\\s*|(dozen)\\b\\s*|(?:${PACKS})\\b\\s*)?(?:of\\b\\s*)?`,
  'i'
)

/** "carrots x3" and "carrots ×3": a count after the name. */
const TRAILING_QUANTITY = /\s*[x×]\s*(\d+)$/i

const countOf = (prefix: RegExpExecArray): number => {
  const [, number, measure, dozen] = prefix
  if (measure !== undefined) return 1
  const n = /^an?$/i.test(String(number))
    ? 1
    : Number.parseInt(String(number), 10)
  return Math.max(1, dozen === undefined ? n : n * 12)
}

/** The leading quantity of trimmed text, unless it is all there is ("a" is the start of "avocado"). */
export const leadingQuantity = (trimmed: string): RegExpExecArray | null => {
  const prefix = LEADING_QUANTITY.exec(trimmed)
  return prefix !== null && prefix[0].length < trimmed.length ? prefix : null
}

/**
 * "3 carrots" is 3 of "carrots", and so are "3x carrots", "carrots x3" and "3 bags of carrots";
 * "a dozen eggs" is 12. A weight or volume ("500 g flour") is one. No number, or 0, is one.
 */
export const splitQuantity = (text: string): Quantified => {
  const trimmed = text.trim()
  const prefix = leadingQuantity(trimmed)
  const rest = prefix === null ? trimmed : trimmed.slice(prefix[0].length)
  const trailing = prefix === null ? TRAILING_QUANTITY.exec(rest) : null
  if (trailing !== null) {
    return {
      quantity: Math.max(1, Number.parseInt(String(trailing[1]), 10)),
      term: rest.slice(0, trailing.index).trim()
    }
  }
  return {
    quantity: prefix === null ? 1 : countOf(prefix),
    term: rest.trim()
  }
}

export interface Capture extends Quantified {
  /** the best match, or null when nothing in the catalogue fits */
  readonly item: LibraryIngredient | null
}

/** Between things: commas, semicolons, new lines and "and". */
export const SEPARATORS = /,|;|\n|\band\b/i

/** Each thing in a line or a spoken sentence, with its best ingredient. */
export const captureOf = (
  text: string,
  items: readonly LibraryIngredient[] = catalogue
): Capture[] =>
  text
    .split(SEPARATORS)
    .map(splitQuantity)
    .filter(({ term }) => term !== '')
    .map((found) => ({
      ...found,
      item: autofill(found.term, items)[0] ?? null
    }))
