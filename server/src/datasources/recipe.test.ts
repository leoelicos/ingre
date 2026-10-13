import { UserApi } from './user'
import mongoose, { Types } from 'mongoose'
import { CategoryApi } from './category'
import { IngredientApi } from './ingredient'
import { RecipeApi } from './recipe'

let categoryApi = new CategoryApi()
let ingredientApi = new IngredientApi()
let recipeApi = new RecipeApi()
let userApi = new UserApi()

jest.setTimeout(60000)

const mockRecipe = {
  name: 'Test Recipe',
  portions: 4,
  picture_url: 'http://example.com/image.jpg',
  libraryId: 'some-library-id',
  instructions: 'Test instructions'
}

describe('recipeApi', () => {
  beforeEach(async () => {
    mongoose.set('strictQuery', false)
    await mongoose.connect(`${process.env['MONGO_TEST_URI']}test_ingre_recipe`)
    categoryApi = new CategoryApi()
    ingredientApi = new IngredientApi()
    recipeApi = new RecipeApi()
    userApi = new UserApi()
    await categoryApi.deleteAllCategories()
    await ingredientApi.deleteAllIngredients()
    await recipeApi.deleteAllRecipes()
    await userApi.deleteAllUsers()
    jest.resetAllMocks()
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })
  afterEach(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  })

  it('createRecipe returns a new recipe', async () => {
    const categoryMeat = await categoryApi.createCategory('Meat')
    if (!categoryMeat) return
    const chicken = await ingredientApi.createIngredient({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: categoryMeat._id
    })
    if (!chicken) return
    const categoryVegetable = await categoryApi.createCategory('Meat')
    if (!categoryVegetable) return
    const broccoli = await ingredientApi.createIngredient({
      name: 'Broccoli',
      quantity: 1,
      measure: 'unit',
      category: categoryVegetable._id
    })
    if (!broccoli) return
    const result = await recipeApi.createRecipe({
      name: mockRecipe.name,
      portions: mockRecipe.portions,
      ingredients: [chicken._id, broccoli._id],
      picture_url: mockRecipe.picture_url,
      libraryId: mockRecipe.libraryId,
      instructions: mockRecipe.instructions
    })
    expect(result).toMatchObject({
      libraryId: mockRecipe.libraryId,
      instructions: mockRecipe.instructions,
      name: mockRecipe.name,
      picture_url: mockRecipe.picture_url,
      portions: mockRecipe.portions
    })
    expect(result?.ingredients.length).toBe(2)
  }, 30000)

  it('getRecipe gets one recipe', async () => {
    const categoryMeat = await categoryApi.createCategory('Meat')
    if (!categoryMeat) return
    const chicken = await ingredientApi.createIngredient({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: categoryMeat._id
    })
    if (!chicken) return
    const recipe = await recipeApi.createRecipe({
      name: mockRecipe.name,
      portions: mockRecipe.portions,
      ingredients: [chicken._id],
      picture_url: mockRecipe.picture_url,
      libraryId: mockRecipe.libraryId,
      instructions: mockRecipe.instructions
    })
    if (!recipe) return
    const foundRecipe = await recipeApi.getRecipe(recipe._id)
    expect(foundRecipe).toMatchObject({
      _id: recipe._id,
      ingredients: [
        {
          _id: chicken._id,
          measure: chicken.measure,
          quantity: chicken.quantity
        }
      ]
    })
  })

  it('getAllRecipes gets all recipes', async () => {
    const categoryMeat = await categoryApi.createCategory('Meat')
    if (!categoryMeat) return
    const chicken = await ingredientApi.createIngredient({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: categoryMeat._id
    })
    if (!chicken) return
    await recipeApi.createRecipe({
      name: mockRecipe.name,
      portions: mockRecipe.portions,
      ingredients: [chicken._id],
      picture_url: mockRecipe.picture_url,
      libraryId: mockRecipe.libraryId,
      instructions: mockRecipe.instructions
    })
    const numRecipes = await recipeApi.getAllRecipes()
    expect(numRecipes?.length).toBe(1)
  })

  it('deleteAllRecipes deletes all recipes', async () => {
    const categoryMeat = await categoryApi.createCategory('Meat')
    if (!categoryMeat) return
    const chicken = await ingredientApi.createIngredient({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: categoryMeat._id
    })
    if (!chicken) return
    await recipeApi.createRecipe({
      name: mockRecipe.name,
      portions: mockRecipe.portions,
      ingredients: [chicken._id],
      picture_url: mockRecipe.picture_url,
      libraryId: mockRecipe.libraryId,
      instructions: mockRecipe.instructions
    })
    await recipeApi.deleteAllRecipes()
    const numRecipes = await recipeApi.getAllRecipes()
    expect(numRecipes?.length).toBe(0)
  })

  it('deleteRecipe deletes one recipe', async () => {
    const categoryMeat = await categoryApi.createCategory('Meat')
    if (!categoryMeat) return
    const chicken = await ingredientApi.createIngredient({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: categoryMeat._id
    })
    if (!chicken) return
    const payload = {
      name: mockRecipe.name,
      portions: mockRecipe.portions,
      ingredients: [chicken._id],
      picture_url: mockRecipe.picture_url,
      libraryId: mockRecipe.libraryId,
      instructions: mockRecipe.instructions
    }
    const createdRecipe = await recipeApi.createRecipe(payload)
    if (!createdRecipe) return
    await recipeApi.deleteRecipe({ recipeId: createdRecipe._id })

    const allRecipes = await recipeApi.getAllRecipes()
    expect(allRecipes.length).toBe(0)
  })

  it('deleteRecipe throws error if recipeId not found', async () => {
    const categoryMeat = await categoryApi.createCategory('Meat')
    if (!categoryMeat) return
    const chicken = await ingredientApi.createIngredient({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: categoryMeat._id
    })
    if (!chicken) return
    const payload = {
      name: mockRecipe.name,
      portions: mockRecipe.portions,
      ingredients: [chicken._id],
      picture_url: mockRecipe.picture_url,
      libraryId: mockRecipe.libraryId,
      instructions: mockRecipe.instructions
    }
    const createdRecipe = await recipeApi.createRecipe(payload)
    if (!createdRecipe) return
    try {
      await recipeApi.deleteRecipe({ recipeId: new Types.ObjectId() })
    } catch (error) {
      if (!(error instanceof Error)) throw error
      const e = error
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toBe('Recipe does not exist!')
    }

    const allRecipes = await recipeApi.getAllRecipes()
    expect(allRecipes.length).toBe(1)
  })

  it('categoryCleanup removes unused categories', async () => {
    const category = await categoryApi.createCategory('Meat')
    if (!category) return

    const chicken = await ingredientApi.createIngredient({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: category._id
    })
    if (!chicken) return

    const payload = {
      name: mockRecipe.name,
      portions: mockRecipe.portions,
      ingredients: [chicken._id],
      picture_url: mockRecipe.picture_url,
      libraryId: mockRecipe.libraryId,
      instructions: mockRecipe.instructions
    }
    await recipeApi.createRecipe(payload)
    await recipeApi.createRecipe(payload)
    await recipeApi.createRecipe(payload)

    const categoriesBeforeCleanup = await categoryApi.getAllCategories()
    expect(categoriesBeforeCleanup.length).toBe(1)

    await recipeApi.deleteAllRecipes()
    await recipeApi.categoryCleanup()

    const categoriesAfterCleanup = await categoryApi.getAllCategories()
    expect(categoriesAfterCleanup.length).toBe(0)
  })
})
