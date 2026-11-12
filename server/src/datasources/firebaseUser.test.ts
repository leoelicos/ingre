import mongoose, { Types } from 'mongoose'
import { User, type UserMethods, type UserSchema } from '../models/User'
import type { FirebaseIdentity } from '../utils/firebase'
import { namesOf, findOrCreateUserByFirebase } from './firebaseUser'

/* Firebase Auth: a Firebase identity becomes the same ingré user (Mongo _id) every time. */

jest.setTimeout(60000)

const identity = (
  overrides: Partial<FirebaseIdentity> = {}
): FirebaseIdentity => ({
  uid: 'firebase-uid-1',
  email: 'ada@example.com',
  emailVerified: true,
  name: 'Ada King Lovelace',
  ...overrides
})

const makeUser = (email: string, extra: Record<string, unknown> = {}) =>
  User.create({
    email,
    firstName: 'Ada',
    lastName: 'Lovelace',
    password: 'correct horse',
    ...extra
  })

describe('findOrCreateUserByFirebase', () => {
  beforeEach(async () => {
    mongoose.set('strictQuery', false)
    await mongoose.connect(`${process.env['MONGO_TEST_URI']}test_ingre_fb`)
    await User.syncIndexes()
  })
  afterEach(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  })

  it('creates a user without a password, then finds the same one', async () => {
    const created = await findOrCreateUserByFirebase(identity())
    expect(created).toMatchObject({
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
    expect(again?._id.toString()).toBe(created?._id.toString())
    const stored = await User.findById<UserSchema & UserMethods>(
      created?._id
    ).orFail()
    expect(stored.firebaseUid).toBe('firebase-uid-1')
    expect(stored.password).toBeUndefined()
    // the legacy password login never matches a Firebase-only user
    expect(await stored.isCorrectPassword('')).toBe(false)
  })

  it('links an existing account by verified email, ignoring case', async () => {
    const existing = await makeUser('Ada@Example.com', { pro: true })
    const user = await findOrCreateUserByFirebase(identity())
    expect(user?._id.toString()).toBe(existing._id.toString())
    expect(user?.pro).toBe(true)
    const stored = await User.findById<UserSchema & UserMethods>(
      existing._id
    ).orFail()
    expect(stored.firebaseUid).toBe('firebase-uid-1')
    // the old password still works for the legacy login during the move
    expect(await stored.isCorrectPassword('correct horse')).toBe(true)
  })

  it('links an imported account whose Firebase uid is its Mongo id', async () => {
    const existing = await makeUser('ada@example.com')
    const uid = existing._id.toString()
    const user = await findOrCreateUserByFirebase(
      identity({ uid, emailVerified: false })
    )
    expect(user?._id.toString()).toBe(uid)
  })

  it('refuses an unverified email that belongs to an account', async () => {
    await makeUser('ada@example.com')
    expect(
      await findOrCreateUserByFirebase(identity({ emailVerified: false }))
    ).toBeNull()
    // a Mongo-shaped uid only links the account with that id and email
    const uid = new Types.ObjectId().toString()
    expect(
      await findOrCreateUserByFirebase(identity({ uid, emailVerified: false }))
    ).toBeNull()
    expect(await User.countDocuments()).toBe(1)
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
    expect(first?._id.toString()).toBe(second?._id.toString())
    expect(await User.countDocuments()).toBe(1)
  })

  it('gives up when the duplicate belongs to someone else', async () => {
    // the unique email index catches an account the exists check didn't see
    await User.collection.insertOne({
      email: 'ada@example.com',
      firstName: 'Ada',
      savedRecipes: []
    })
    const spy = jest
      .spyOn(User, 'exists')
      .mockReturnValueOnce(User.exists({ _id: new Types.ObjectId() }))
    expect(
      await findOrCreateUserByFirebase(identity({ emailVerified: false }))
    ).toBeNull()
    spy.mockRestore()
  })

  it('rethrows anything but a duplicate', async () => {
    const spy = jest
      .spyOn(User, 'create')
      .mockImplementationOnce(() => Promise.reject(new Error('down')))
    await expect(findOrCreateUserByFirebase(identity())).rejects.toThrow('down')
    spy.mockRestore()
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
