/* Branch-coverage tests using real implementations on an in-memory Postgres (no module mocks). */
import { createDataSources } from './datasources'
import { useTestDb } from './test-utils/pg'
import {
  createSaveIngredient,
  saveRecipe
} from './schemas/resolvers/recipe/saveRecipe'

jest.setTimeout(60000)

const dataSources = createDataSources()
const { userApi, categoryApi, ingredientApi } = dataSources

const userInput = {
  email: 'branches@example.com',
  password: 'password123',
  firstName: 'Branch',
  lastName: 'Tester'
}

describe('branch coverage with real data sources', () => {
  useTestDb()

  it('createSaveIngredient falls back to defaults for empty fields', async () => {
    const saved = await createSaveIngredient({
      ingredientInput: {
        name: '',
        quantity: 0,
        measure: '',
        category: '',
        ingredientId: ''
      },
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
    const user = await userApi.createUser(userInput)
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined)
    const recipe = await saveRecipe(
      undefined,
      {
        input: {
          name: 'Toast',
          portions: 1,
          ingredients: [
            {
              name: 'bread',
              quantity: 2,
              measure: 'slice',
              category: 'bakery',
              ingredientId: 'bread'
            }
          ],
          picture_url: '',
          libraryId: 'toast',
          instructions: '',
          customisations: { added: [], removed: [], changed: [] }
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
    expect(recipe.instructions).toBeUndefined()
    expect(
      (await userApi.findOneUserById({ id: user._id }))?.savedRecipes
    ).toMatchObject([{ _id: recipe._id, name: 'Toast' }])
  })
})
