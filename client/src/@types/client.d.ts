export interface ClientRecipe {
  _id: string | undefined // will not have one if not from server
  name: string
  portions: number
  picture_url: string
  instructions: string | undefined // will not have one if not from server
  edamamId: string | undefined
  ingredients: ClientIngredient[]
}

export interface ClientIngredient {
  _id: string | undefined
  name: string
  quantity: number
  measure: string
  category: { name: string }
}
