/* Looks a search term up in the catalogue, for the empty-search state. */
import type { LibraryIngredient } from '../../types/library'
import { normaliseTerm } from './searchTerms'

export type CatalogueMatch =
  | { kind: 'matched'; item: LibraryIngredient }
  | { kind: 'unmatched'; text: string }

/** Matches on the catalogue name, ignoring case and plurals. */
export const matchCatalogue = (
  query: string,
  items: readonly LibraryIngredient[]
): CatalogueMatch => {
  const text = query.trim()
  const term = normaliseTerm(text)
  const item = items.find((i) => normaliseTerm(i.name) === term)
  return item === undefined
    ? { kind: 'unmatched', text }
    : { kind: 'matched', item }
}
