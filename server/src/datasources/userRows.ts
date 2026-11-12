/*
 * Users in Postgres: the row → User mapping and the column names the write helpers may
 * set. Column names only ever come from USER_COLUMNS, never from input; values are
 * always parameters.
 */
import { z } from 'zod'
import { ENTITLEMENT_SOURCES } from '../payments/entitlement'
import type { Row, SqlClient } from '../postgres/sql'
import { TIERS } from '../utils/tiers'

/** The user and their saved recipes' public ids, in saved order. */
export const USER_SELECT = `
  select u.*,
    array(
      select r.public_id from saved_recipes s
      join recipes r on r.id = s.recipe_id
      where s.user_id = u.id order by s.position
    ) as saved_ids
  from users u`

const text = z.string().nullable()
const date = z.date().nullable()

const userRow = z.object({
  id: z.coerce.number(),
  public_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  password_hash: text,
  firebase_uid: text,
  pro: z.boolean(),
  tier: z.enum(TIERS).nullable(),
  stripe_customer_id: text,
  stripe_subscription_id: text,
  subscription_status: text,
  active: z.boolean(),
  store_platform: z.enum(['APPLE', 'GOOGLE']).nullable(),
  store_product_id: text,
  store_id: text,
  store_expires_at: date,
  entitlement_source: z.enum(ENTITLEMENT_SOURCES).nullable(),
  entitlement_subscription_id: text,
  entitlement_product_id: text,
  entitlement_interval: z.enum(['month', 'year']).nullable(),
  entitlement_expires_at: date,
  entitlement_updated_at: date,
  paddle_customer_id: text,
  saved_ids: z.array(z.string())
})

/** A user as the datasources return them (the GraphQL User fields and more). */
export const toUserRecord = (row: Row) => {
  const user = userRow.parse(row)
  return {
    /** the internal row id, for joins only; never leaves the server */
    rowId: user.id,
    _id: user.public_id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    passwordHash: user.password_hash,
    firebaseUid: user.firebase_uid,
    pro: user.pro,
    tier: user.tier,
    stripeCustomerId: user.stripe_customer_id,
    stripeSubscriptionId: user.stripe_subscription_id,
    subscriptionStatus: user.subscription_status,
    active: user.active,
    storePlatform: user.store_platform,
    storeProductId: user.store_product_id,
    storeId: user.store_id,
    storeExpiresAt: user.store_expires_at,
    entitlementSource: user.entitlement_source,
    entitlementSubscriptionId: user.entitlement_subscription_id,
    entitlementProductId: user.entitlement_product_id,
    entitlementInterval: user.entitlement_interval,
    entitlementExpiresAt: user.entitlement_expires_at,
    entitlementUpdatedAt: user.entitlement_updated_at,
    paddleCustomerId: user.paddle_customer_id,
    savedRecipes: user.saved_ids,
    numSavedRecipes: user.saved_ids.length
  }
}
export type UserRecord = ReturnType<typeof toUserRecord>

/** The fields a write may set, and their columns. */
export const USER_COLUMNS = {
  pro: 'pro',
  tier: 'tier',
  stripeCustomerId: 'stripe_customer_id',
  stripeSubscriptionId: 'stripe_subscription_id',
  subscriptionStatus: 'subscription_status',
  active: 'active',
  storePlatform: 'store_platform',
  storeProductId: 'store_product_id',
  storeId: 'store_id',
  storeExpiresAt: 'store_expires_at',
  entitlementSource: 'entitlement_source',
  entitlementSubscriptionId: 'entitlement_subscription_id',
  entitlementProductId: 'entitlement_product_id',
  entitlementInterval: 'entitlement_interval',
  entitlementExpiresAt: 'entitlement_expires_at',
  entitlementUpdatedAt: 'entitlement_updated_at',
  paddleCustomerId: 'paddle_customer_id',
  firebaseUid: 'firebase_uid'
} as const

/**
 * `col = $n, …` for the given fields, numbered from `first`, and their values. A field
 * with no column is a bug, so it throws rather than being dropped.
 */
export const assignments = (
  fields: Readonly<Record<string, unknown>>,
  first = 1
): { text: string; values: unknown[] } => {
  const columns = new Map<string, string>(Object.entries(USER_COLUMNS))
  const parts: string[] = []
  const values: unknown[] = []
  for (const [field, value] of Object.entries(fields)) {
    const column = columns.get(field)
    if (column === undefined) throw new Error(`No column for ${field}`)
    values.push(value)
    parts.push(`${column} = $${first + values.length - 1}`)
  }
  return { text: parts.join(', '), values }
}

/** The users matching `where` (with `$1…` parameters). */
export const selectUsers = async (
  sql: SqlClient,
  where: string,
  params: ReadonlyArray<unknown>
): Promise<UserRecord[]> =>
  (await sql.query(`${USER_SELECT} where ${where}`, params)).map(toUserRecord)

/** The one user matching `where`, or null. */
export const selectUser = async (
  sql: SqlClient,
  where: string,
  params: ReadonlyArray<unknown>
): Promise<UserRecord | null> =>
  (await selectUsers(sql, `${where} limit 1`, params))[0] ?? null

/** Runs an update returning ids, then reads the user back (with saved ids). */
export const updateUserReturning = async (
  sql: SqlClient,
  update: string,
  params: ReadonlyArray<unknown>
): Promise<UserRecord | null> => {
  const [row] = await sql.query(update, params)
  return row ? selectUser(sql, 'u.id = $1', [row['id']]) : null
}
