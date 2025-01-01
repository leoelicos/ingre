import mongoose from 'mongoose'
import { CategoryApi } from './category'
import { IngredientApi } from './ingredient'
import { RecipeApi } from './recipe'
import { UserApi } from './user'

const categoryApi = new CategoryApi()
const ingredientApi = new IngredientApi()
const recipeApi = new RecipeApi()
const userApi = new UserApi()

jest.setTimeout(60000)

const mockCategoryMeat = {
  name: 'meat'
}
const mockCategoryVegetable = {
  name: 'vegetable'
}

describe('categoryApi', () => {
  beforeEach(async (done) => {
    mongoose.set('strictQuery', false)
    await mongoose.connect('mongodb://127.0.0.1:27017/test_ingre_category')
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

  it('createCategory should return a new category', async () => {
    const result = await categoryApi.createCategory(mockCategoryMeat.name)
    expect(result?.name).toBe(mockCategoryMeat.name)
  })

  it('getAllCategories should get all categories', async () => {
    await categoryApi.createCategory(mockCategoryMeat.name)
    await categoryApi.createCategory(mockCategoryVegetable.name)
    const result = await categoryApi.getAllCategories()
    expect(result?.length).toBe(2)
    expect(result?.[0].name).toBe(mockCategoryMeat.name)
    expect(result?.[1].name).toBe(mockCategoryVegetable.name)
  })

  it('findOrCreateCategory will find an existing category, or create a new one', async () => {
    await categoryApi.createCategory(mockCategoryMeat.name)
    const result = await categoryApi.findOrCreateCategory({
      categoryName: mockCategoryMeat.name
    })
    expect(result).toMatchObject({
      name: mockCategoryMeat.name
    })

    const result2 = await categoryApi.findOrCreateCategory({
      categoryName: mockCategoryVegetable.name
    })
    expect(result2).toMatchObject({
      name: mockCategoryVegetable.name
    })
  })

  it('deleteAllCategories should delete all the categories', async () => {
    await categoryApi.createCategory(mockCategoryMeat.name)
    await categoryApi.createCategory(mockCategoryVegetable.name)
    await categoryApi.deleteAllCategories()
    const numCategories = await categoryApi.getAllCategories()
    expect(numCategories?.length).toBe(0)
  })
})
