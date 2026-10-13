export interface LibraryIngredient {
  id: string
  name: string
  /** supermarket aisle */
  category: string
  /** pantry staple most kitchens already have (salt, cooking oils) */
  staple?: boolean
}

export interface LibraryRecipeIngredient {
  ingredientId: string
  quantity: number
  measure: string
}

export interface LibraryRecipe {
  id: string
  name: string
  portions: number
  /** many-to-many: cuisines, diets, meals */
  tags: string[]
  ingredients: LibraryRecipeIngredient[]
  method: string[]
  picture_url?: string
}

export interface LibrarySearch {
  q?: string
  tags?: string[]
}
