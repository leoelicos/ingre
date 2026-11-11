import { NotFoundError } from '../errors'
import { User, UserMethods, UserSchema } from '../models/User'
import { Types } from 'mongoose'
import { UserInput } from '../schemas/types'
import { isActiveStatus, type Tier } from '../utils/tiers'

export class UserApi {
  public async findOneUserById({ id }: { id: Types.ObjectId }) {
    const user = await User.findById<UserSchema & UserMethods>(id)
      .select('-__v')
      .populate({
        path: 'savedRecipes',
        populate: {
          path: 'ingredients',
          populate: {
            path: 'category'
          }
        }
      })
    return user ? user.toObject({ virtuals: true }) : null
  }
  public async getUserSavedRecipes({ id }: { id: Types.ObjectId }) {
    const user = await User.findById<UserSchema & UserMethods>(id)
      .select('-__v')
      .populate({
        path: 'savedRecipes',
        populate: {
          path: 'ingredients',
          populate: {
            path: 'category'
          }
        }
      })
    return user ? user.savedRecipes : null
  }
  public async findOneUser({ email }: { email: string }) {
    const user = await User.findOne<UserSchema & UserMethods>({ email })
      .select('-__v')
      .populate({
        path: 'savedRecipes',
        populate: {
          path: 'ingredients',
          populate: {
            path: 'category'
          }
        }
      })
    return user ? user.toObject({ virtuals: true }) : null
  }

  public async addRecipeToUser({
    userId,
    recipeId
  }: {
    userId: Types.ObjectId
    recipeId: Types.ObjectId
  }) {
    return await User.findByIdAndUpdate<UserSchema & UserMethods>(
      userId,
      { $push: { savedRecipes: recipeId } },
      { new: true }
    ).select('-__v')
  }

  public async removeRecipeFromUser({
    userId,
    recipeId
  }: {
    userId: Types.ObjectId
    recipeId: Types.ObjectId
  }) {
    return await User.findByIdAndUpdate<UserSchema & UserMethods>(
      userId,
      { $pull: { savedRecipes: recipeId } },
      { new: true }
    ).select('-__v')
  }

  public async createUser({ email, password, firstName, lastName }: UserInput) {
    const user = await User.create({ email, password, firstName, lastName })
    const foundUser = await User.findById(user._id)
      .select('-__v')
      .populate({
        path: 'savedRecipes',
        populate: {
          path: 'ingredients',
          populate: {
            path: 'category'
          }
        }
      })
      .orFail()
    return foundUser.toObject<UserSchema & Required<{ _id: Types.ObjectId }>>({
      virtuals: true
    })
  }

  public async deleteAllUsers() {
    return await User.deleteMany()
  }

  public async getAllUsers() {
    return await User.find().select('-__v')
  }

  public async checkUserPassword({
    email,
    password
  }: {
    email: string
    password: string
  }) {
    try {
      const user = await User.findOne<UserSchema & UserMethods>({ email })
      if (!user) return null
      const result = await user.isCorrectPassword(password)
      if (result) {
        return user
      } else {
        return null
      }
    } catch (error) {
      throw new Error('checkUserPassword error')
    }
  }

  /** `tier` is set only when one was bought (#208); the old flow keeps what it had. */
  public async makeUserPro({
    _id,
    tier = null
  }: {
    _id: Types.ObjectId
    tier?: Tier | null
  }) {
    const user = await User.findByIdAndUpdate(
      _id,
      { $set: tier ? { pro: true, tier } : { pro: true } },
      { new: true }
    ).select('-__v')
    if (!user) throw new NotFoundError('User not found')
    return user.toObject({ virtuals: true })
  }

  /** #312: who to bill, and the Stripe Customer and subscription they already have. */
  public async findBilling(_id: Types.ObjectId) {
    const user = await User.findById<UserSchema>(_id)
    if (!user) throw new NotFoundError('User not found')
    return {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      customerId: user.stripeCustomerId ?? null,
      subscriptionId: user.stripeSubscriptionId ?? null
    }
  }

  /**
   * #312: what Stripe says about the user's subscription. `tier` is kept while active and
   * cleared once the subscription ends; a failed payment leaves the tier but not `active`.
   */
  public async setSubscription(
    filter: { _id: Types.ObjectId | string } | { stripeCustomerId: string },
    subscription: SubscriptionState
  ) {
    const user = await User.findOneAndUpdate(
      filter,
      { $set: subscriptionFields(subscription) },
      { new: true }
    ).select('-__v')
    return user ? user.toObject({ virtuals: true }) : null
  }
}

export interface SubscriptionState {
  readonly customerId: string
  readonly subscriptionId: string | null
  readonly status: string
  /** null when the status alone changed (an invoice event) */
  readonly tier: Tier | null
}

const ENDED = new Set(['canceled', 'incomplete_expired'])

export const subscriptionFields = ({
  customerId,
  subscriptionId,
  status,
  tier
}: SubscriptionState) => {
  const active = isActiveStatus(status)
  return {
    stripeCustomerId: customerId,
    subscriptionStatus: status,
    active,
    ...(subscriptionId === null
      ? {}
      : { stripeSubscriptionId: subscriptionId }),
    ...(ENDED.has(status) ? { tier: null } : {}),
    ...(active && tier !== null ? { tier, pro: true } : {})
  }
}
