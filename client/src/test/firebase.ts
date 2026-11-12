import { firebaseAuth, resetFirebaseAuth } from '../utils/auth/firebase'
import { fakeFirebase } from './firebaseFake'

/** Placeholder web config: never a real project. */
export const TEST_FIREBASE_CONFIG = JSON.stringify({
  apiKey: 'placeholder-not-a-real-key',
  authDomain: 'ingre-test.firebaseapp.com',
  projectId: 'ingre-test',
  appId: '1:000000000000:web:placeholder'
})

/** Firebase Auth on (the in-memory fake), with nobody signed in. */
export const startFakeFirebase = (): void => {
  fakeFirebase.reset()
  resetFirebaseAuth()
  firebaseAuth(TEST_FIREBASE_CONFIG)
}

/** Firebase Auth off again, as in every other test. */
export const stopFakeFirebase = (): void => {
  fakeFirebase.reset()
  resetFirebaseAuth()
}
