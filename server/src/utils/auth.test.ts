import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
import { buildContext } from '../context'
import { createDataSources } from '../datasources'
import { getJwtSecret, readUserFromAuthHeader, signToken } from './auth'

const secret = 'test_secret'
const recipeId = new Types.ObjectId()
const user = {
  _id: new Types.ObjectId(),
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  pro: false,
  savedRecipes: [recipeId, { _id: new Types.ObjectId() }]
}

const ORIGINAL_ENV = process.env
beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, JWT_SECRET: secret }
  delete process.env['HEROKU_JWT_SECRET']
})
afterAll(() => {
  process.env = ORIGINAL_ENV
})

describe('getJwtSecret', () => {
  it('prefers HEROKU_JWT_SECRET, then JWT_SECRET, else null', () => {
    expect(getJwtSecret()).toBe(secret)
    process.env['HEROKU_JWT_SECRET'] = 'heroku'
    expect(getJwtSecret()).toBe('heroku')
    delete process.env['HEROKU_JWT_SECRET']
    delete process.env['JWT_SECRET']
    expect(getJwtSecret()).toBeNull()
  })
})

describe('signToken', () => {
  it('signs only public fields', () => {
    const decoded = jwt.verify(signToken(user), secret)
    if (typeof decoded === 'string')
      throw new Error('expected an object payload')
    expect(decoded['data']).toEqual({
      _id: user._id.toString(),
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      pro: false,
      savedRecipes: user.savedRecipes.map((r) =>
        r instanceof Types.ObjectId ? r.toString() : r._id.toString()
      ),
      numSavedRecipes: 2
    })
    expect(JSON.stringify(decoded)).not.toContain('password')
  })

  it('throws without a secret', () => {
    delete process.env['JWT_SECRET']
    expect(() => signToken(user)).toThrow('no secret')
  })
})

describe('readUserFromAuthHeader', () => {
  it('returns the user carried by a valid bearer token', () => {
    const result = readUserFromAuthHeader(`Bearer ${signToken(user)}`, secret)
    expect(result).toEqual({
      ...user,
      savedRecipes: user.savedRecipes.map((r) =>
        r instanceof Types.ObjectId ? r : r._id
      ),
      numSavedRecipes: 2
    })
  })

  it('accepts populated savedRecipes and fills defaults', () => {
    const token = jwt.sign(
      {
        data: {
          _id: user._id.toString(),
          firstName: 'a',
          lastName: 'b',
          email: 'c',
          savedRecipes: [{ _id: recipeId.toString() }]
        }
      },
      secret
    )
    expect(readUserFromAuthHeader(`Bearer ${token}`, secret)).toEqual({
      _id: user._id,
      firstName: 'a',
      lastName: 'b',
      email: 'c',
      pro: false,
      savedRecipes: [recipeId],
      numSavedRecipes: 0
    })
  })

  it('returns null for missing, malformed, invalid or wrongly shaped tokens', () => {
    expect(readUserFromAuthHeader(undefined, secret)).toBeNull()
    expect(readUserFromAuthHeader('Token abc', secret)).toBeNull()
    expect(readUserFromAuthHeader('Bearer ', secret)).toBeNull()
    expect(readUserFromAuthHeader('Bearer invalid', secret)).toBeNull()
    expect(
      readUserFromAuthHeader(`Bearer ${signToken(user)}`, 'other')
    ).toBeNull()
    const badShape = jwt.sign({ data: { _id: 'not-an-id' } }, secret)
    expect(readUserFromAuthHeader(`Bearer ${badShape}`, secret)).toBeNull()
  })
})

describe('buildContext', () => {
  const dataSources = createDataSources()

  it('adds the user and referer when present', () => {
    const context = buildContext(
      {
        authorization: `Bearer ${signToken(user)}`,
        referer: 'http://localhost:3000/x'
      },
      dataSources
    )
    expect(context.user?.email).toBe(user.email)
    expect(context.headers).toEqual({ referer: 'http://localhost:3000/x' })
    expect(context.dataSources).toBe(dataSources)
  })

  it('omits user and headers when absent, and without a secret', () => {
    expect(buildContext({}, dataSources)).toEqual({ dataSources })
    const token = signToken(user)
    delete process.env['JWT_SECRET']
    expect(
      buildContext({ authorization: `Bearer ${token}` }, dataSources)
    ).toEqual({ dataSources })
  })

  it('creates data sources by default', () => {
    expect(buildContext({}).dataSources.userApi).toBeDefined()
  })
})
