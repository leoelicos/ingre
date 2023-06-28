import { IngredientType } from './IngredientType'

export interface RecipeType {
  _id?: string // from server
  name: string
  portions: number
  picture_url: string
  instructions: string
  edamamId: string
  ingredients: IngredientType[]
}
