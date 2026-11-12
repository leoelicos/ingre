import { newPublicId } from './test-utils/ids'
import { buildContext, defaultVerifier, userOfAuthorization } from './context'
import { createDataSources } from './datasources'
import { signToken } from './utils/auth'
import type { VerifyIdToken } from './utils/firebase'

/* Firebase Auth: a Firebase ID token or (during the move) the legacy JWT signs a user in. */

const secret = 'test_secret'
const user = {
  _id: newPublicId(),
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  pro: false,
  savedRecipes: []
}
const identity = {
  uid: 'firebase-uid',
  email: user.email,
  emailVerified: true,
  name: 'John Doe'
}
const findUser = jest.fn(async () => ({ ...user, numSavedRecipes: 0 }))
const verify: VerifyIdToken = jest.fn(async (token: string) => {
  if (token !== 'firebase-token') throw new Error('invalid token')
  return identity
})

const ORIGINAL_ENV = process.env
beforeEach(() => {
  jest.clearAllMocks()
  process.env = { ...ORIGINAL_ENV, JWT_SECRET: secret }
  delete process.env['HEROKU_JWT_SECRET']
})
afterAll(() => {
  process.env = ORIGINAL_ENV
})

describe('userOfAuthorization', () => {
  it('signs in a Firebase ID token as its ingré user', async () => {
    const found = await userOfAuthorization(
      'Bearer firebase-token',
      verify,
      findUser
    )
    expect(found?._id).toBe(user._id)
    expect(findUser).toHaveBeenCalledWith(identity)
  })

  it('still accepts the legacy JWT, without asking Firebase', async () => {
    const found = await userOfAuthorization(`Bearer ${signToken(user)}`, verify)
    expect(found?.email).toBe(user.email)
    expect(verify).not.toHaveBeenCalled()
  })

  it('is nobody without a bearer token, without Firebase, or for a bad token', async () => {
    expect(await userOfAuthorization(undefined, verify)).toBeNull()
    expect(await userOfAuthorization('Bearer ', verify)).toBeNull()
    expect(await userOfAuthorization('Token x', verify)).toBeNull()
    expect(await userOfAuthorization('Bearer firebase-token', null)).toBeNull()
    jest.spyOn(console, 'warn').mockImplementationOnce(() => undefined)
    expect(
      await userOfAuthorization('Bearer forged', verify, findUser)
    ).toBeNull()
    expect(findUser).not.toHaveBeenCalled()
  })

  it('ignores the legacy JWT when no secret is set', async () => {
    const legacy = `Bearer ${signToken(user)}`
    delete process.env['JWT_SECRET']
    jest.spyOn(console, 'warn').mockImplementationOnce(() => undefined)
    expect(await userOfAuthorization(legacy, verify)).toBeNull()
  })
})

describe('buildContext', () => {
  const dataSources = createDataSources()

  it('adds the user and referer when present', async () => {
    const context = await buildContext(
      {
        authorization: `Bearer ${signToken(user)}`,
        referer: 'http://localhost:3000/x'
      },
      dataSources,
      verify
    )
    expect(context.user?.email).toBe(user.email)
    expect(context.headers).toEqual({ referer: 'http://localhost:3000/x' })
    expect(context.dataSources).toBe(dataSources)
  })

  it('omits user and headers when absent', async () => {
    expect(await buildContext({}, dataSources, verify)).toEqual({
      dataSources
    })
  })

  it('creates data sources and the process verifier by default', async () => {
    delete process.env['FIREBASE_SERVICE_ACCOUNT_JSON']
    expect((await buildContext({})).dataSources.userApi).toBeDefined()
    expect(defaultVerifier()).toBeNull()
  })
})
