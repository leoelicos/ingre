/* What Explore shows (#181): browse, ranked matches, or no matches with close ones. */
import Fuse from 'fuse.js'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import { catalogue, library, matchesSearch } from '../library/recipeLibrary'
import { normaliseTerm } from '../library/searchTerms'

/**
 * Ranking tiers: the name starts with the query, then a word in it does, then it contains it.
 * Last: every word matched, but not as one run in the name (split up, or in an ingredient).
 */
export const tierOf = (name: string, query: string): number => {
  const text = normaliseTerm(name)
  const q = normaliseTerm(query)
  if (text.startsWith(q)) return 0
  if (text.split(' ').some((word) => word.startsWith(q))) return 1
  return text.includes(q) ? 2 : 3
}

/** By tier, then alphabetically within a tier. */
export const ranked = <T extends { readonly name: string }>(
  items: readonly T[],
  query: string
): T[] =>
  items
    .map((item) => ({ item, tier: tierOf(item.name, query) }))
    .sort((a, b) => a.tier - b.tier || a.item.name.localeCompare(b.item.name))
    .map(({ item }) => item)

export const alphabetical = <T extends { readonly name: string }>(
  items: readonly T[]
): T[] => [...items].sort((a, b) => a.name.localeCompare(b.name))

/** An ingredient matches when its name holds every word of the query. */
export const ingredientMatches = (
  item: LibraryIngredient,
  query: string
): boolean => {
  const name = normaliseTerm(item.name)
  return normaliseTerm(query)
    .split(' ')
    .every((word) => name.includes(word))
}

/** Close matches by name from Fuse.js with its standard settings: no spelling rules of our own. */
export const closeMatches = <T extends { readonly name: string }>(
  items: readonly T[],
  query: string
): T[] =>
  new Fuse(items, { keys: ['name'] })
    .search(query.trim())
    .map((result) => result.item)

export interface ExploreSource {
  readonly recipes: readonly LibraryRecipe[]
  readonly ingredients: readonly LibraryIngredient[]
  /** Saved filters the recipe results only */
  readonly savedOnly: boolean
  readonly savedIds: ReadonlySet<string>
}

export type ExploreResults =
  | { readonly kind: 'browse'; readonly recipes: readonly LibraryRecipe[] }
  | {
      readonly kind: 'matches'
      readonly ingredients: readonly LibraryIngredient[]
      readonly recipes: readonly LibraryRecipe[]
    }
  | {
      readonly kind: 'none'
      readonly ingredients: readonly LibraryIngredient[]
      readonly recipes: readonly LibraryRecipe[]
      readonly browse: readonly LibraryRecipe[]
    }

export const DEFAULT_SOURCE: Omit<ExploreSource, 'savedOnly' | 'savedIds'> = {
  recipes: library,
  ingredients: catalogue
}

/** The recipes Explore may show: only hearted ones while Saved is on. */
export const shownRecipes = (source: ExploreSource): LibraryRecipe[] =>
  source.recipes.filter(
    (recipe) => !source.savedOnly || source.savedIds.has(recipe.id)
  )

/** Blank: browse every recipe. Typed: ranked matches, or none plus close matches and browse. */
export const exploreResults = (
  query: string,
  source: ExploreSource
): ExploreResults => {
  const recipes = shownRecipes(source)
  const browse = alphabetical(recipes)
  if (normaliseTerm(query) === '') return { kind: 'browse', recipes: browse }
  const ingredients = ranked(
    source.ingredients.filter((item) => ingredientMatches(item, query)),
    query
  )
  const hits = ranked(
    recipes.filter((recipe) =>
      matchesSearch(recipe, { q: query }, source.ingredients)
    ),
    query
  )
  return ingredients.length + hits.length > 0
    ? { kind: 'matches', ingredients, recipes: hits }
    : {
        kind: 'none',
        ingredients: closeMatches(source.ingredients, query),
        recipes: closeMatches(recipes, query),
        browse
      }
}
