import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import { catalogue, library } from '../../utils/library/recipeLibrary'
import { placeInShop } from '../../utils/shopping/sections'
import { displayName } from '../../utils/shopping/shoppingList'
import { splitTitle } from '../Widgets/RecipeCard/recipeCardHelpers'

/** One autocomplete option in the header search. */
export interface Suggestion {
  readonly id: string
  /** what the search box is filled with when the option is accepted */
  readonly name: string
  /** the quiet second line: "Recipe" or the ingredient's shop section */
  readonly detail: string
  /** where choosing it goes: the recipe page, or the list searched for the ingredient */
  readonly path: string
}

export const MAX_SUGGESTIONS = 6

/** Lower-case words of a query; none for blank text. */
export const queryWords = (query: string): string[] =>
  query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word !== '')

/** True when the name contains every word. */
export const hasEveryWord = (name: string, words: readonly string[]): boolean =>
  words.every((word) => name.toLowerCase().includes(word))

/** Where a search goes: the list, filtered by the text (or unfiltered when blank). */
export const searchPath = (text: string): string => {
  const q = text.trim()
  return q === '' ? '/' : `/?q=${encodeURIComponent(q)}`
}

const recipeSuggestion = (recipe: LibraryRecipe): Suggestion => ({
  id: `recipe:${recipe.id}`,
  name: splitTitle(recipe.name).title,
  detail: 'Recipe',
  path: `/recipe/${recipe.id}`
})

const ingredientSuggestion = (item: LibraryIngredient): Suggestion => ({
  id: `ingredient:${item.id}`,
  name: displayName(item),
  detail: placeInShop(item.category).section,
  path: searchPath(item.name)
})

/** Recipes first, then catalogue ingredients, whose names hold every typed word. */
export const searchSuggestions = (
  query: string,
  recipes: readonly LibraryRecipe[] = library,
  items: readonly LibraryIngredient[] = catalogue
): Suggestion[] => {
  const words = queryWords(query)
  return words.length === 0
    ? []
    : [
        ...recipes
          .filter((recipe) => hasEveryWord(recipe.name, words))
          .map(recipeSuggestion),
        ...items
          .filter((item) => hasEveryWord(item.name, words))
          .map(ingredientSuggestion)
      ].slice(0, MAX_SUGGESTIONS)
}

/** Suggestions to show: none once the current text is the one just accepted with Tab. */
export const visibleSuggestions = (
  text: string,
  accepted: string | null
): Suggestion[] => (text === accepted ? [] : searchSuggestions(text))

/**
 * The option Tab accepts: the highlighted one, else the first. Null when the key is not a plain
 * Tab or the list is closed, so Shift+Tab and a second Tab move focus as normal (no trap).
 */
export const tabAcceptance = (
  key: string,
  shiftKey: boolean,
  isOpen: boolean,
  focusedKey: string | number | null,
  suggestions: readonly Suggestion[]
): Suggestion | null =>
  key !== 'Tab' || shiftKey || !isOpen
    ? null
    : suggestions.find((s) => s.id === focusedKey) ?? suggestions[0] ?? null
