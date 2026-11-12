/*
 * Firebase Auth: the server only checks Firebase ID tokens; Firebase holds the passwords,
 * Google sign-in and sessions. Off (null) until FIREBASE_SERVICE_ACCOUNT_JSON is set.
 */
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

type Env = Readonly<Record<string, string | undefined>>

/** What the API needs from a verified Firebase ID token. */
export interface FirebaseIdentity {
  readonly uid: string
  readonly email: string | null
  readonly emailVerified: boolean
  readonly name: string | null
}

/** Resolves a verified identity, or rejects when the token is invalid or expired. */
export type VerifyIdToken = (token: string) => Promise<FirebaseIdentity>

export interface ServiceAccount {
  readonly projectId: string
  readonly clientEmail: string
  readonly privateKey: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const str = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** The service account key JSON, as is or base64 encoded (easier to paste into Render). */
export const serviceAccountOf = (
  raw: string | undefined
): ServiceAccount | null => {
  if (!raw) return null
  for (const text of [raw, Buffer.from(raw, 'base64').toString('utf8')]) {
    const parsed = parseJson(text)
    if (!isRecord(parsed)) continue
    const projectId = str(parsed['project_id'])
    const clientEmail = str(parsed['client_email'])
    const privateKey = str(parsed['private_key'])
    if (projectId && clientEmail && privateKey)
      return { projectId, clientEmail, privateKey }
  }
  return null
}

/** The claims the API reads from a decoded ID token (Firebase always sets uid). */
export const identityOf = (
  claims: Readonly<Record<string, unknown>>
): FirebaseIdentity => ({
  uid: str(claims['uid']) ?? '',
  email: str(claims['email']),
  emailVerified: claims['email_verified'] === true,
  name: str(claims['name'])
})

/** The part of firebase-admin's Auth the API uses (a seam for tests). */
export interface IdTokenChecker {
  verifyIdToken(token: string): Promise<Readonly<Record<string, unknown>>>
}

/** firebase-admin's Auth, on one Firebase Admin app per process. */
export const adminAuth = (account: ServiceAccount): IdTokenChecker =>
  getAuth(
    getApps()[0] ??
      initializeApp({ credential: cert(account), projectId: account.projectId })
  )

/**
 * Checks ID tokens with firebase-admin; null when Firebase isn't configured. Revocation
 * isn't checked per request (that is a call to Google each time): a revoked or disabled
 * account's token keeps working until it expires, at most an hour.
 */
export const firebaseVerifier = (
  env: Env,
  connect: (account: ServiceAccount) => IdTokenChecker = adminAuth
): VerifyIdToken | null => {
  const account = serviceAccountOf(env['FIREBASE_SERVICE_ACCOUNT_JSON'])
  if (!account) return null
  const auth = connect(account)
  return async (token) => identityOf(await auth.verifyIdToken(token))
}
