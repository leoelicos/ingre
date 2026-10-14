/* Search normalisation shared by recipe search and the catalogue lookup. */
import { singularise } from '../shopping/shoppingList'

/** Lowercase, trimmed, every word singular: " Tomatoes Chillies " -> "tomato chilli". */
export const normaliseTerm = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word !== '')
    .map(singularise)
    .join(' ')
