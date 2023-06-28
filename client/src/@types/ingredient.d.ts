import type { CategoryType } from './category.d.ts'

export interface IngredientType {
  _id?: string
  name: string
  quantity: number
  measure: string
  category: CategoryType
}
