export interface ClientRecipe {
  /** present only for recipes saved on the server */
  _id?: string
  name: string
  portions: number
  picture_url: string
  /** instructions URL; present only for server recipes that have one */
  instructions?: string
  /** id in the local recipe library, when the recipe came from it */
  libraryId?: string
  ingredients: ClientIngredient[]
  /** library tags (cuisine, meal, diet); empty for server recipes */
  tags: string[]
}

export interface ClientIngredient {
  _id?: string
  name: string
  quantity: number
  measure: string
  category: string
}
