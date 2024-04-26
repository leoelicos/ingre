import type { Key } from 'react'

export type IngredientCustomType = {
  name: string
  quantity: number
  measure: string
  category: string
}

export type IngredientCustomTypeWithKey = IngredientCustomType & {
  key: Key
}
