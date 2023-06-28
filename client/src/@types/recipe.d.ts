import type { IngredientType } from './ingredient.d.ts'

export interface RecipeType {
  _id?: string // from server
  name?: string
  portions?: number
  picture_url?: string // may not have one
  instructions?: string // may not have one
  shareAs?: string // will not have one if created from scratch
  edamamId?: string // may not have one if created from scratch
  ingredients: IngredientType[]
}
