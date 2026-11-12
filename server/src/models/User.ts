import bcrypt from 'bcrypt'
import {
  CallbackWithoutResultAndOptionalError,
  Document,
  Schema,
  Types,
  model
} from 'mongoose'
import { RecipeSchema } from './Recipe'
import { TIERS, type Tier } from '../utils/tiers'
import {
  ENTITLEMENT_SOURCES,
  type EntitlementSource
} from '../payments/entitlement'

export interface UserSchema extends Document {
  _id: Types.ObjectId
  firstName: string
  lastName: string
  email: string
  // Firebase Auth: absent for a user who signs in through Firebase (Firebase holds it)
  password?: string
  // Firebase Auth: the uid this user signs in with; absent until linked
  firebaseUid?: string
  pro: boolean
  tier?: Tier | null
  // #312: the Stripe subscription behind the tier
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  subscriptionStatus?: string | null
  active: boolean
  // #314: an App Store or Google Play subscription behind the tier
  storePlatform?: 'APPLE' | 'GOOGLE' | null
  storeProductId?: string | null
  storeId?: string | null
  storeExpiresAt?: Date | null
  // Paddle + RevenueCat: the normalised entitlement behind the tier (web Paddle, or a
  // store purchase reported by RevenueCat)
  entitlementSource?: EntitlementSource | null
  entitlementSubscriptionId?: string | null
  entitlementProductId?: string | null
  entitlementInterval?: 'month' | 'year' | null
  entitlementExpiresAt?: Date | null
  entitlementUpdatedAt?: Date | null
  paddleCustomerId?: string | null
  savedRecipes: Array<Types.Subdocument & RecipeSchema>
  numSavedRecipes: number // virtual
}

export interface UserMethods {
  isCorrectPassword(password: string): Promise<boolean>
}
export interface UserVirtuals {
  numSavedRecipes: number
}
/** Firebase Auth: a user linked to Firebase signs in there, so needs no password or surname. */
function notFirebase(this: { firebaseUid?: string }): boolean {
  return !this.firebaseUid
}

const userSchema = new Schema<UserSchema, {}, UserMethods, UserVirtuals>(
  {
    firstName: { type: String, required: true, trim: true },
    // Firebase Auth: a Google account may have no family name
    lastName: { type: String, required: notFirebase, trim: true, default: '' },
    email: { type: String, required: true, unique: true },
    // Firebase Auth: only the legacy password login keeps a bcrypt hash here
    password: { type: String, required: notFirebase, minlength: 5 },
    // Firebase Auth: unique among linked users; sparse, so unlinked users (no field) don't clash
    firebaseUid: { type: String, unique: true, sparse: true },
    savedRecipes: [{ type: Types.ObjectId, ref: 'Recipe', required: true }],
    pro: { type: Boolean, default: false },
    // #208: null until a tier is bought
    tier: { type: String, enum: [...TIERS, null], default: null },
    // #312: set by `subscribe` and kept in step by the Stripe webhook
    stripeCustomerId: { type: String, default: null, index: true },
    stripeSubscriptionId: { type: String, default: null },
    subscriptionStatus: { type: String, default: null },
    // true while the subscription is active or trialing
    active: { type: Boolean, default: false },
    // #314: set by `submitStorePurchase` and kept in step by the store notifications.
    // storeId is Apple's originalTransactionId or Google's purchase token.
    storePlatform: {
      type: String,
      enum: ['APPLE', 'GOOGLE', null],
      default: null
    },
    storeProductId: { type: String, default: null },
    storeId: { type: String, default: null, index: true },
    storeExpiresAt: { type: Date, default: null },
    // Paddle + RevenueCat: written only by the payment webhooks (EntitlementApi).
    // entitlementUpdatedAt is when the newest applied event happened, so an older event
    // that arrives late never undoes a newer one.
    entitlementSource: {
      type: String,
      enum: [...ENTITLEMENT_SOURCES, null],
      default: null
    },
    entitlementSubscriptionId: { type: String, default: null, index: true },
    entitlementProductId: { type: String, default: null },
    entitlementInterval: {
      type: String,
      enum: ['month', 'year', null],
      default: null
    },
    entitlementExpiresAt: { type: Date, default: null },
    entitlementUpdatedAt: { type: Date, default: null },
    paddleCustomerId: { type: String, default: null }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

userSchema.virtual('numSavedRecipes').get(function (this: UserSchema) {
  return this.savedRecipes.length
})

userSchema.pre(
  'save',
  async function (next: CallbackWithoutResultAndOptionalError) {
    if (
      this.isNew &&
      this.password
      // || this.isModified('password') // we have not allowed a user to reset their password at this stage
    ) {
      const saltRounds = 10
      this.password = await bcrypt.hash(this.password, saltRounds)
    }
    next()
  }
)

userSchema.method('isCorrectPassword', async function (password: string) {
  // Firebase Auth: a Firebase-only user has no hash, so the legacy login never matches
  return this.password ? bcrypt.compare(password, this.password) : false
})

export const User = model('User', userSchema)
