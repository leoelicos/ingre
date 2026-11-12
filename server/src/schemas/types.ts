import type {
  RecipeInput,
  IngredientInput,
  AddedIngredientInput,
  RemovedIngredientInput,
  ChangedIngredientInput,
  PortionsChangeInput,
  CustomisationsInput
} from './generated/graphql'

export type {
  RecipeInput,
  IngredientInput,
  AddedIngredientInput,
  RemovedIngredientInput,
  ChangedIngredientInput,
  PortionsChangeInput,
  CustomisationsInput
}
import { createDataSources } from '../datasources'

/** A user as the API sees them; `_id` is the public id (utils/publicId.ts). */
export type User = {
  _id: string
  firstName: string
  lastName: string
  email: string
  pro: boolean
  savedRecipes: Array<string>
  numSavedRecipes: number
}

export type UserInput = {
  firstName: string
  lastName: string
  email: string
  password: string
}

/** `_id` is the recipe's public id. */
export type Recipe = {
  _id: string
  name: string
  portions: number
  ingredients: Array<string>
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

export interface RecipePopulated extends Omit<Recipe, 'ingredients'> {
  ingredients: Array<{
    _id: string
    name: string
    quantity: number
    measure: string
    category: Category
    ingredientId?: string | null
  }>
}

export type Ingredient = {
  _id: string
  name: string
  quantity: number
  measure: string
  category: Category
  ingredientId?: string | null
}

export type Category = {
  _id: string
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
