/* Alias search (#239): one primary name is shown; aliases are only ever searched. */
import { normaliseTerm } from './searchTerms'

/** What an item can be found by. */
export interface Named {
  readonly name: string
  readonly aliases?: readonly string[] | undefined
}

/** The name first, then its aliases. */
export const namesOf = (item: Named): string[] => [
  item.name,
  ...(item.aliases ?? [])
]

/** True when `text` holds every word of `query` (both normalised). */
export const holdsEveryWord = (text: string, query: string): boolean => {
  const held = normaliseTerm(text)
  return normaliseTerm(query)
    .split(' ')
    .every((word) => held.includes(word))
}

/** The alias the query matched, when the name itself does not match: what to say "also called". */
export const matchedAlias = (item: Named, query: string): string | null =>
  holdsEveryWord(item.name, query)
    ? null
    : (item.aliases ?? []).find((alias) => holdsEveryWord(alias, query)) ?? null
