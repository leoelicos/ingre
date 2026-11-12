import bcrypt from 'bcrypt'
import { db } from '../postgres/db'
import { newPublicId } from '../test-utils/ids'
import { useTestDb } from '../test-utils/pg'
import { insertUser, storedUser } from '../test-utils/users'
import type { FirebaseIdentity } from '../utils/firebase'
import { findOrCreateUserByFirebase, namesOf } from './firebaseUser'
import { UserApi } from './user'

/* Firebase Auth: a Firebase identity becomes the same ingré user (public id) every time. */

jest.setTimeout(60000)

const sql = useTestDb()

const identity = (
  overrides: Partial<FirebaseIdentity> = {}
): FirebaseIdentity => ({
  uid: 'firebase-uid-1',
  email: 'ada@example.com',
  emailVerified: true,
  name: 'Ada King Lovelace',
  ...overrides
})

const countUsers = async () =>
  (await db().query('select count(*)::int as n from users'))[0]?.['n']

const makeUser = async (
  email: string,
  extra: { pro?: boolean; firebaseUid?: string } = {}
) =>
  insertUser({
    email,
    passwordHash: await bcrypt.hash('correct horse', 4),
    ...extra
  })

describe('findOrCreateUserByFirebase', () => {
  it('creates a user without a password, then finds the same one', async () => {
    const created = await findOrCreateUserByFirebase(identity())
    expect(created).toMatchObject({
      _id: expect.stringMatching(/^[0-9a-f]{24}$/),
      firstName: 'Ada',
      lastName: 'King Lovelace',
      email: 'ada@example.com',
      pro: false,
      savedRecipes: [],
      numSavedRecipes: 0
    })
    const again = await findOrCreateUserByFirebase(
      identity({ name: 'Someone Else' })
    )
    expect(again?._id).toBe(created?._id)
    const stored = await storedUser(created?._id ?? '')
    expect(stored.firebaseUid).toBe('firebase-uid-1')
    expect(stored.passwordHash).toBeNull()
    // the legacy password login never matches a Firebase-only user
    expect(
      await new UserApi().checkUserPassword({
        email: 'ada@example.com',
        password: ''
      })
    ).toBeNull()
  })

  it('links an existing account by verified email, ignoring case', async () => {
    const existing = await makeUser('Ada@Example.com', { pro: true })
    const user = await findOrCreateUserByFirebase(identity())
    expect(user?._id).toBe(existing)
    expect(user?.pro).toBe(true)
    expect((await storedUser(existing)).firebaseUid).toBe('firebase-uid-1')
    // the old password still works for the legacy login during the move
    expect(
      await new UserApi().checkUserPassword({
        email: 'Ada@Example.com',
        password: 'correct horse'
      })
    ).toMatchObject({ _id: existing })
  })

  it('links an imported account whose Firebase uid is its public id', async () => {
    const existing = await makeUser('ada@example.com')
    const user = await findOrCreateUserByFirebase(
      identity({ uid: existing, emailVerified: false })
    )
    expect(user?._id).toBe(existing)
  })

  it('refuses an unverified email that belongs to an account', async () => {
    await makeUser('ada@example.com')
    expect(
      await findOrCreateUserByFirebase(identity({ emailVerified: false }))
    ).toBeNull()
    // a public-id-shaped uid only links the account with that id and email
    expect(
      await findOrCreateUserByFirebase(
        identity({ uid: newPublicId(), emailVerified: false })
      )
    ).toBeNull()
    expect(await countUsers()).toBe(1)
  })

  it('refuses an email already linked to another uid', async () => {
    await makeUser('ada@example.com', { firebaseUid: 'someone-else' })
    expect(await findOrCreateUserByFirebase(identity())).toBeNull()
  })

  it('refuses a token without an email', async () => {
    expect(
      await findOrCreateUserByFirebase(identity({ email: null }))
    ).toBeNull()
  })

  it('makes one user when two first requests race', async () => {
    const [first, second] = await Promise.all([
      findOrCreateUserByFirebase(identity()),
      findOrCreateUserByFirebase(identity())
    ])
    expect(first?._id).toBe(second?._id)
    expect(await countUsers()).toBe(1)
  })

  it('gives up when the insert loses to someone else’s account', async () => {
    // the unique email catches an account the taken check didn't see
    const client = sql()
    const blind = {
      ...client,
      query: async (text: string, params?: ReadonlyArray<unknown>) =>
        text.includes('firebase_uid is distinct from')
          ? []
          : client.query(text, params)
    }
    await makeUser('ada@example.com', { firebaseUid: 'someone-else' })
    expect(await findOrCreateUserByFirebase(identity(), blind)).toBeNull()
    expect(await countUsers()).toBe(1)
  })
})

describe('namesOf', () => {
  it('splits the display name, else uses the email', () => {
    expect(namesOf('Grace Hopper', 'g@example.com')).toEqual({
      firstName: 'Grace',
      lastName: 'Hopper'
    })
    expect(namesOf('  ', 'grace@example.com')).toEqual({
      firstName: 'grace',
      lastName: ''
    })
    expect(namesOf(null, 'grace@example.com').firstName).toBe('grace')
  })
})
