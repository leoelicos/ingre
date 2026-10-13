import { AuthenticationError } from '../errors'
import type { User } from '../schemas/types'

/** Returns the authenticated user or throws AuthenticationError. */
export const requireUser = (user: User | undefined): User => {
  if (!user) throw new AuthenticationError()
  return user
}
