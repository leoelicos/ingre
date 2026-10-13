export interface RecipeInput {
  name: string
  portions: number
  ingredients: IngredientInput[]
  picture_url: string
  /** omitted for user-created recipes */
  libraryId?: string
  instructions?: string
}

export interface IngredientInput {
  name: string
  quantity: number
  measure: string
  category: string
}
