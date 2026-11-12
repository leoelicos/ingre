import {
  firebaseAuth,
  firebaseConfigOf,
  firebaseEnabled,
  firebaseIdToken,
  onFirebaseSession,
  signInWithEmail,
  signInWithGoogle,
  signOutOfFirebase,
  signUpWithEmail
} from '../firebase'
import { fakeFirebase } from '../../../test/firebaseFake'
import {
  TEST_FIREBASE_CONFIG,
  stopFakeFirebase,
  startFakeFirebase
} from '../../../test/firebase'

/* Firebase Auth: sign-in through the SDK (the in-memory fake in tests). */

describe('firebaseConfigOf', () => {
  it('needs the API key, auth domain, project and app id', () => {
    expect(firebaseConfigOf(TEST_FIREBASE_CONFIG)).toEqual(
      JSON.parse(TEST_FIREBASE_CONFIG)
    )
    expect(firebaseConfigOf('')).toBeNull()
    expect(firebaseConfigOf('null')).toBeNull()
    expect(
      firebaseConfigOf(JSON.stringify({ apiKey: 'k', authDomain: 'd' }))
    ).toBeNull()
    expect(
      firebaseConfigOf(
        JSON.stringify({ ...JSON.parse(TEST_FIREBASE_CONFIG), appId: 7 })
      )
    ).toBeNull()
  })
})

describe('Firebase off (no config)', () => {
  beforeEach(stopFakeFirebase)

  it('signs nobody in and refuses to sign in', async () => {
    expect(firebaseAuth()).toBeNull()
    expect(firebaseEnabled()).toBe(false)
    expect(await firebaseIdToken()).toBeNull()
    const restored = jest.fn()
    onFirebaseSession(restored, restored)()
    expect(restored).not.toHaveBeenCalled()
    await expect(signInWithGoogle()).rejects.toThrow('not set up')
    await expect(signOutOfFirebase()).resolves.toBeUndefined()
  })
})

describe('Firebase on', () => {
  beforeEach(startFakeFirebase)
  afterEach(stopFakeFirebase)

  it('is set up once', () => {
    expect(firebaseEnabled()).toBe(true)
    expect(firebaseAuth()).toBe(fakeFirebase.auth)
  })

  it('signs in with email and password, and sends the ID token', async () => {
    expect(await firebaseIdToken()).toBeNull()
    fakeFirebase.addAccount('ada@example.com', 'correct horse')
    await expect(signInWithEmail('ada@example.com', 'wrong')).rejects.toThrow(
      'auth/invalid-credential'
    )
    await signInWithEmail('ada@example.com', 'correct horse')
    expect(await firebaseIdToken()).toBe('id-token:ada@example.com')
    await signOutOfFirebase()
    expect(await firebaseIdToken()).toBeNull()
  })

  it('signs in with Google', async () => {
    await expect(signInWithGoogle()).rejects.toThrow('popup-closed')
    fakeFirebase.setGoogleAccount('grace@example.com', 'Grace Hopper')
    await signInWithGoogle()
    expect(fakeFirebase.auth.currentUser?.displayName).toBe('Grace Hopper')
  })

  it('signs up with the name on the account and a fresh token', async () => {
    await signUpWithEmail('ada@example.com', 'correct horse', 'Ada Lovelace')
    expect(fakeFirebase.auth.currentUser).toMatchObject({
      email: 'ada@example.com',
      displayName: 'Ada Lovelace',
      refreshed: true
    })
    await expect(
      signUpWithEmail('ada@example.com', 'another', 'Ada')
    ).rejects.toThrow('auth/email-already-in-use')
  })

  it('reports a restored session once, and every sign-out', async () => {
    fakeFirebase.restoreSession('ada@example.com')
    const restored = jest.fn()
    const signedOut = jest.fn()
    const stop = onFirebaseSession(restored, signedOut)
    expect(restored).toHaveBeenCalledTimes(1)
    fakeFirebase.addAccount('ada@example.com', 'pw')
    await signInWithEmail('ada@example.com', 'pw')
    expect(restored).toHaveBeenCalledTimes(1)
    await signOutOfFirebase()
    expect(signedOut).toHaveBeenCalledTimes(1)
    stop()
    await signInWithEmail('ada@example.com', 'pw')
    await signOutOfFirebase()
    expect(signedOut).toHaveBeenCalledTimes(1)
  })
})
