import jwtDecode from 'jwt-decode'
import { useQuery } from '@apollo/client'
import { GET_USER } from '../../lib/apollo/graphQL/queries'

/** The signed-in user's id and email from the stored token, or null. */
export interface SignedInUser {
  readonly id: string
  readonly email: string | null
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const userOfToken = (token: string | null): SignedInUser | null => {
  if (token === null) return null
  try {
    const payload: unknown = jwtDecode(token)
    const data = isRecord(payload) ? payload['data'] : null
    if (!isRecord(data) || typeof data['_id'] !== 'string') return null
    return {
      id: data['_id'],
      email: typeof data['email'] === 'string' ? data['email'] : null
    }
  } catch {
    return null
  }
}

export const signedInUser = (): SignedInUser | null =>
  userOfToken(localStorage.getItem('id_token'))

/**
 * Firebase Auth: the signed-in user's ingré id (the public id that Paddle's custom data
 * and RevenueCat's appUserId use) and email. A legacy session carries them in its token;
 * a Firebase one asks the API (getUser), since the Firebase uid is not the app user id.
 */
export const useSignedInUser = (loggedIn: boolean): SignedInUser | null => {
  const legacy = loggedIn ? signedInUser() : null
  const { data } = useQuery(GET_USER, { skip: !loggedIn || legacy !== null })
  if (!loggedIn) return null
  if (legacy !== null) return legacy
  return data ? { id: data.getUser._id, email: data.getUser.email } : null
}
