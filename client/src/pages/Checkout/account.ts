import jwtDecode from 'jwt-decode'

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
