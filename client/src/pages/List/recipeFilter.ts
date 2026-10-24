import type { LibraryRecipe } from '../../types/library'
import { library, matchesSearch } from '../../utils/library/recipeLibrary'

/** What the recipe rows are filtered by: the header search and the Saved switch. */
export interface RecipeFilter {
  readonly query: string
  readonly savedOnly: boolean
  readonly savedIds: ReadonlySet<string>
}

/** Recipes matching the search, and only hearted ones when Saved is on. */
export const filterRecipes = (
  filter: RecipeFilter,
  recipes: readonly LibraryRecipe[] = library
): LibraryRecipe[] =>
  recipes.filter(
    (recipe) =>
      matchesSearch(recipe, { q: filter.query }) &&
      (!filter.savedOnly || filter.savedIds.has(recipe.id))
  )

/** Which empty state to show, if any. */
export type RecipesEmpty = 'none' | 'no-saved' | 'search' | 'no-match'

export const recipesEmpty = (
  filter: RecipeFilter,
  shown: readonly LibraryRecipe[]
): RecipesEmpty =>
  shown.length > 0
    ? 'none'
    : filter.savedOnly && filter.savedIds.size === 0
    ? 'no-saved'
    : filter.query.trim() !== ''
    ? 'search'
    : 'no-match'

/** The Saved switch is on but nothing has a heart yet (#160, reworded for #179). */
export const NO_SAVED_HINT =
  'No saved recipes yet. Sign in, open a recipe with its arrow, then tap its heart to save it. It will show here.'

/** "1 recipe", "3 recipes" */
export const recipeCount = (n: number): string =>
  `${n} ${n === 1 ? 'recipe' : 'recipes'}`
