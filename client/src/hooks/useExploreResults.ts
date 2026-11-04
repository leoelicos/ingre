import type { LibraryRecipe } from '../types/library'
import type { ExploreSource, ExploreResults } from '../utils/explore/exploreSearch'
import {
  DEFAULT_SOURCE,
  exploreResults,
  shownRecipes
} from '../utils/explore/exploreSearch'
import type { RecipeFilter } from '../utils/filters/filters'
import { recipeMatches } from '../utils/filters/filters'
import { unlockedRecipes } from '../utils/profile/locks'
import type { SavedState } from '../utils/saved/useSaved'
import type { Personal } from '../utils/profile/personal'

// Minimal props shape needed for the pure computation (avoids importing the large Explore component).
export interface ExploreComputeProps {
  readonly savedOnly: boolean
  readonly personal: Personal
}

/** The ingredient ids of a library original, for Explore's filter. */
export const originalIds = (recipe: LibraryRecipe): ReadonlySet<string> =>
  new Set(recipe.ingredients.map((ri) => ri.ingredientId))

/** The savedIds Explore filters by: the server's, or none signed out. */
export const savedIdsOf = (saved: SavedState | null): ReadonlySet<string> =>
  saved === null ? new Set() : saved.ids

/** How many ingredients and recipes matched; a "no matches" screen counts as none. */
export const matchCounts = (
  results: ExploreResults
): { ingredients: number; recipes: number } =>
  results.kind === 'matches'
    ? {
        ingredients: results.ingredients.length,
        recipes: results.recipes.length
      }
    : { ingredients: 0, recipes: 0 }

/**
 * Pure computation of Explore's filtered source, results and hidden count.
 * No React, no side effects — easy to unit test.
 */
export const computeExploreData = (
  query: string,
  props: ExploreComputeProps,
  filter: RecipeFilter,
  saved: SavedState | null
): {
  source: ExploreSource
  results: ExploreResults
  hidden: number
  counts: { ingredients: number; recipes: number }
} => {
  const savedIds = savedIdsOf(saved)
  const source: ExploreSource = {
    ...DEFAULT_SOURCE,
    recipes: DEFAULT_SOURCE.recipes.filter((recipe) =>
      recipeMatches(originalIds(recipe), filter)
    ),
    savedOnly: props.savedOnly,
    savedIds,
    personal: props.personal
  }
  const results = exploreResults(query, source)
  const allowed = unlockedRecipes(
    DEFAULT_SOURCE.recipes,
    DEFAULT_SOURCE.ingredients,
    props.personal.locks
  )
  const hidden = allowed.length - shownRecipes(source).length
  return {
    source,
    results,
    hidden,
    counts: matchCounts(results)
  }
}
