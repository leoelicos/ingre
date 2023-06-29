import type { Key } from 'react'

export interface IngredientGeneratedType {
  _id: string
  name: string
  quantity: number
  measure: string
  category: string
  recipe: string
  recipeId: string
}

export type IngredientGeneratedTypeWithKey = IngredientGeneratedType & {
  key: Key
}
