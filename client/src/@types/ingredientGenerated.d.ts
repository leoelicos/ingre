import type { Key } from 'react'

export interface IngredientGeneratedType {
  _id: string
  name: string
  quantity: number
  measure: string
  category: { name: string }
  recipe: string
  recipeId: string
}

export type IngredientGeneratedTypeWithKey = IngredientGeneratedType & {
  key: Key
}
