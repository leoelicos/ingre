/*
 * Firebase Auth: the ingré user behind a verified Firebase identity. The only place that
 * finds, links or creates a user for Firebase; the auth code (context.ts) calls just
 * findOrCreateUserByFirebase, so a Postgres version can replace this file alone. The Mongo _id stays
 * the app user id, so the Paddle and RevenueCat webhooks, customData.ingre_user_id and
 * the web SDK's appUserId are unchanged; Firebase only says who is signing in.
 */
import { Types } from 'mongoose'
import { User as UserModel } from '../models/User'
import type { User } from '../schemas/types'
import type { FirebaseIdentity } from '../utils/firebase'

/** Emails compare without case (Firebase lower-cases them; old accounts may not be). */
const CASELESS = { locale: 'en', strength: 2 }
/** A Firebase uid set to the Mongo id by the password import (docs/AUTH.md). */
const MONGO_ID = /^[0-9a-f]{24}$/
const UNLINKED = { $exists: false }
const DUPLICATE_KEY = 11000

interface Linked {
  _id: Types.ObjectId
  firstName: string
  lastName: string
  email: string
  pro: boolean
  savedRecipes: Types.ObjectId[]
}

const toUser = (doc: Linked): User => ({
  _id: doc._id,
  firstName: doc.firstName,
  lastName: doc.lastName,
  email: doc.email,
  pro: doc.pro,
  savedRecipes: doc.savedRecipes,
  numSavedRecipes: doc.savedRecipes.length
})

const findLinked = (uid: string) =>
  UserModel.findOne({ firebaseUid: uid }).lean<Linked>()

/** Links the one unlinked account with this email (and filter) to the uid. */
const link = (
  { uid, email }: { uid: string; email: string },
  filter: { _id?: Types.ObjectId }
) =>
  UserModel.findOneAndUpdate(
    { ...filter, email, firebaseUid: UNLINKED },
    { $set: { firebaseUid: uid } },
    { new: true, collation: CASELESS }
  ).lean<Linked>()

/** First word of the Firebase display name, then the rest; the email's name without one. */
export const namesOf = (name: string | null, email: string) => {
  const [first, ...rest] = (name ?? '').trim().split(/\s+/).filter(Boolean)
  return {
    firstName: first ?? email.replace(/@.*/, ''),
    lastName: rest.join(' ')
  }
}

const isDuplicateKey = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === DUPLICATE_KEY

/** A new user; a second request racing the first finds the user the first made. */
const create = async (uid: string, email: string, name: string | null) => {
  try {
    const doc = await UserModel.create({
      email,
      firebaseUid: uid,
      ...namesOf(name, email)
    })
    return toUser({
      _id: doc._id,
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      pro: doc.pro,
      savedRecipes: []
    })
  } catch (error) {
    if (!isDuplicateKey(error)) throw error
    const raced = await findLinked(uid)
    return raced ? toUser(raced) : null
  }
}

/**
 * Who a Firebase identity is: the user already linked to its uid; else the account the
 * password import gave this uid (its Mongo id, same email); else the unlinked account
 * with this email when Firebase has verified it; else a new user. Null when the token
 * has no email, or its email belongs to an account it may not claim (unverified, or
 * linked to another uid), so nobody takes over an account by signing up with its email.
 */
export const findOrCreateUserByFirebase = async ({
  uid,
  email,
  emailVerified,
  name
}: FirebaseIdentity): Promise<User | null> => {
  const linked = await findLinked(uid)
  if (linked) return toUser(linked)
  if (!email) return null
  const imported = MONGO_ID.test(uid)
    ? await link({ uid, email }, { _id: new Types.ObjectId(uid) })
    : null
  if (imported) return toUser(imported)
  const verified = emailVerified ? await link({ uid, email }, {}) : null
  if (verified) return toUser(verified)
  // an account linked to this uid meanwhile is a racing first request: create finds it
  const taken = UserModel.exists({ email, firebaseUid: { $ne: uid } })
  if (await taken.collation(CASELESS)) return null
  return create(uid, email, name)
}
