import { CategoryType } from './CategoryType'

export interface IngredientType {
  _id: string
  name: string
  quantity: number
  measure: string
  category: CategoryType
}
