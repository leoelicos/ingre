/*
 * Firebase Auth: an in-memory stand-in for firebase/auth (jest.config.js
 * moduleNameMapper), so tests never load the SDK or reach Google. `fakeFirebase` seeds
 * the accounts and the Google account a test signs in with.
 */

export interface FakeUser {
  email: string
  displayName: string | null
  refreshed: boolean
  getIdToken: (forceRefresh?: boolean) => Promise<string>
}

export interface FakeAuth {
  currentUser: FakeUser | null
  authStateReady: () => Promise<void>
}

type Listener = (user: FakeUser | null) => void

const passwords = new Map<string, string>()
const listeners = new Set<Listener>()
let google: { email: string; name: string } | null = null
const auth: FakeAuth = {
  currentUser: null,
  authStateReady: () => Promise.resolve()
}

const makeUser = (email: string, displayName: string | null): FakeUser => {
  const user: FakeUser = {
    email,
    displayName,
    refreshed: false,
    getIdToken: async (forceRefresh = false) => {
      user.refreshed = user.refreshed || forceRefresh
      return `id-token:${email}`
    }
  }
  return user
}

const signIn = (user: FakeUser | null) => {
  auth.currentUser = user
  listeners.forEach((listener) => listener(user))
  return { user }
}

const refuse = (code: string) => Promise.reject(new Error(code))

export class GoogleAuthProvider {}

export const getAuth = (): FakeAuth => auth

export const onAuthStateChanged = (_auth: FakeAuth, listener: Listener) => {
  listeners.add(listener)
  listener(auth.currentUser)
  return () => {
    listeners.delete(listener)
  }
}

export const signInWithEmailAndPassword = (
  _auth: FakeAuth,
  email: string,
  password: string
) =>
  passwords.get(email) === password
    ? Promise.resolve(signIn(makeUser(email, null)))
    : refuse('auth/invalid-credential')

export const createUserWithEmailAndPassword = (
  _auth: FakeAuth,
  email: string,
  password: string
) => {
  if (passwords.has(email)) return refuse('auth/email-already-in-use')
  passwords.set(email, password)
  return Promise.resolve(signIn(makeUser(email, null)))
}

export const signInWithPopup = () =>
  google === null
    ? refuse('auth/popup-closed-by-user')
    : Promise.resolve(signIn(makeUser(google.email, google.name)))

export const updateProfile = async (
  user: FakeUser,
  { displayName }: { displayName: string }
) => {
  user.displayName = displayName
}

export const signOut = async () => {
  signIn(null)
}

export const fakeFirebase = {
  auth,
  /** Nobody signed in, no accounts, no Google account, no listeners. */
  reset: () => {
    passwords.clear()
    listeners.clear()
    google = null
    auth.currentUser = null
  },
  addAccount: (email: string, password: string) => {
    passwords.set(email, password)
  },
  setGoogleAccount: (email: string, name: string) => {
    google = { email, name }
  },
  /** A session Firebase saved earlier, signed in without telling anyone. */
  restoreSession: (email: string) => {
    auth.currentUser = makeUser(email, null)
  }
}
