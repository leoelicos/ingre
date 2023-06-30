import Key from 'react'

export type IngredientCustomType = {
  name: string
  quantity: string
  measure: string
  category: string
} & { key: Key }
