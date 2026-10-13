import type { ClientIngredient, ClientRecipe } from '../../../types/client'
import type { IngredientInput, RecipeInput } from '../../../types/payloads'

export const DEFAULT_PICTURE_URL =
  'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'

const DEFAULT_RECIPE = { name: 'Untitled Recipe', portions: 1 } as const
const DEFAULT_INGREDIENT = {
  name: 'Ingredient',
  quantity: 1,
  measure: 'unit',
  category: 'Generic'
} as const

/** Fills blank ingredient fields with defaults. */
export const toIngredientInput = (i: ClientIngredient): IngredientInput => ({
  name: i.name || DEFAULT_INGREDIENT.name,
  quantity: i.quantity > 0 ? i.quantity : DEFAULT_INGREDIENT.quantity,
  measure: i.measure || DEFAULT_INGREDIENT.measure,
  category: i.category || DEFAULT_INGREDIENT.category
})

/** Builds the saveRecipe payload, filling blanks with defaults and omitting absent optional fields. */
export const toRecipeInput = (recipe: ClientRecipe): RecipeInput => ({
  name: recipe.name || DEFAULT_RECIPE.name,
  portions: recipe.portions > 0 ? recipe.portions : DEFAULT_RECIPE.portions,
  picture_url: recipe.picture_url || DEFAULT_PICTURE_URL,
  ingredients: recipe.ingredients.map(toIngredientInput),
  ...(recipe.libraryId !== undefined ? { libraryId: recipe.libraryId } : {}),
  ...(recipe.instructions ? { instructions: recipe.instructions } : {})
})
