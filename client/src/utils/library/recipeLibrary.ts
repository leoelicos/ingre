/* Local, static recipe library (replaces the external recipe API). */
import ingredientData from '../../data/ingredients.json'
import recipeData from '../../data/recipes.json'
import type { ClientRecipe } from '../../types/client'
import type {
  LibraryIngredient,
  LibraryRecipe,
  LibrarySearch
} from '../../types/library'

export const PLACEHOLDER_PICTURE = '/ingre.png'

const catalogue: LibraryIngredient[] = ingredientData.ingredients
const library: LibraryRecipe[] = recipeData.recipes

export function toClientRecipe(
  recipe: LibraryRecipe,
  ingredients: LibraryIngredient[] = catalogue
): ClientRecipe {
  const byId = new Map(ingredients.map((i) => [i.id, i]))
  return {
    _id: undefined,
    name: recipe.name,
    portions: recipe.portions,
    picture_url: recipe.picture_url || PLACEHOLDER_PICTURE,
    instructions: undefined,
    libraryId: recipe.id,
    ingredients: recipe.ingredients.map((ri) => {
      const item = byId.get(ri.ingredientId)
      return {
        _id: undefined,
        name: item?.name ?? ri.ingredientId,
        quantity: ri.quantity,
        measure: ri.measure,
        category: item?.category ?? 'other'
      }
    })
  }
}

const norm = (s: string) => s.trim().toLowerCase()

export function matchesSearch(
  recipe: LibraryRecipe,
  { q, tags }: LibrarySearch,
  ingredients: LibraryIngredient[] = catalogue
): boolean {
  const recipeTags = recipe.tags.map(norm)
  if (tags && tags.length > 0) {
    if (!tags.every((t) => recipeTags.includes(norm(t)))) return false
  }
  const query = q ? norm(q) : ''
  if (!query) return true
  const byId = new Map(ingredients.map((i) => [i.id, i.name]))
  const haystack = [
    recipe.name,
    ...recipe.tags,
    ...recipe.ingredients.map((ri) => byId.get(ri.ingredientId) ?? '')
  ].map(norm)
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

export function getLibraryTags(recipes: LibraryRecipe[] = library): string[] {
  return Array.from(new Set(recipes.flatMap((r) => r.tags))).sort()
}

export default searchLibrary
