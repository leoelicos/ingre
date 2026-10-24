export interface RecipeInput {
  name: string
  portions: number
  ingredients: IngredientInput[]
  picture_url: string
  /** omitted for user-created recipes */
  libraryId?: string
  instructions?: string
  /** differences from the library original (#182) */
  customisations: CustomisationsInput
}

export interface IngredientInput {
  name: string
  quantity: number
  measure: string
  category: string
  /** catalogue id (#182) */
  ingredientId: string
}

export interface AddedIngredientInput {
  ingredientId: string
  to: number
}

export interface RemovedIngredientInput {
  ingredientId: string
  from: number
}

export interface ChangedIngredientInput {
  ingredientId: string
  from: number
  to: number
}

export interface PortionsChangeInput {
  from: number
  to: number
}

export interface CustomisationsInput {
  added: AddedIngredientInput[]
  removed: RemovedIngredientInput[]
  changed: ChangedIngredientInput[]
  /** omitted when the portions are unchanged */
  portions?: PortionsChangeInput
}
