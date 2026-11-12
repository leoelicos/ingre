/*
 * Firebase Auth: the ingré user behind a verified Firebase identity. The only place that
 * finds, links or creates a user for Firebase; the auth code (context.ts) calls just
 * findOrCreateUserByFirebase. The user's public id stays the app user id, so the Paddle
 * and RevenueCat webhooks, customData.ingre_user_id and the web SDK's appUserId are
 * unchanged; Firebase only says who is signing in.
 */
import { db } from '../postgres/db'
import type { SqlClient } from '../postgres/sql'
import type { User } from '../schemas/types'
import type { FirebaseIdentity } from '../utils/firebase'
import { isPublicId } from '../utils/publicId'
import { selectUser, updateUserReturning, type UserRecord } from './userRows'

const toUser = (user: UserRecord): User => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  pro: user.pro,
  savedRecipes: user.savedRecipes,
  numSavedRecipes: user.numSavedRecipes
})

const findLinked = (sql: SqlClient, uid: string) =>
  selectUser(sql, 'u.firebase_uid = $1', [uid])

/**
 * Links the one unlinked account with this email (emails compare without case:
 * Firebase lower-cases them, old accounts may not be), and with this public id when
 * one is given, to the uid.
 */
const link = (
  sql: SqlClient,
  { uid, email }: { uid: string; email: string },
  publicId: string | null
) =>
  updateUserReturning(
    sql,
    `update users set firebase_uid = $1
     where id = (
       select id from users
       where lower(email) = lower($2) and firebase_uid is null
         and ($3::text is null or public_id = $3)
       order by id limit 1
     )
     returning id`,
    [uid, email, publicId]
  )

/** First word of the Firebase display name, then the rest; the email's name without one. */
export const namesOf = (name: string | null, email: string) => {
  const [first, ...rest] = (name ?? '').trim().split(/\s+/).filter(Boolean)
  return {
    firstName: first ?? email.replace(/@.*/, ''),
    lastName: rest.join(' ')
  }
}

/** A new user; a second request racing the first finds the user the first made. */
const create = async (
  sql: SqlClient,
  uid: string,
  email: string,
  name: string | null
) => {
  const { firstName, lastName } = namesOf(name, email)
  const created = await updateUserReturning(
    sql,
    `insert into users (email, firebase_uid, first_name, last_name)
     values ($1, $2, $3, $4)
     on conflict do nothing
     returning id`,
    [email, uid, firstName, lastName]
  )
  return created ?? findLinked(sql, uid)
}

/**
 * Who a Firebase identity is: the user already linked to its uid; else the account the
 * password import gave this uid (its public id, same email); else the unlinked account
 * with this email when Firebase has verified it; else a new user. Null when the token
 * has no email, or its email belongs to an account it may not claim (unverified, or
 * linked to another uid), so nobody takes over an account by signing up with its email.
 */
export const findOrCreateUserByFirebase = async (
  { uid, email, emailVerified, name }: FirebaseIdentity,
  sql: SqlClient = db()
): Promise<User | null> => {
  const linked = await findLinked(sql, uid)
  if (linked) return toUser(linked)
  if (!email) return null
  const imported = isPublicId(uid) ? await link(sql, { uid, email }, uid) : null
  if (imported) return toUser(imported)
  const verified = emailVerified ? await link(sql, { uid, email }, null) : null
  if (verified) return toUser(verified)
  // an account linked to this uid meanwhile is a racing first request: create finds it
  const [taken] = await sql.query(
    `select 1 from users
     where lower(email) = lower($1) and firebase_uid is distinct from $2
     limit 1`,
    [email, uid]
  )
  if (taken) return null
  const user = await create(sql, uid, email, name)
  return user ? toUser(user) : null
}
