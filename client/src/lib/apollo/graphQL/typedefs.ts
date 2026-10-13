import type { TypedDocumentNode } from '@apollo/client'
import type { RecipeInput } from '../../../types/payloads'

/** Mirrors the server SDL. Every field is non-null unless the SDL says otherwise. */
export type User = {
  _id: string
  firstName: string
  lastName: string
  email: string
  pro: boolean
  savedRecipes: Recipe[]
  numSavedRecipes: number
}

export type UserInput = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type Recipe = {
  _id: string
  name: string
  portions: number
  ingredients: Ingredient[]
  picture_url: string
  /** null for recipes that did not come from the local library */
  libraryId: string | null
  /** null when the recipe has no instructions URL */
  instructions: string | null
}

export type Ingredient = {
  _id: string
  name: string
  quantity: number
  measure: string
  category: Category
}

export type Category = {
  _id: string
  name: string
}

export type Checkout = {
  session: string
}

/** The user fields selected by GET_USER and LOGIN. */
export type UserProfile = Omit<User, 'savedRecipes'>

/** Typed document helper: binds result and variable shapes to an operation. */
export type Operation<
  TData,
  TVariables extends Record<string, unknown> = Record<string, never>
> = TypedDocumentNode<TData, TVariables>

export type RecipeVariables = { input: RecipeInput }
