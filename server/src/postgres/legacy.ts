import type { Types } from 'mongoose'
import { Category } from '../models/Category'
import { Ingredient } from '../models/Ingredient'
import { Recipe } from '../models/Recipe'
import { User } from '../models/User'
import type { CustomisationDoc } from '../schemas/types'

/** Mongo documents as plain data, with every ObjectId as its hex string. */
export interface LegacyCategory {
  readonly mongoId: string
  readonly name: string
}
export interface LegacyIngredient {
  readonly mongoId: string
  readonly name: string
  readonly quantity: number
  readonly measure: string
  readonly text: string | null
  readonly ingredientId: string | null
  readonly categoryMongoId: string
}
export interface LegacyRecipe {
  readonly mongoId: string
  readonly name: string
  readonly portions: number
  readonly pictureUrl: string
  readonly libraryId: string | null
  readonly instructions: string | null
  readonly customisations: ReadonlyArray<CustomisationDoc>
  readonly ingredientMongoIds: ReadonlyArray<string>
  readonly createdAt: Date
}
export interface LegacyUser {
  readonly mongoId: string
  readonly firstName: string
  readonly lastName: string
  readonly email: string
  /** null for a user made through Firebase Auth (Firebase holds the password) */
  readonly passwordHash: string | null
  /** Firebase Auth: the uid the user signs in with; null until linked */
  readonly firebaseUid: string | null
  readonly pro: boolean
  readonly savedRecipeMongoIds: ReadonlyArray<string>
  readonly createdAt: Date
}
export interface LegacyData {
  readonly categories: ReadonlyArray<LegacyCategory>
  readonly ingredients: ReadonlyArray<LegacyIngredient>
  readonly recipes: ReadonlyArray<LegacyRecipe>
  readonly users: ReadonlyArray<LegacyUser>
}

interface RawCategory {
  _id: Types.ObjectId
  name: string
}
interface RawIngredient extends RawCategory {
  quantity: number
  measure: string
  text?: string | null
  ingredientId?: string | null
  category: Types.ObjectId
}
interface RawRecipe extends RawCategory {
  portions: number
  picture_url: string
  libraryId?: string | null
  instructions?: string | null
  customisations?: CustomisationDoc[]
  ingredients: Types.ObjectId[]
}
interface RawUser {
  _id: Types.ObjectId
  firstName: string
  lastName: string
  email: string
  password?: string | null
  firebaseUid?: string | null
  pro?: boolean
  savedRecipes: Types.ObjectId[]
}

const hex = (id: Types.ObjectId) => id.toString()

const toCategory = ({ _id, name }: RawCategory): LegacyCategory => ({
  mongoId: hex(_id),
  name
})

const toIngredient = (raw: RawIngredient): LegacyIngredient => ({
  mongoId: hex(raw._id),
  name: raw.name,
  quantity: raw.quantity,
  measure: raw.measure,
  text: raw.text ?? null,
  ingredientId: raw.ingredientId ?? null,
  categoryMongoId: hex(raw.category)
})

const toRecipe = (raw: RawRecipe): LegacyRecipe => ({
  mongoId: hex(raw._id),
  name: raw.name,
  portions: raw.portions,
  pictureUrl: raw.picture_url,
  libraryId: raw.libraryId ?? null,
  instructions: raw.instructions ?? null,
  customisations: raw.customisations ?? [],
  ingredientMongoIds: raw.ingredients.map(hex),
  createdAt: raw._id.getTimestamp()
})

const toUser = (raw: RawUser): LegacyUser => ({
  mongoId: hex(raw._id),
  firstName: raw.firstName,
  lastName: raw.lastName,
  email: raw.email,
  passwordHash: raw.password ?? null,
  firebaseUid: raw.firebaseUid ?? null,
  pro: raw.pro ?? false,
  savedRecipeMongoIds: raw.savedRecipes.map(hex),
  createdAt: raw._id.getTimestamp()
})

/**
 * Reads every document the Postgres schema needs. Read-only: `find` only,
 * oldest first, so a re-run sees the same order.
 */
export const readLegacy = async (): Promise<LegacyData> => {
  const [categories, ingredients, recipes, users] = await Promise.all([
    Category.find().sort({ _id: 1 }).lean<RawCategory[]>(),
    Ingredient.find().sort({ _id: 1 }).lean<RawIngredient[]>(),
    Recipe.find().sort({ _id: 1 }).lean<RawRecipe[]>(),
    User.find().sort({ _id: 1 }).lean<RawUser[]>()
  ])
  return {
    categories: categories.map(toCategory),
    ingredients: ingredients.map(toIngredient),
    recipes: recipes.map(toRecipe),
    users: users.map(toUser)
  }
}
