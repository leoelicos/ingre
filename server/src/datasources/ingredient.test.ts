import mongoose from 'mongoose'
import { CategoryApi } from './category'
import { IngredientApi } from './ingredient'
import { RecipeApi } from './recipe'
import { UserApi } from './user'
import { Ingredient } from 'models/Ingredient'

const categoryApi = new CategoryApi()
const ingredientApi = new IngredientApi()
const recipeApi = new RecipeApi()
const userApi = new UserApi()
jest.setTimeout(60000)

describe('ingredientApi', () => {
  beforeEach(async (done) => {
    mongoose.set('strictQuery', false)
    await mongoose.connect('mongodb://127.0.0.1:27017/test_ingre_ingredient')
    await categoryApi.deleteAllCategories()
    await ingredientApi.deleteAllIngredients()
    await recipeApi.deleteAllRecipes()
    await userApi.deleteAllUsers()
    jest.resetAllMocks()
    jest.clearAllMocks()
    done()
  })
  afterEach(async (done) => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
    done()
  })

  it('createIngredient returns a new ingredient', async () => {
    const category = await categoryApi.createCategory('Meat')
    if (!category) return
    const ingredient = await ingredientApi.createIngredient({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: category._id
    })
    expect(ingredient).toMatchObject({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: {
        name: 'Meat'
      }
    })
  }, 30000)

  it('getAllIngredients gets all of the ingredients', async () => {
    const category = await categoryApi.createCategory('Meat')
    if (!category) return
    await ingredientApi.createIngredient({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: category!._id
    })
    const result = await ingredientApi.getAllIngredients()
    expect(result?.length).toBe(1)
  })

  it('deleteAllIngredients deletes all of the ingredients', async () => {
    const category = await categoryApi.createCategory('Meat')
    await ingredientApi.createIngredient({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: category!._id
    })
    await ingredientApi.deleteAllIngredients()
    const numIngredients = await ingredientApi.getAllIngredients()
    expect(numIngredients?.length).toBe(0)
  })

  it('deleteIngredient deletes one ingredient', async () => {
    const category = await categoryApi.createCategory('Meat')
    const createdIngredient = await ingredientApi.createIngredient({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: category!._id
    })
    if (!createdIngredient) return
    await ingredientApi.deleteIngredient({ _id: createdIngredient?._id })
    const numIngredients = await ingredientApi.getAllIngredients()
    expect(numIngredients?.length).toBe(0)
  })

  it('createIngredient throws an error if create does not work', async () => {
    const createSpy = jest
      .spyOn(Ingredient, 'create')
      .mockImplementationOnce(() => {
        throw new Error('mocked create error')
      })

    const category = await categoryApi.createCategory('Meat')
    if (!category) return
    await expect(
      ingredientApi.createIngredient({
        name: 'Chicken',
        quantity: 1,
        measure: 'unit',
        category: category._id
      })
    ).rejects.toThrow('could not create ingredient')

    createSpy.mockReset()
    createSpy.mockRestore()
  })
})
