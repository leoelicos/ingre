/*
 * Users in Postgres (`users`, and `saved_recipes` for the recipes they kept). Users are
 * found by their public id (`_id`), never by the internal row id.
 */
import bcrypt from 'bcrypt'
import { ConflictError, NotFoundError } from '../errors'
import type { StoreState } from '../store/common'
import { UserInput } from '../schemas/types'
import { isActiveStatus, type Tier } from '../utils/tiers'
import { selectRecipes } from './recipe'
import { SqlStore } from './sqlStore'
import {
  assignments,
  selectUser,
  updateUserReturning,
  type UserRecord
} from './userRows'

/** The columns a user is looked up by when one is updated. */
type UserKey = 'public_id' | 'stripe_customer_id' | 'store_id'

const SALT_ROUNDS = 10
/** What the Mongoose model enforced; Firebase users have no password at all. */
export const MIN_PASSWORD_LENGTH = 5

/** The recipes a user saved, in saved order, with their lines. */
const SAVED_RECIPES = `from recipes r
  join saved_recipes s on s.recipe_id = r.id
  join users u on u.id = s.user_id
  where u.public_id = $1 order by s.position`

export class UserApi extends SqlStore {
  /** The user with their saved recipes in full (the `getUser` query). */
  public async findOneUserById({ id }: { id: string }) {
    const user = await selectUser(this.sql, 'u.public_id = $1', [id])
    if (user === null) return null
    const savedRecipes = await selectRecipes(this.sql, SAVED_RECIPES, [id])
    return { ...user, savedRecipes }
  }

  public async getUserSavedRecipes({ id }: { id: string }) {
    const user = await selectUser(this.sql, 'u.public_id = $1', [id])
    return user === null ? null : selectRecipes(this.sql, SAVED_RECIPES, [id])
  }

  public findOneUser({ email }: { email: string }) {
    return selectUser(this.sql, 'u.email = $1', [email])
  }

  /** Saves a recipe at the end of the user's list; saving it twice keeps one. */
  public addRecipeToUser({
    userId,
    recipeId
  }: {
    userId: string
    recipeId: string
  }) {
    return updateUserReturning(
      this.sql,
      `with target as (select id from users where public_id = $1),
       recipe as (select id from recipes where public_id = $2),
       saved as (
         insert into saved_recipes (user_id, recipe_id, position)
         select target.id, recipe.id, coalesce(
           (select max(position) + 1 from saved_recipes
            where user_id = target.id), 0)
         from target, recipe
         on conflict do nothing
       )
       select id from target`,
      [userId, recipeId]
    )
  }

  public removeRecipeFromUser({
    userId,
    recipeId
  }: {
    userId: string
    recipeId: string
  }) {
    return updateUserReturning(
      this.sql,
      `with target as (select id from users where public_id = $1),
       removed as (
         delete from saved_recipes s using target, recipes r
         where s.user_id = target.id and s.recipe_id = r.id
           and r.public_id = $2
       )
       select id from target`,
      [userId, recipeId]
    )
  }

  public async createUser({
    email,
    password,
    firstName,
    lastName
  }: UserInput): Promise<UserRecord> {
    if (password.length < MIN_PASSWORD_LENGTH)
      throw new Error(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      )
    const user = await updateUserReturning(
      this.sql,
      `insert into users (email, password_hash, first_name, last_name)
       values ($1, $2, $3, $4) returning id`,
      [
        email,
        await bcrypt.hash(password, SALT_ROUNDS),
        firstName.trim(),
        lastName.trim()
      ]
    )
    if (user === null) throw new Error('User not created')
    return user
  }

  public async checkUserPassword({
    email,
    password
  }: {
    email: string
    password: string
  }) {
    const user = await this.findOneUser({ email })
    if (user === null || user.passwordHash === null) return null
    return (await bcrypt.compare(password, user.passwordHash)) ? user : null
  }

