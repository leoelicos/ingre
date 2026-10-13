import { UserApi } from '../datasources/user'
delete process.env.JWT_SECRET
process.env.JWT_SECRET = 'mock_secret'

import jwt from 'jsonwebtoken'
import { authMiddleware, signToken } from './auth'
import mongoose from 'mongoose'
import { User } from '../models/User'
import type { User as ContextUser } from '../schemas/types'

type TestRequest = { headers: { authorization?: string }; user?: ContextUser }
import { CategoryApi } from '../datasources/category'
import { IngredientApi } from '../datasources/ingredient'
import { RecipeApi } from '../datasources/recipe'

const categoryApi = new CategoryApi()
const ingredientApi = new IngredientApi()
const recipeApi = new RecipeApi()
const userApi = new UserApi()

const mockUser = {
  email: 'john.doe@example.com',
  password: 'johndoe123',
  firstName: 'John',
  lastName: 'Doe'
}
const mockSecret = 'mock_secret'
const mockExpiration = '1h'

describe('signToken', () => {
  const ORIGINAL_ENV = process.env
  beforeEach(async () => {
    mongoose.set('strictQuery', false)
    await mongoose.connect(`${process.env.MONGO_TEST_URI}test_ingre_category`)
    await categoryApi.deleteAllCategories()
    await ingredientApi.deleteAllIngredients()
    await recipeApi.deleteAllRecipes()
    await userApi.deleteAllUsers()
    jest.resetAllMocks()
    jest.clearAllMocks()
    process.env = { ...ORIGINAL_ENV }
  })
  afterEach(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
    process.env = ORIGINAL_ENV
  })
  it('should generate a valid JWT token', async () => {
    const user = await User.create(mockUser)
    const token = signToken(user)
    const decoded = jwt.verify(token, mockSecret)
    expect(decoded).toHaveProperty('data')
    if (typeof decoded === 'string') throw new Error('expected a JWT payload')
    expect(decoded.data).toMatchObject({
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      pro: user.pro
    })
  })

  it('should throw an error if secret is missing', async () => {
    try {
      const user = await userApi.createUser(mockUser)
      if (!user) return
      process.env.HEROKU_JWT_SECRET = undefined
      process.env.JWT_SECRET = undefined
      signToken(user)
    } catch (error) {
      if (!(error instanceof Error)) throw error
      const { message } = error
      expect(message).toStrictEqual('no secret')
    }
  })

  it('should throw an error if sign doesnt work', async () => {
    const user = await userApi.createUser(mockUser)
    if (!user) return
    const signSpy = jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
      throw new Error('mocked sign error')
    })
    try {
      signToken(user)
    } catch (error) {
      if (!(error instanceof Error)) throw error
      const { message } = error
      expect(message).toStrictEqual('mocked sign error')
    }
    signSpy.mockReset()
    signSpy.mockRestore()
  })
})

describe('authMiddleware', () => {
  const ORIGINAL_ENV = process.env
  beforeEach(async () => {
    mongoose.set('strictQuery', false)
    await mongoose.connect(`${process.env.MONGO_TEST_URI}test_ingre_category`)
    await categoryApi.deleteAllCategories()
    await ingredientApi.deleteAllIngredients()
    await recipeApi.deleteAllRecipes()
    await userApi.deleteAllUsers()
    jest.resetAllMocks()
    jest.clearAllMocks()
    process.env = { ...ORIGINAL_ENV }
  })
  afterEach(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
    process.env = ORIGINAL_ENV
  })
  it('should populate req.user with decoded token data when token is valid', async () => {
    const user = await userApi.createUser(mockUser)
    if (!user) return

    const verifySpy = jest.spyOn(jwt, 'verify')

    const token = jwt.sign({ data: user }, mockSecret, {
      expiresIn: mockExpiration
    })
    const req: TestRequest = {
      headers: { authorization: `Bearer ${token}` }
    }

    const result = authMiddleware({ req })

    expect(result.user).toMatchObject({
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      pro: user.pro
    })

    expect(verifySpy).toHaveBeenCalledWith(token, mockSecret, {
      maxAge: mockExpiration
    })

    verifySpy.mockReset()
    verifySpy.mockRestore()
  })

  it('should throw an error if token is missing', async () => {
    const req: TestRequest = { headers: {} }

    const result = authMiddleware({ req })

    expect(result.user).toBeUndefined()
  })

  it('should return request without user if secret is missing', async () => {
    const req: TestRequest = { headers: {} }
    process.env.HEROKU_JWT_SECRET = undefined
    process.env.JWT_SECRET = undefined
    expect(authMiddleware({ req }).user).toBeUndefined()
  })

  it('should throw an error if token is invalid', () => {
    const req: TestRequest = {
      headers: { authorization: 'Bearer invalidtoken' }
    }
    const result = authMiddleware({ req })
    expect(result.user).toBeUndefined()
  })
})
