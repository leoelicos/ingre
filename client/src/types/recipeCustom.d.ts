import type { IngredientCustomType } from './ingredientCustom'

export type RecipeCustomType = {
  name?: string
  portions?: number
  ingredients: IngredientCustomType[]
}

export type RecipeCustomTypeWithKey = RecipeCustomType & { key: Key }