  /** `tier` is set only when one was bought (#208); the old flow keeps what it had. */
  public async makeUserPro({
    _id,
    tier = null
  }: {
    _id: string
    tier?: Tier | null
  }) {
    const user = await this.update(
      'public_id',
      _id,
      tier ? { pro: true, tier } : { pro: true }
    )
    if (!user) throw new NotFoundError('User not found')
    return user
  }

  /** #312: who to bill, and the Stripe Customer and subscription they already have. */
  public async findBilling(_id: string) {
    const user = await selectUser(this.sql, 'u.public_id = $1', [_id])
    if (!user) throw new NotFoundError('User not found')
    return {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      customerId: user.stripeCustomerId,
      subscriptionId: user.stripeSubscriptionId
    }
  }

  /**
   * #312: what Stripe says about the user's subscription. `tier` is kept while active and
   * cleared once the subscription ends; a failed payment leaves the tier but not `active`.
   */
  public setSubscription(
    filter: { _id: string } | { stripeCustomerId: string },
    subscription: SubscriptionState
  ) {
    return '_id' in filter
      ? this.update('public_id', filter._id, subscriptionFields(subscription))
      : this.update(
          'stripe_customer_id',
          filter.stripeCustomerId,
          subscriptionFields(subscription)
        )
  }

  /**
   * #314: a purchase the signed-in user's app sent, after the store confirmed it. A
   * subscription already tied to another user is refused, so one purchase can't unlock
   * two accounts.
   */
  public async setStoreSubscription(_id: string, state: StoreState) {
    const owners = [state.storeId, state.replacesStoreId].filter(
      (id): id is string => id !== null
    )
    const [taken] = await this.sql.query(
      `select 1 from users
       where public_id <> $1 and store_id = any($2::text[]) limit 1`,
      [_id, owners]
    )
    if (taken)
      throw new ConflictError('This purchase belongs to another account')
    const user = await this.update('public_id', _id, storeFields(state))
    if (!user) throw new NotFoundError('User not found')
    return user
  }

  /**
   * #314: a store notification. The user is the one holding this subscription, else the
   * one holding the subscription it replaced (an upgrade or downgrade on Google Play),
   * else (for an active subscription) the account the app tied the purchase to. Null
   * when nobody matches.
   */
  public async applyStoreNotification(state: StoreState) {
    const filters: Array<[UserKey, string]> = [['store_id', state.storeId]]
    if (state.replacesStoreId !== null)
      filters.push(['store_id', state.replacesStoreId])
    // only a live purchase may claim an account this way, so a notice about an old,
    // replaced token can't switch the account off
    if (state.accountUserId !== null && state.status === 'active')
      filters.push(['public_id', state.accountUserId])
    for (const [column, value] of filters) {
      const user = await this.update(column, value, storeFields(state))
      if (user) return user
    }
    return null
  }

  /** Sets fields on the first user whose `column` is `value`; null when none is. */
  private update(
    column: UserKey,
    value: string,
    fields: Readonly<Record<string, unknown>>
  ) {
    const set = assignments(fields, 2)
    return updateUserReturning(
      this.sql,
      `update users set ${set.text}
       where id = (select id from users where ${column} = $1 order by id limit 1)
       returning id`,
      [value, ...set.values]
    )
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

/** #312, #314: one rule for every payment route: `active`, and when the tier is kept. */
export const activationFields = (status: string, tier: Tier | null) => {
  const active = isActiveStatus(status)
  return {
    subscriptionStatus: status,
    active,
    ...(ENDED.has(status) ? { tier: null } : {}),
    ...(active && tier !== null ? { tier, pro: true } : {})
  }
}

export const subscriptionFields = ({
  customerId,
  subscriptionId,
  status,
  tier
}: SubscriptionState) => ({
  stripeCustomerId: customerId,
  ...(subscriptionId === null ? {} : { stripeSubscriptionId: subscriptionId }),
  ...activationFields(status, tier)
})

/** #314: a verified store subscription as User fields. */
export const storeFields = (state: StoreState) => ({
  storePlatform: state.platform,
  storeProductId: state.productId,
  storeId: state.storeId,
  storeExpiresAt: state.expiresAt,
  ...activationFields(state.status, state.tier)
})
