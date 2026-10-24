import { Types } from 'mongoose'
import { createDataSources } from '../datasources'

export type User = {
  _id: Types.ObjectId
  firstName: string
  lastName: string
  email: string
  pro: boolean
  savedRecipes: Array<Types.ObjectId>
  numSavedRecipes: number
}

export type UserInput = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type Recipe = {
  _id: Types.ObjectId
  name: string
  portions: number
  ingredients: Array<Types.ObjectId>
  picture_url: string
  libraryId?: string
  instructions?: string
  customisations: Array<CustomisationDoc>
}

/** #182: the union member each stored change resolves to. */
export type CustomisationKind =
  | 'AddedIngredient'
  | 'RemovedIngredient'
  | 'ChangedIngredient'
  | 'PortionsChange'

/** One stored change; which amounts it has depends on its kind. */
export type CustomisationDoc = {
  kind: CustomisationKind
  ingredientId?: string
  from?: number
  to?: number
}

export type CustomisationsInput = {
  added: Array<{ ingredientId: string; to: number }>
  removed: Array<{ ingredientId: string; from: number }>
  changed: Array<{ ingredientId: string; from: number; to: number }>
  portions?: { from: number; to: number } | null
}

export interface RecipePopulated extends Omit<Recipe, 'ingredients'> {
  ingredients: Array<{
    _id: Types.ObjectId
    name: string
    quantity: number
    measure: string
    category: Category
    ingredientId?: string | null
  }>
}

export type RecipeInput = {
  name: string
  portions: number
  ingredients: Array<IngredientInput>
  picture_url: string
  libraryId?: string | null
  instructions?: string | null
  customisations: CustomisationsInput
}

export type Ingredient = {
  _id: Types.ObjectId
  name: string
  quantity: number
  measure: string
  category: Category
  ingredientId?: string | null
}

export type IngredientInput = {
  name: string
  quantity: number
  measure: string
  category: string
  ingredientId: string
}

export type Category = {
  _id: Types.ObjectId
  name: string
}

export type Checkout = {
  session: string
}

export type Auth = {
  token: string
  user: User
}

export interface MyContext {
  user?: User
  dataSources: ReturnType<typeof createDataSources>
  headers?: {
    referer?: string
  }
}
