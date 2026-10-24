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

/** A saved recipe as GET_SAVED_RECIPES and SAVE_RECIPE select it (#182). */
export type SavedRecipe = Omit<Recipe, 'ingredients'> & {
  ingredients: SavedIngredient[]
  customisations: Customisation[]
}

export type Ingredient = {
  _id: string
  name: string
  quantity: number
  measure: string
  category: Category
}

/** null for ingredients saved before catalogue ids (#182). */
export type SavedIngredient = Ingredient & { ingredientId: string | null }

/** One customisation of a saved recipe (#182); PortionsChange is aliased in the selection. */
export type Customisation =
  | { __typename: 'AddedIngredient'; ingredientId: string; to: number }
  | { __typename: 'RemovedIngredient'; ingredientId: string; from: number }
  | {
      __typename: 'ChangedIngredient'
      ingredientId: string
      from: number
      to: number
    }
  | { __typename: 'PortionsChange'; fromPortions: number; toPortions: number }

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
