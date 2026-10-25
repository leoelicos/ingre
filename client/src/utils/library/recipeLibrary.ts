/* Local, static recipe library (replaces the external recipe API). */
import ingredientData from '../../data/ingredients.json'
import recipeData from '../../data/recipes.json'
import type { ClientRecipe } from '../../types/client'
import type {
  LibraryIngredient,
  LibraryRecipe,
  LibrarySearch
} from '../../types/library'
import {
  parseCatalogue,
  parseRecipes,
  parseSectionColours
} from './parseLibrary'
import { normaliseTerm } from './searchTerms'

export const PLACEHOLDER_PICTURE = '/ingre.png'

export const catalogue: LibraryIngredient[] = parseCatalogue(ingredientData)
export const library: LibraryRecipe[] = parseRecipes(recipeData)
/** Colour per shop section (data/ingredients.json `sectionColours`). */
export const sectionColours = parseSectionColours(ingredientData)

export function toClientRecipe(
  recipe: LibraryRecipe,
  ingredients: LibraryIngredient[] = catalogue
): ClientRecipe {
  const byId = new Map(ingredients.map((i) => [i.id, i]))
  return {
    name: recipe.name,
    portions: recipe.portions,
    picture_url: recipe.picture_url || PLACEHOLDER_PICTURE,
    libraryId: recipe.id,
    ingredients: recipe.ingredients.map((ri) => {
      const item = byId.get(ri.ingredientId)
      return {
        name: item?.name ?? ri.ingredientId,
        quantity: ri.quantity,
        measure: ri.measure,
        category: item?.category ?? 'other'
      }
    })
  }
}

export function matchesSearch(
  recipe: LibraryRecipe,
  { q }: LibrarySearch,
  ingredients: readonly LibraryIngredient[] = catalogue
): boolean {
  const query = normaliseTerm(q ?? '')
  if (!query) return true
  const byId = new Map(ingredients.map((i) => [i.id, i.name]))
  const haystack = [
    recipe.name,
    ...recipe.ingredients.map((ri) => byId.get(ri.ingredientId) ?? '')
  ].map(normaliseTerm)
  return query
    .split(/\s+/)
    .every((word) => haystack.some((field) => field.includes(word)))
}

export function searchLibrary(
  search: LibrarySearch = {},
  recipes: LibraryRecipe[] = library,
  ingredients: LibraryIngredient[] = catalogue
): ClientRecipe[] {
  return recipes
    .filter((r) => matchesSearch(r, search, ingredients))
    .map((r) => toClientRecipe(r, ingredients))
}

export default searchLibrary
