import type { IngredientCustomType } from './ingredientCustom.ts'

export type RecipeCustomType = {
  name?: string
  portions?: number
  ingredients: IngredientCustomType[]
}

export type RecipeCustomTypeWithKey = RecipeCustomType & { key: Key }
