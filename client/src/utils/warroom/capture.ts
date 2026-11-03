/*
 * The War room's pure part (#207): what typing or saying "2 carrots, onion and garlic" finds.
 * No ranking rules of our own beyond Explore's: names that start with the text first.
 */
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

/** Ingredients for what has been typed so far; nothing for blank text. */
export const autofill = (
  query: string,
  items: readonly LibraryIngredient[] = catalogue
): LibraryIngredient[] =>
  query.trim() === ''
    ? []
    : ranked(
        items.filter((item) => matchesCapture(item, query)),
        query
      ).slice(0, MAX_MATCHES)

export interface Quantified {
  readonly quantity: number
  readonly term: string
}

const NUMBER_PREFIX = /^\d+\s*(?:x\b\s*)?/i

/** "3 carrots" is 3 of "carrots"; with no number, or 0, it is one. */
export const splitQuantity = (text: string): Quantified => {
  const trimmed = text.trim()
  const prefix = NUMBER_PREFIX.exec(trimmed)
  return {
    quantity: prefix === null ? 1 : Math.max(1, Number.parseInt(prefix[0], 10)),
    term: trimmed.replace(NUMBER_PREFIX, '').trim()
  }
}

export interface Capture extends Quantified {
  /** the best match, or null when nothing in the catalogue fits */
  readonly item: LibraryIngredient | null
}

const SEPARATORS = /,|;|\n|\band\b/i

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
