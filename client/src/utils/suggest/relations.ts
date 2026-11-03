/*
 * The fixed set of relations every ingredient exposes (#205): its shop section, what goes
 * with it, the recipes that use it, and suggestions with what is missing and the cost.
 * The same for every ingredient, whatever the mode; only how proactively it is shown differs.
 */
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import { catalogue, library } from '../library/recipeLibrary'
import { placeInShop } from '../shopping/sections'
import type { ShopSection } from '../shopping/sections'
import type { Prices, Suggestion } from './suggest'
import { PRICES, suggestionsFor } from './suggest'

/** The page shows the few best pairings. */
export const MAX_COMPLEMENTS = 5

/** What an ingredient relates to. Every field is always there; a relation can be empty. */
export interface Relations {
  readonly section: ShopSection
  /** other ingredients cooked with it, most shared recipes first */
  readonly complements: readonly LibraryIngredient[]
  /** the recipes that use it */
  readonly recipes: readonly LibraryRecipe[]
  /** up to three, each with what is missing and the cost */
  readonly suggestions: readonly Suggestion[]
}

const usesIngredient = (recipe: LibraryRecipe, id: string): boolean =>
  recipe.ingredients.some(({ ingredientId }) => ingredientId === id)

/** How many recipes each ingredient shares with `id`, in the order first met. */
const sharedCounts = (
  id: string,
  recipes: readonly LibraryRecipe[]
): Map<string, number> =>
  recipes
    .filter((recipe) => usesIngredient(recipe, id))
    .flatMap((recipe) => recipe.ingredients.map((line) => line.ingredientId))
    .filter((other) => other !== id)
    .reduce(
      (counts, other) => counts.set(other, (counts.get(other) ?? 0) + 1),
      new Map<string, number>()
    )

/** The ingredient with how many recipes it shares, or nothing when it is a staple or shares none. */
const sharing = (
  item: LibraryIngredient,
  counts: ReadonlyMap<string, number>
): { item: LibraryIngredient; shared: number }[] => {
  const shared = counts.get(item.id)
  return item.staple === true || shared === undefined ? [] : [{ item, shared }]
}

/** The ingredients most often cooked with `id`: never a pantry staple, never itself. */
export const complementsOf = (
  id: string,
  recipes: readonly LibraryRecipe[],
  items: readonly LibraryIngredient[]
): LibraryIngredient[] => {
  const counts = sharedCounts(id, recipes)
  return items
    .flatMap((item) => sharing(item, counts))
    .sort(
      (a, b) => b.shared - a.shared || a.item.name.localeCompare(b.item.name)
    )
    .slice(0, MAX_COMPLEMENTS)
    .map(({ item }) => item)
}

export const relationsOf = (
  item: LibraryIngredient,
  recipes: readonly LibraryRecipe[],
  items: readonly LibraryIngredient[],
  prices: Prices
): Relations => ({
  section: placeInShop(item.category).section,
  complements: complementsOf(item.id, recipes, items),
  recipes: recipes.filter((recipe) => usesIngredient(recipe, item.id)),
  suggestions: suggestionsFor(new Set([item.id]), recipes, items, prices)
})

/** The relations from the bundled library, catalogue and prices. */
export const bundledRelations = (item: LibraryIngredient): Relations =>
  relationsOf(item, library, catalogue, PRICES)
