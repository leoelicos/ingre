/* Branch-coverage tests using real implementations on the in-memory MongoDB (no module mocks). */
import mongoose, { Types } from 'mongoose'
import { createDataSources } from './datasources'
import { User } from './models/User'
import {
  createSaveIngredient,
  saveRecipe
} from './schemas/resolvers/recipe/saveRecipe'

jest.setTimeout(60000)

const dataSources = createDataSources()
const { userApi, recipeApi, categoryApi, ingredientApi } = dataSources

const userInput = {
  email: 'branches@example.com',
  password: 'password123',
  firstName: 'Branch',
  lastName: 'Tester'
}

describe('branch coverage with real data sources', () => {
  beforeEach(async () => {
    mongoose.set('strictQuery', false)
    await mongoose.connect(`${process.env.MONGO_TEST_URI}test_ingre_branches`)
  })
  afterEach(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  })

  it('user lookups return undefined for unknown users', async () => {
    const id = new Types.ObjectId()
    expect(await userApi.findOneUserById({ id })).toBeUndefined()
    expect(await userApi.getUserSavedRecipes({ id })).toBeUndefined()
    expect(
      await userApi.findOneUser({ email: 'nobody@example.com' })
    ).toBeUndefined()
  })

  it('does not re-hash the password when an existing user is saved', async () => {
    await userApi.createUser(userInput)
    const doc = await User.findOne({ email: userInput.email }).orFail()
    const hash = doc.password
    doc.firstName = 'Renamed'
    await doc.save()
    const reloaded = await User.findOne({ email: userInput.email }).orFail()
    expect(reloaded.firstName).toBe('Renamed')
    expect(reloaded.password).toBe(hash)
  })

  it('updateRecipe returns undefined for an unknown recipe', async () => {
    const result = await recipeApi.updateRecipe({
      recipeId: new Types.ObjectId(),
      input: {
        name: 'x',
        portions: 1,
        ingredients: [],
        picture_url: 'p',
        libraryId: 'l',
        instructions: 'i'
      }
    })
    expect(result).toBeUndefined()
  })

  it('createSaveIngredient falls back to defaults for empty fields', async () => {
    const saved = await createSaveIngredient({
      ingredientInput: { name: '', quantity: 0, measure: '', category: '' },
      categoryApi,
      ingredientApi
    })
    expect(saved).toMatchObject({
      name: 'Generic',
      quantity: 1,
      measure: 'unit'
    })
  })

  it('saveRecipe uses the placeholder picture when none is given', async () => {
    await userApi.createUser(userInput)
    const user = await User.findOne({ email: userInput.email }).orFail()
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined)
    const recipe = await saveRecipe(
      undefined,
      {
        input: {
          name: 'Toast',
          portions: 1,
          ingredients: [
            { name: 'bread', quantity: 2, measure: 'slice', category: 'bakery' }
          ],
          picture_url: '',
          libraryId: 'toast',
          instructions: ''
        }
      },
      {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          pro: user.pro,
          savedRecipes: [],
          numSavedRecipes: 0
        },
        dataSources
      }
    )
    log.mockRestore()
    expect(recipe?.picture_url).toMatch(/^https:\/\/play-lh/)
  })
})
