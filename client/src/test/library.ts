import type { LibraryIngredient, LibraryRecipe } from '../types/library'
import { catalogue, library } from '../utils/library/recipeLibrary'

/* Real catalogue items and library recipes by id, for tests (#182). */

export const itemById = (id: string): LibraryIngredient => {
  const found = catalogue.find((i) => i.id === id)
  if (found === undefined) throw new Error(`no item ${id}`)
  return found
}

export const recipeById = (id: string): LibraryRecipe => {
  const found = library.find((r) => r.id === id)
  if (found === undefined) throw new Error(`no recipe ${id}`)
  return found
}
