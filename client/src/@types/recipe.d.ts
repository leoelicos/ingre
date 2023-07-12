// used in RecipeCard, Customise,   Ingredients
import type { IngredientType } from './ingredient.d.ts'

export interface RecipeType {
  _id: string | undefined // will not have one if not from server
  name: string
  portions: number
  picture_url: string
  instructions: string
  shareAs: string
  edamamId: string
  ingredients: IngredientType[]
}
