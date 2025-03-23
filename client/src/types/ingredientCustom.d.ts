import type { Key } from 'react'

export type IngredientCustomType = {
  name: string
  quantity: number
  measure: string
  category: { name: string }
}

export type IngredientCustomTypeWithKey = IngredientCustomType & {
  key: Key
}
