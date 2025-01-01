import mongoose, { Types } from 'mongoose'
import { CategoryApi } from './category'
import { IngredientApi } from './ingredient'
import {
  generateIngredients,
  RecipeApi,
  updateUniqueCategoryName
} from './recipe'
import { UserApi } from './user'
import { Recipe } from 'models/Recipe'
import * as recipeDataSource from './recipe'

let categoryApi = new CategoryApi()
let ingredientApi = new IngredientApi()
let recipeApi = new RecipeApi()
let userApi = new UserApi()

jest.setTimeout(60000)

const mockCategoryMeat = {
  name: 'meat'
}
const mockCategoryVegetable = {
  name: 'vegetable'
}
const mockChicken = {
  name: 'Chicken',
  quantity: 1,
  measure: 'unit',
  category: mockCategoryMeat
}
const mockBroccoli = {
  name: 'Broccoli',
  quantity: 2,
  measure: 'head',
  category: mockCategoryVegetable
}
const mockRecipe = {
  name: 'Test Recipe',
  portions: 4,
  picture_url: 'http://example.com/image.jpg',
  edamamId: 'some-edamam-id',
  instructions: 'Test instructions'
}

describe('recipeApi', () => {
  beforeEach(async (done) => {
    mongoose.set('strictQuery', false)
    await mongoose.connect('mongodb://127.0.0.1:27017/test_ingre_recipe')
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

    done()
  })
  afterEach(async (done) => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
    done()
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
      edamamId: mockRecipe.edamamId,
      instructions: mockRecipe.instructions
    })
    expect(result).toMatchObject({
      edamamId: mockRecipe.edamamId,
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
      edamamId: mockRecipe.edamamId,
      instructions: mockRecipe.instructions
    })
    if (!recipe) return
    const foundRecipe = await recipeApi.getRecipe(recipe!._id)
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
      edamamId: mockRecipe.edamamId,
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
      edamamId: mockRecipe.edamamId,
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
      edamamId: mockRecipe.edamamId,
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
      edamamId: mockRecipe.edamamId,
      instructions: mockRecipe.instructions
    }
    const createdRecipe = await recipeApi.createRecipe(payload)
    if (!createdRecipe) return
    try {
      await recipeApi.deleteRecipe({ recipeId: new Types.ObjectId() })
    } catch (error) {
      const e = error as Error
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toBe('Recipe does not exist!')
    }

    const allRecipes = await recipeApi.getAllRecipes()
    expect(allRecipes.length).toBe(1)
  })

  it('updateUniqueCategoryName - return an existing category', async () => {
    const categoryMeat = await categoryApi.createCategory('Meat')
    if (!categoryMeat) return
    const result = await updateUniqueCategoryName({
      category: { name: 'Meat' }
    })
    expect(result).toStrictEqual(categoryMeat)
  })

  it('updateUniqueCategoryName - creates a new category', async () => {
    const categoryMeat = await categoryApi.createCategory('Meat')
    if (!categoryMeat) return
    const result = await updateUniqueCategoryName({
      category: { name: 'Vegetables' }
    })
    if (!result) return
    expect(result.name).toStrictEqual('Vegetables')
    const allCategories = await categoryApi.getAllCategories()
    expect(allCategories.find((c) => c.name === 'Meat')).toBeDefined()
    expect(allCategories.find((c) => c.name === 'Vegetables')).toBeDefined()
  })

  it('generateIngredients returns generated ingredient with default names', async () => {
    const result = await generateIngredients({
      ingredients: [{ name: '', quantity: 0, measure: '', category: '' }]
    })
    expect(result[0]).toStrictEqual(
      expect.objectContaining({
        name: 'Generic',
        quantity: 1,
        measure: 'unit',
        category: expect.objectContaining({ name: 'Generic' })
      })
    )
  })

  it('generateIngredients returns generated ingredients', async () => {
    const result = await generateIngredients({
      ingredients: [
        { ...mockChicken, category: mockCategoryMeat.name },
        { ...mockBroccoli, category: mockCategoryVegetable.name }
      ]
    })
    expect(result[0]).toStrictEqual(
      expect.objectContaining({
        measure: 'unit',
        name: 'Chicken',
        quantity: 1,
        category: expect.objectContaining({ name: 'meat' })
      })
    )
  })

  it('generateIngredients handles api error', async () => {
    const generateIngredientSpy = jest
      .spyOn(recipeDataSource, 'generateIngredient')
      .mockImplementationOnce(() => {
        throw new Error('mocked create error')
      })
    try {
      await expect(
        generateIngredients({
          ingredients: [
            { ...mockChicken, category: mockCategoryMeat.name },
            { ...mockBroccoli, category: mockCategoryVegetable.name } // this line causes the categoryCleanup test below to file
          ]
        })
      ).rejects.toThrowError('mocked create error')
    } catch (error) {
      const { message } = error as Error
      expect(message).toStrictEqual('could not create ingredient')
    }
    generateIngredientSpy.mockRestore()
  })

  it('generateIngredient handles api error', async () => {
    const updateUniqueCategoryNameSpy = jest
      .spyOn(recipeDataSource, 'updateUniqueCategoryName')
      .mockImplementationOnce(() => {
        throw new Error('mocked create error')
      })
    try {
      await expect(
        recipeDataSource.generateIngredient({
          ingredient: { ...mockChicken, category: mockCategoryMeat.name }
        })
      ).rejects.toThrowError('mocked create error')
    } catch (error) {
      const { message } = error as Error
      expect(message).toStrictEqual('could not create ingredient')
    }
    updateUniqueCategoryNameSpy.mockRestore()
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
      edamamId: mockRecipe.edamamId,
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

  it('updateRecipe updates a recipe', async () => {
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
      edamamId: mockRecipe.edamamId,
      instructions: mockRecipe.instructions
    }
    const createdRecipe = await recipeApi.createRecipe(payload)
    if (!createdRecipe) return
    expect(createdRecipe).toStrictEqual(
      expect.objectContaining({
        edamamId: 'some-edamam-id',
        ingredients: [
          expect.objectContaining({
            category: expect.objectContaining({
              name: 'Meat'
            }),
            measure: 'unit',
            name: 'Chicken',
            quantity: 1
          })
        ],
        instructions: 'Test instructions',
        name: 'Test Recipe',
        picture_url: 'http://example.com/image.jpg',
        portions: 4
      })
    )

    // act
    const updatedInput = {
      name: 'Test Recipe 2',
      portions: 8,
      picture_url: 'http://example2.com/image2.jpg',
      edamamId: 'some-edamam-id-2',
      instructions: 'Test instructions 2',
      ingredients: [
        {
          name: 'Broccoli',
          quantity: 1,
          measure: 'unit',
          category: 'vegetable'
        }
      ]
    }
    const result = await recipeApi.updateRecipe({
      recipeId: createdRecipe._id,
      input: updatedInput
    })
    expect(result).toStrictEqual(
      expect.objectContaining({
        edamamId: updatedInput.edamamId,
        instructions: updatedInput.instructions,
        name: updatedInput.name,
        picture_url: updatedInput.picture_url,
        portions: updatedInput.portions,
        ingredients: [
          expect.objectContaining({
            category: expect.objectContaining({
              name: 'vegetable'
            }),
            measure: 'unit',
            name: 'Broccoli',
            quantity: 1
          })
        ]
      })
    )
  })

  it('updateRecipe handles findById api error', async () => {
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
      edamamId: mockRecipe.edamamId,
      instructions: mockRecipe.instructions
    }
    const createdRecipe = await recipeApi.createRecipe(payload)
    if (!createdRecipe) return

    // act
    const findSpy = jest
      .spyOn(Recipe, 'findById')
      .mockImplementationOnce(() => {
        throw new Error('mocked findById api error')
      })

    const updatedInput = {
      name: 'Test Recipe 2',
      portions: 8,
      picture_url: 'http://example2.com/image2.jpg',
      edamamId: 'some-edamam-id-2',
      instructions: 'Test instructions 2',
      ingredients: [
        {
          name: 'Broccoli',
          quantity: 1,
          measure: 'unit',
          category: 'vegetable'
        }
      ]
    }

    try {
      await recipeApi.updateRecipe({
        recipeId: createdRecipe._id,
        input: updatedInput
      })
    } catch (error) {
      const { message } = error as Error
      expect(message).toStrictEqual('mocked findById api error')
    }

    findSpy.mockReset()
    findSpy.mockRestore()
  })
})
