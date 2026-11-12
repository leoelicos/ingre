/*
 * The id every outside system holds for a user or recipe: 24 lower-case hex digits,
 * the shape of the Mongo ObjectIds it started as. RevenueCat app_user_id, Paddle
 * ingre_user_id, Apple's appAccountToken (zero padded) and Google's obfuscated account
 * id all carry it, so new ids keep the same shape (Postgres generates them).
 */
const PUBLIC_ID = /^[0-9a-f]{24}$/

/** The id, lower-cased, when it has the public id shape; else null. */
export const publicIdOf = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const id = value.toLowerCase()
  return PUBLIC_ID.test(id) ? id : null
}

export const isPublicId = (value: unknown): value is string =>
  typeof value === 'string' && PUBLIC_ID.test(value)
