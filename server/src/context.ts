import { createDataSources } from './datasources'
import { findOrCreateUserByFirebase } from './datasources/firebaseUser'
import { getJwtSecret, readUserFromAuthHeader } from './utils/auth'
import {
  firebaseVerifier,
  type FirebaseIdentity,
  type VerifyIdToken
} from './utils/firebase'
import type { MyContext, User } from './schemas/types'

type RequestHeaders = {
  authorization?: string | undefined
  referer?: string | undefined
}

/** Finds, links or creates the ingré user for a verified Firebase identity. */
export type FindUserByFirebase = (
  identity: FirebaseIdentity
) => Promise<User | null>

let processVerifier: VerifyIdToken | null | undefined
/** Firebase Auth: firebase-admin is set up once, on the first request. */
export const defaultVerifier = (): VerifyIdToken | null => {
  if (processVerifier === undefined)
    processVerifier = firebaseVerifier(process.env)
  return processVerifier
}

const bearerOf = (authorization: string | undefined): string | null =>
  authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length) || null
    : null

/**
 * The signed-in user. A Firebase ID token is the way in; the legacy JWT is accepted
 * too during the move (TRANSITION, Firebase Auth: the native apps and sessions from
 * before it still send one). Remove the JWT branch once every client uses Firebase.
 */
export const userOfAuthorization = async (
  authorization: string | undefined,
  verify: VerifyIdToken | null,
  // the data store seam: Mongo today, Postgres after the cutover
  findUser: FindUserByFirebase = findOrCreateUserByFirebase
): Promise<User | null> => {
  const secret = getJwtSecret()
  const legacy = secret ? readUserFromAuthHeader(authorization, secret) : null
  if (legacy) return legacy
  const token = bearerOf(authorization)
  if (token === null || verify === null) return null
  try {
    return await findUser(await verify(token))
  } catch (error) {
    console.warn('Firebase sign-in refused', error)
    return null
  }
}

/** Builds the per-request GraphQL context from HTTP headers. */
export const buildContext = async (
  headers: RequestHeaders,
  dataSources: MyContext['dataSources'] = createDataSources(),
  verify: VerifyIdToken | null = defaultVerifier()
): Promise<MyContext> => {
  const user = await userOfAuthorization(headers.authorization, verify)
  return {
    dataSources,
    ...(user ? { user } : {}),
    ...(headers.referer ? { headers: { referer: headers.referer } } : {})
  }
}
