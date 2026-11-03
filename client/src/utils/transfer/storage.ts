/* #230: recipes the user imported stay on this device, like picks and extras. */
import type { LibraryRecipe } from '../../types/library'
import { parseRecipes } from '../library/parseLibrary'
import { readStored, writeStored } from '../storage/storage'

/** Imported recipe ids start with this, so built-in recipes are never removed or overwritten. */
export const IMPORTED_PREFIX = 'imported-'
export const IMPORTED_KEY = 'ingre.recipes.imported'

/** All or nothing: a list that does not parse is ignored rather than half used. */
export const parseImported = (value: unknown): LibraryRecipe[] | null => {
  try {
    return parseRecipes({ recipes: value })
  } catch {
    return null
  }
}

export const loadImported = (): LibraryRecipe[] =>
  readStored(IMPORTED_KEY, parseImported, [])

export const saveImported = (recipes: readonly LibraryRecipe[]): void =>
  writeStored(IMPORTED_KEY, recipes)
