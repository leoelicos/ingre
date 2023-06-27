export interface Recipe {
  name: string
  portions: number
  ingredients: {
    name: string
    quantity: number
    measure: string
    category: {
      name: string
    }
  }[]
  picture_url: string
  edamamId: string
  instructions: string
}
