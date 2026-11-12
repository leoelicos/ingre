/*
 * Firebase Auth: sign-in (Google, email and password) and the ID token the API checks.
 * Firebase holds the passwords and sessions. Off until the VITE_FIREBASE_* values are
 * set (.env.example); the legacy password login is used while it is off.
 */
import { initializeApp, type FirebaseOptions } from 'firebase/app'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type Auth
} from 'firebase/auth'

/** The web app's Firebase config as JSON, injected by Vite (vite.config.mts). */
declare const __FIREBASE_CONFIG__: string

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const text = (value: unknown): string =>
  typeof value === 'string' ? value : ''

/** The config, or null unless the API key, auth domain, project and app id are all set. */
export const firebaseConfigOf = (raw: string): FirebaseOptions | null => {
  let parsed: unknown = null
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isRecord(parsed)) return null
  const config = {
    apiKey: text(parsed['apiKey']),
    authDomain: text(parsed['authDomain']),
    projectId: text(parsed['projectId']),
    appId: text(parsed['appId'])
  }
  return Object.values(config).every((value) => value !== '') ? config : null
}

let auth: Auth | null | undefined

/** The app's Firebase Auth, set up on first use; null when Firebase is off. */
export const firebaseAuth = (
  raw: string = __FIREBASE_CONFIG__
): Auth | null => {
  if (auth === undefined) {
    const config = firebaseConfigOf(raw)
    auth = config === null ? null : getAuth(initializeApp(config))
  }
  return auth
}

/** Forgets the set-up Auth (tests only). */
export const resetFirebaseAuth = (): void => {
  auth = undefined
}

export const firebaseEnabled = (): boolean => firebaseAuth() !== null

/**
 * Calls onRestored when a saved Firebase session loads, and onSignedOut whenever nobody
 * is signed in. A sign-in on the login or signup page reports itself, once the API has
 * accepted it (useFirebaseSignIn). Returns the unsubscribe.
 */
export const onFirebaseSession = (
  onRestored: () => void,
  onSignedOut: () => void
): (() => void) => {
  const current = firebaseAuth()
  if (current === null) return () => undefined
  let first = true
  return onAuthStateChanged(current, (user) => {
    if (user === null) onSignedOut()
    else if (first) onRestored()
    first = false
  })
}

/**
 * The signed-in user's Firebase ID token (refreshed by the SDK before it expires), or
 * null. Waits for a saved session to load, so the first request after a reload has it.
 */
export const firebaseIdToken = async (): Promise<string | null> => {
  const current = firebaseAuth()
  if (current === null) return null
  await current.authStateReady()
  const user = current.currentUser
  return user === null ? null : user.getIdToken()
}

const requireAuth = (): Auth => {
  const current = firebaseAuth()
  if (current === null) throw new Error('Firebase is not set up')
  return current
}

export const signInWithGoogle = async (): Promise<void> => {
  await signInWithPopup(requireAuth(), new GoogleAuthProvider())
}

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<void> => {
  await signInWithEmailAndPassword(requireAuth(), email, password)
}

/**
 * A new Firebase account with the name on it, so the API's new user is named; the
 * token is refreshed so its `name` claim is there on the first request.
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<void> => {
  const { user } = await createUserWithEmailAndPassword(
    requireAuth(),
    email,
    password
  )
  await updateProfile(user, { displayName })
  await user.getIdToken(true)
}

export const signOutOfFirebase = async (): Promise<void> => {
  const current = firebaseAuth()
  if (current !== null) await signOut(current)
}
