import jwt from 'jsonwebtoken'
import { z } from 'zod'
import dotenv from 'dotenv'
import { User } from '../schemas/types'

dotenv.config()
const expiration = '1h'

/** A user's or recipe's public id (utils/publicId.ts), lower-cased. */
const publicId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .transform((value) => value.toLowerCase())

/** Shape of `data` in tokens produced by signToken. */
const tokenUserSchema = z.object({
  _id: publicId,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  pro: z.boolean().default(false),
  savedRecipes: z
    .array(
      z.union([
        publicId,
        z.object({ _id: publicId }).transform(({ _id }) => _id)
      ])
    )
    .default([]),
  numSavedRecipes: z.number().default(0)
})

const tokenPayloadSchema = z.object({ data: tokenUserSchema })

export const getJwtSecret = (): string | null =>
  process.env['HEROKU_JWT_SECRET'] || process.env['JWT_SECRET'] || null

/**
 * Verifies a `Bearer <jwt>` header and returns the user it carries,
 * or null when the header is missing, malformed, expired or invalid.
 */
export const readUserFromAuthHeader = (
  authorization: string | undefined,
  secret: string
): User | null => {
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null
  if (!token) return null
  try {
    const payload = jwt.verify(token, secret, { maxAge: expiration })
    const parsed = tokenPayloadSchema.safeParse(payload)
    return parsed.success ? parsed.data.data : null
  } catch {
    return null
  }
}

type SignableUser = {
  _id: string
  firstName: string
  lastName: string
  email: string
  pro: boolean
  savedRecipes: ReadonlyArray<{ _id: string } | string>
}

/** Signs a token carrying only the public user fields (never the password hash). */
export const signToken = (user: SignableUser): string => {
  const secret = getJwtSecret()
  if (!secret) throw new Error('no secret')
  const data = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    pro: user.pro,
    savedRecipes: user.savedRecipes.map((r) =>
      typeof r === 'string' ? r : r._id
    ),
    numSavedRecipes: user.savedRecipes.length
  }
  return jwt.sign({ data }, secret, { expiresIn: expiration })
}
