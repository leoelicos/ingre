export interface RecipeInput {
  name: string
  portions: number
  ingredients: IngredientInput[]
  picture_url: string
  edamamId: string
  instructions: string
}

interface IngredientInput {
  name: string
  quantity: number
  measure: string
  category: string
}
