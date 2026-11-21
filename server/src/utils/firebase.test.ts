import {
  adminAuth,
  emulatorAdminAuth,
  firebaseVerifier,
  identityOf,
  serviceAccountOf,
  type IdTokenChecker,
  type ServiceAccount
} from './firebase'

/* Firebase Auth: firebase-admin is the stand-in in test-utils; no test talks to Google. */

const account = {
  project_id: 'ingre-test',
  client_email: 'firebase-adminsdk@ingre-test.iam.gserviceaccount.com',
  private_key: 'placeholder-not-a-real-key'
}
const json = JSON.stringify(account)
const parsed: ServiceAccount = {
  projectId: 'ingre-test',
  clientEmail: account.client_email,
  privateKey: account.private_key
}

describe('serviceAccountOf', () => {
  it('reads the key JSON as is or base64 encoded', () => {
    expect(serviceAccountOf(json)).toEqual(parsed)
    expect(serviceAccountOf(Buffer.from(json).toString('base64'))).toEqual(
      parsed
    )
  })

  it('is null when unset, not JSON, not an object or missing a field', () => {
    expect(serviceAccountOf(undefined)).toBeNull()
    expect(serviceAccountOf('')).toBeNull()
    expect(serviceAccountOf('not json')).toBeNull()
    expect(serviceAccountOf('[1]')).toBeNull()
    expect(
      serviceAccountOf(JSON.stringify({ ...account, private_key: '' }))
    ).toBeNull()
  })
})

describe('identityOf', () => {
  it('keeps uid, email, whether it is verified and the name', () => {
    expect(
      identityOf({
        uid: 'u1',
        email: 'ada@example.com',
        email_verified: true,
        name: 'Ada'
      })
    ).toEqual({
      uid: 'u1',
      email: 'ada@example.com',
      emailVerified: true,
      name: 'Ada'
    })
    expect(identityOf({ email_verified: 'yes' })).toEqual({
      uid: '',
      email: null,
      emailVerified: false,
      name: null
    })
  })
})

describe('firebaseVerifier', () => {
  it('is off without a service account', () => {
    const connect = jest.fn()
    expect(firebaseVerifier({}, connect)).toBeNull()
    expect(connect).not.toHaveBeenCalled()
  })

  it('checks tokens with the account’s Auth', async () => {
    const checker: IdTokenChecker = {
      verifyIdToken: jest.fn(async () => ({ uid: 'u1', email: 'a@b.c' }))
    }
    const connect = jest.fn(() => checker)
    const verify = firebaseVerifier(
      { FIREBASE_SERVICE_ACCOUNT_JSON: json },
      connect
    )
    expect(connect).toHaveBeenCalledWith(parsed)
    expect(await verify?.('id-token')).toEqual({
      uid: 'u1',
      email: 'a@b.c',
      emailVerified: false,
      name: null
    })
    expect(checker.verifyIdToken).toHaveBeenCalledWith('id-token')
  })

  it('uses firebase-admin by default', async () => {
    const verify = firebaseVerifier({ FIREBASE_SERVICE_ACCOUNT_JSON: json })
    await expect(verify?.('id-token')).rejects.toThrow('not set up in tests')
    expect(adminAuth(parsed)).toHaveProperty('verifyIdToken')
  })

  it('uses the Auth Emulator when its host and a project id are set (#320)', async () => {
    const checker: IdTokenChecker = {
      verifyIdToken: jest.fn(async () => ({ uid: 'u2', email: 'e@m.u' }))
    }
    const connect = jest.fn()
    const connectEmulator = jest.fn(() => checker)
    const verify = firebaseVerifier(
      {
        FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
        FIREBASE_PROJECT_ID: 'ingre-92a75',
        FIREBASE_SERVICE_ACCOUNT_JSON: json
      },
      connect,
      connectEmulator
    )
    expect(connectEmulator).toHaveBeenCalledWith('ingre-92a75')
    expect(connect).not.toHaveBeenCalled()
    expect(await verify?.('emulator-token')).toEqual({
      uid: 'u2',
      email: 'e@m.u',
      emailVerified: false,
      name: null
    })
    expect(emulatorAdminAuth('ingre-92a75')).toHaveProperty('verifyIdToken')
  })

  it('ignores the emulator host without a project id', () => {
    const connectEmulator = jest.fn()
    expect(
      firebaseVerifier(
        { FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099' },
        jest.fn(),
        connectEmulator
      )
    ).toBeNull()
    const connect = jest.fn(() => ({ verifyIdToken: jest.fn() }))
    firebaseVerifier(
      {
        FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
        FIREBASE_SERVICE_ACCOUNT_JSON: json
      },
      connect,
      connectEmulator
    )
    expect(connect).toHaveBeenCalledWith(parsed)
    expect(connectEmulator).not.toHaveBeenCalled()
  })
})
