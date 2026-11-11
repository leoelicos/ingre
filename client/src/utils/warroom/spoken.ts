/*
 * What a recogniser writes is not what people type (#207): "Two carrots, onion and garlic."
 * has a word for the number and a full stop, and "a litre of milk" has words around the
 * ingredient. This turns speech into the War room's typed form, then lets a phrase that finds
 * nothing as a whole find its last words ("milk").
 */
import type { LibraryIngredient } from '../../types/library'
import { catalogue } from '../library/recipeLibrary'
import type { Capture } from './capture'
import { autofill, captureOf } from './capture'

/** Spoken amounts at the start of a phrase, longest first so "half a dozen" wins over "a dozen". */
const AMOUNTS: ReadonlyArray<readonly [string, number]> = [
  ['half a dozen', 6],
  ['a couple of', 2],
  ['a dozen', 12],
  ['one', 1],
  ['two', 2],
  ['three', 3],
  ['four', 4],
  ['five', 5],
  ['six', 6],
  ['seven', 7],
  ['eight', 8],
  ['nine', 9],
  ['ten', 10],
  ['eleven', 11],
  ['twelve', 12],
  ['dozen', 12]
]

const withDigits = (phrase: string): string => {
  const trimmed = phrase.trim()
  const lower = trimmed.toLowerCase()
  const amount = AMOUNTS.find(([words]) => lower.startsWith(`${words} `))
  return amount === undefined
    ? trimmed
    : `${amount[1]} ${trimmed.slice(amount[0].length + 1)}`
}

/** Words recognisers write for a grocery word that sounds the same. */
const SOUNDS_LIKE = /\bflowers?\b/gi

/** Sentence marks become separators, spoken numbers digits, and "flower" flour. */
export const typedFromSpoken = (text: string): string =>
  text
    .replace(SOUNDS_LIKE, 'flour')
    .split(/[.!?,;。、]+/)
    .map(withDigits)
    .filter((phrase) => phrase !== '')
    .join(', ')

/** The shortest tail of the words that names an ingredient, or null. */
const lastWordsMatch = (
  term: string,
  items: readonly LibraryIngredient[]
): LibraryIngredient | null => {
  const words = term.split(/\s+/)
  for (let start = 1; start < words.length; start += 1) {
    const found = autofill(words.slice(start).join(' '), items)[0]
    if (found !== undefined) return found
  }
  return null
}

/** Each thing in a spoken sentence, with its best ingredient. */
export const captureSpoken = (
  text: string,
  items: readonly LibraryIngredient[] = catalogue
): Capture[] =>
  captureOf(typedFromSpoken(text), items).map((capture) =>
    capture.item === null
      ? { ...capture, item: lastWordsMatch(capture.term, items) }
      : capture
  )
