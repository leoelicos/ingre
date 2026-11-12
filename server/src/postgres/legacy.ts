/*
 * The Mongo documents the backfill copies, as plain data. Pure: the read itself lives in
 * scripts/legacyMongo.ts (the only code that still talks to Mongo, read-only), so the
 * API ships no Mongo driver. Every ObjectId becomes its 24-hex string.
 */
import { z } from 'zod'
import { customisationSchema } from '../schemas/customisation'
import { ENTITLEMENT_SOURCES } from '../payments/entitlement'
import type { CustomisationDoc } from '../schemas/types'
import { TIERS } from '../utils/tiers'

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
  readonly categoryMongoId: string | null
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
/** What the payment routes kept on the Mongo user (#208, #312, #314, Paddle + RevenueCat). */
export interface LegacyBilling {
  readonly tier: (typeof TIERS)[number] | null
  readonly stripeCustomerId: string | null
  readonly stripeSubscriptionId: string | null
  readonly subscriptionStatus: string | null
  readonly active: boolean
  readonly storePlatform: 'APPLE' | 'GOOGLE' | null
  readonly storeProductId: string | null
  readonly storeId: string | null
  readonly storeExpiresAt: Date | null
  readonly entitlementSource: (typeof ENTITLEMENT_SOURCES)[number] | null
  readonly entitlementSubscriptionId: string | null
  readonly entitlementProductId: string | null
  readonly entitlementInterval: 'month' | 'year' | null
  readonly entitlementExpiresAt: Date | null
  readonly entitlementUpdatedAt: Date | null
  readonly paddleCustomerId: string | null
}
export interface LegacyUser extends LegacyBilling {
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
/** A payment event already processed, so a late repeat delivery is still skipped. */
export interface LegacyWebhookEvent {
  readonly id: string
  readonly receivedAt: Date
}
export interface LegacyData {
  readonly categories: ReadonlyArray<LegacyCategory>
  readonly ingredients: ReadonlyArray<LegacyIngredient>
  readonly recipes: ReadonlyArray<LegacyRecipe>
  readonly users: ReadonlyArray<LegacyUser>
  readonly webhookEvents: ReadonlyArray<LegacyWebhookEvent>
}

/** The raw documents, one list per collection, as the Mongo driver returns them. */
export interface LegacyDocuments {
  readonly categories: ReadonlyArray<unknown>
  readonly ingredients: ReadonlyArray<unknown>
  readonly recipes: ReadonlyArray<unknown>
  readonly users: ReadonlyArray<unknown>
  readonly webhookevents: ReadonlyArray<unknown>
}

/** What the driver's ObjectId offers that the copy uses. */
interface ObjectIdLike {
  toHexString(): string
  getTimestamp(): Date
}
const isObjectIdLike = (value: unknown): value is ObjectIdLike =>
  typeof value === 'object' &&
  value !== null &&
  'toHexString' in value &&
  typeof value.toHexString === 'function' &&
  'getTimestamp' in value &&
  typeof value.getTimestamp === 'function'

const objectId = z.custom<ObjectIdLike>(isObjectIdLike, 'not an ObjectId')
const hex = objectId.transform((id) => id.toHexString().toLowerCase())
/** Mongoose wrote null for most optional fields, and left some out altogether. */
const optional = <T extends z.ZodType>(schema: T) =>
  schema.nullish().transform((value) => value ?? null)

const category = z.object({ _id: hex, name: z.string() })

const ingredient = z.object({
  _id: hex,
  name: z.string(),
  quantity: z.number().default(0),
  measure: z.string().default('unit'),
  text: optional(z.string()),
  ingredientId: optional(z.string()),
  category: optional(hex)
})

const recipe = z.object({
  _id: objectId,
  name: z.string(),
  portions: z.number().default(2),
  picture_url: z.string(),
  libraryId: optional(z.string()),
  instructions: optional(z.string()),
  customisations: z.array(customisationSchema).default([]),
  ingredients: z.array(hex).default([])
})

const user = z.object({
  _id: objectId,
  firstName: z.string(),
  lastName: z.string().default(''),
  email: z.string(),
  password: optional(z.string()),
  firebaseUid: optional(z.string()),
  pro: z.boolean().default(false),
  savedRecipes: z.array(hex).default([]),
  tier: optional(z.enum(TIERS)),
  stripeCustomerId: optional(z.string()),
  stripeSubscriptionId: optional(z.string()),
  subscriptionStatus: optional(z.string()),
  active: z.boolean().default(false),
  storePlatform: optional(z.enum(['APPLE', 'GOOGLE'])),
  storeProductId: optional(z.string()),
  storeId: optional(z.string()),
  storeExpiresAt: optional(z.date()),
  entitlementSource: optional(z.enum(ENTITLEMENT_SOURCES)),
  entitlementSubscriptionId: optional(z.string()),
  entitlementProductId: optional(z.string()),
  entitlementInterval: optional(z.enum(['month', 'year'])),
  entitlementExpiresAt: optional(z.date()),
  entitlementUpdatedAt: optional(z.date()),
  paddleCustomerId: optional(z.string())
})

const webhookEvent = z.object({
  _id: z.string(),
  receivedAt: z.date()
})

const toCategory = (raw: unknown): LegacyCategory => {
  const { _id, name } = category.parse(raw)
  return { mongoId: _id, name }
}

const toIngredient = (raw: unknown): LegacyIngredient => {
  const doc = ingredient.parse(raw)
  return {
    mongoId: doc._id,
    name: doc.name,
    quantity: doc.quantity,
    measure: doc.measure,
    text: doc.text,
    ingredientId: doc.ingredientId,
    categoryMongoId: doc.category
  }
}

const toRecipe = (raw: unknown): LegacyRecipe => {
  const doc = recipe.parse(raw)
  return {
    mongoId: doc._id.toHexString().toLowerCase(),
    name: doc.name,
    portions: doc.portions,
    pictureUrl: doc.picture_url,
    libraryId: doc.libraryId,
    instructions: doc.instructions,
    customisations: doc.customisations,
    ingredientMongoIds: doc.ingredients,
    createdAt: doc._id.getTimestamp()
  }
}

const toUser = (raw: unknown): LegacyUser => {
  const { _id, password, savedRecipes, ...doc } = user.parse(raw)
  return {
    ...doc,
    mongoId: _id.toHexString().toLowerCase(),
    passwordHash: password,
    savedRecipeMongoIds: savedRecipes,
    createdAt: _id.getTimestamp()
  }
}

const toWebhookEvent = (raw: unknown): LegacyWebhookEvent => {
  const { _id, receivedAt } = webhookEvent.parse(raw)
  return { id: _id, receivedAt }
}

/** The documents as backfill input; throws on a document it can't copy faithfully. */
export const toLegacyData = (docs: LegacyDocuments): LegacyData => ({
  categories: docs.categories.map(toCategory),
  ingredients: docs.ingredients.map(toIngredient),
  recipes: docs.recipes.map(toRecipe),
  users: docs.users.map(toUser),
  webhookEvents: docs.webhookevents.map(toWebhookEvent)
})
