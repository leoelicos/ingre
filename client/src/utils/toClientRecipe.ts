import type { Ingredient, Recipe } from '../lib/apollo/graphQL/typedefs'
import type { ClientIngredient, ClientRecipe } from '../types/client'

/** Flattens a server ingredient's category to its name. */
export const toClientIngredient = ({
  _id,
  name,
  quantity,
  measure,
  category
}: Ingredient): ClientIngredient => ({
  _id,
  name,
  quantity,
  measure,
  category: category.name
})

/** Converts a server recipe to client state, omitting absent optional fields. */
export const toClientRecipe = ({
  _id,
  name,
  portions,
  picture_url,
  ingredients,
  libraryId,
  instructions
}: Recipe): ClientRecipe => ({
  _id,
  name,
  portions,
  picture_url,
  ingredients: ingredients.map(toClientIngredient),
  tags: [],
  ...(libraryId === null ? {} : { libraryId }),
  ...(instructions ? { instructions } : {})
})
