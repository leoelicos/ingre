export interface RecipeInput {
  name: string
  portions: number
  ingredients: IngredientInput[]
  picture_url: string
  edamamId: string | undefined // will be undefined if user-generated
  instructions: string
}

interface IngredientInput {
  name: string
  quantity: number
  measure: string
  category: string
}
