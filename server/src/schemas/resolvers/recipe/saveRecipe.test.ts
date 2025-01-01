import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { typeDefs } from 'schemas/typeDefs'
import { resolvers } from 'schemas/resolvers'
import 'utils/auth'
import * as saveRecipeMethods from './saveRecipe'
const { createSaveIngredient, createSaveIngredients } = saveRecipeMethods

const mockUser = {
  _id: '12345',
  firstName: 'John',
  lastName: 'Doe',
  email: 'test@example.com'
}

const mockIngredient = {
  category: 'Meat',
  measure: 'unit',
  name: 'Chicken',
  quantity: 2.5
}

const mockRecipe = {
  name: 'Roast chicken',
  edamamId: '4bd3f94346ff2cb493285199f5f06f71',
  ingredients: [mockIngredient],
  instructions: 'Make it',
  picture_url: 'www.google.com',
  portions: 2
}

// mock created data
const mockCreatedCategory = {
  _id: '67178ab14b95dc5ac046da62',
  name: 'Meat'
}
const mockCreatedIngredient = {
  name: 'Chicken',
  quantity: 2.5,
  measure: 'unit',
  category: mockCreatedCategory,
  _id: '67544a5ab3028edaf0bcc01f'
}
const mockCreatedRecipe = {
  name: 'Roast chicken',
  portions: 2,
  ingredients: [mockCreatedIngredient],
  picture_url: 'www.google.com',
  edamamId: '4bd3f94346ff2cb493285199f5f06f71',
  instructions: 'Make it',
  _id: '67544a5ab3028edaf0bcc023'
}
const mockUserWithAddedRecipe = {
  _id: '64a92550c9acc32c05995a5f',
  firstName: 'pro',
  lastName: 'pro',
  email: 'pro@ingre.com',
  password: '$2b$10$aMyVYp/RuQWeVVefUl7Wj.m.AcOoR54LoFhCvtnOz6rx2O9qTNkI.',
  savedRecipes: ['67544a5ab3028edaf0bcc023'],
  pro: true,
  numSavedRecipes: 7
}

const mockAddedRecipeToUser = jest.fn()
const mockFindOrCreateCategory = jest.fn()
const mockCreateIngredient = jest.fn()
const mockCreateRecipe = jest.fn()

const mockSaveRecipeInput = { input: mockRecipe }

export const SAVE_RECIPE = gql`
  mutation SaveRecipe($input: RecipeInput!) {
    saveRecipe(input: $input) {
      _id
      name
      portions
      ingredients {
        _id
        name
        quantity
        measure
        category {
          _id
          name
        }
      }
      picture_url
      edamamId
      instructions
    }
  }
`

interface ContextValue {
  headers: any
  dataSources: { userApi: any }
  user: any
}

const createTestServer = () =>
  new ApolloServer<ContextValue>({ typeDefs, resolvers })

let testServer = createTestServer()

mockAddedRecipeToUser.mockReturnValue(mockUserWithAddedRecipe)

mockFindOrCreateCategory.mockReturnValue(mockCreatedCategory)

mockCreateIngredient.mockReturnValue(mockCreatedIngredient)

mockCreateRecipe.mockReturnValue(mockCreatedRecipe)

const contextValue = {
  headers: {},
  dataSources: {
    userApi: {
      addRecipeToUser: (e: any) => mockAddedRecipeToUser(e)
    },
    categoryApi: {
      findOrCreateCategory: (e: any) => mockFindOrCreateCategory(e)
    },
    ingredientApi: {
      createIngredient: (e: any) => mockCreateIngredient(e)
    },
    recipeApi: {
      createRecipe: (e: any) => mockCreateRecipe(e)
    }
  },
  user: mockUser
}

describe('saveRecipe', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('should save a recipe', async () => {
    const result = await testServer.executeOperation(
      { query: SAVE_RECIPE, variables: mockSaveRecipeInput },
      { contextValue }
    )
    const {
      errors,
      data = {}
    }: { errors: any | undefined; data: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors).toBeUndefined()
    expect(data.saveRecipe).toStrictEqual({
      name: 'Roast chicken',
      portions: 2,
      ingredients: [
        {
          name: mockCreatedIngredient.name,
          quantity: mockCreatedIngredient.quantity,
          measure: mockCreatedIngredient.measure,
          _id: mockCreatedIngredient._id,
          category: {
            _id: mockCreatedCategory._id,
            name: mockCreatedCategory.name
          }
        }
      ],
      picture_url: 'www.google.com',
      edamamId: '4bd3f94346ff2cb493285199f5f06f71',
      instructions: 'Make it',
      _id: '67544a5ab3028edaf0bcc023'
    })
  })

  it('should save a recipe with default picture_url', async () => {
    await testServer.executeOperation(
      {
        query: SAVE_RECIPE,
        variables: { input: { ...mockSaveRecipeInput.input, picture_url: '' } }
      },
      { contextValue }
    )
    expect(mockCreateRecipe).toHaveBeenCalledWith(
      expect.objectContaining({
        picture_url:
          'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'
      })
    )
  })

  it('should not save an ingredient if there is an error with the createIngredient api', async () => {
    mockCreateIngredient.mockRejectedValueOnce(null)
    try {
      await testServer.executeOperation(
        { query: SAVE_RECIPE, variables: mockSaveRecipeInput },
        { contextValue }
      )
    } catch (error) {
      expect(error).toStrictEqual({})
    }
  })

  it('should throw an error if the recipe could not be updated to the user', async () => {
    mockAddedRecipeToUser.mockRejectedValueOnce(null)
    const result = await testServer.executeOperation(
      { query: SAVE_RECIPE, variables: mockSaveRecipeInput },
      { contextValue }
    )
    const { errors }: { errors: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors).toStrictEqual([
      {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
        locations: [{ column: 3, line: 2 }],
        message: 'Unexpected error value: null',
        path: ['saveRecipe']
      }
    ])
  })

  it('should throw an error if context user is null', async () => {
    const result = await testServer.executeOperation(
      { query: SAVE_RECIPE, variables: mockSaveRecipeInput },
      { contextValue: { ...contextValue, user: null } }
    )
    const { errors }: { errors: any | undefined; data: any | undefined } =
      JSON.parse(JSON.stringify(result.body))['singleResult']

    expect(errors[0].message).toBe('Not logged in!')
  })
})

describe('createIngredient', () => {
  const mockIngredientInput = {
    category: 'Meat',
    measure: 'unit',
    name: 'Chicken',
    quantity: 2.5
  }

  const mockCategoryApi = {
    createCategory: jest.fn(),
    getAllCategories: jest.fn(),
    deleteAllCategories: jest.fn(),
    findOrCreateCategory:
      contextValue.dataSources.categoryApi.findOrCreateCategory
  }

  const mockIngredientApi = {
    createIngredient: contextValue.dataSources.ingredientApi.createIngredient,
    deleteIngredient: jest.fn(),
    getAllIngredients: jest.fn(),
    deleteAllIngredients: jest.fn()
  }

  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('returns correct payload', async () => {
    const result = await createSaveIngredient({
      ingredientInput: mockIngredientInput,
      categoryApi: mockCategoryApi,
      ingredientApi: mockIngredientApi
    })
    expect(result?.category.name).toBe('Meat')
  })

  it('handles nulls inputs', async () => {
    mockFindOrCreateCategory.mockReturnValueOnce({
      ...mockCreatedCategory,
      name: 'Generic'
    })
    await createSaveIngredient({
      ingredientInput: {
        name: '',
        quantity: 0,
        measure: '',
        category: ''
      },
      categoryApi: mockCategoryApi,
      ingredientApi: mockIngredientApi
    })
    expect(mockFindOrCreateCategory).toHaveBeenCalledWith({
      categoryName: 'Generic'
    })
    expect(mockCreateIngredient).toHaveBeenCalledWith({
      name: 'Generic',
      quantity: 1,
      measure: 'unit',
      category: mockCreatedCategory._id
    })
  })

  it('throws if findOrCreateCategory api fails', async () => {
    mockFindOrCreateCategory.mockImplementationOnce(() => {
      throw new Error('findOrCreateCategory api error')
    })

    try {
      await createSaveIngredient({
        ingredientInput: mockIngredientInput,
        categoryApi: {
          createCategory: jest.fn(),
          getAllCategories: jest.fn(),
          deleteAllCategories: jest.fn(),
          findOrCreateCategory:
            contextValue.dataSources.categoryApi.findOrCreateCategory
        },
        ingredientApi: {
          createIngredient:
            contextValue.dataSources.ingredientApi.createIngredient,
          deleteIngredient: jest.fn(),
          getAllIngredients: jest.fn(),
          deleteAllIngredients: jest.fn()
        }
      })
    } catch (error) {
      expect(error).toStrictEqual(new Error('findOrCreateCategory api error'))
    }
  })

  it('returns null if createIngredient api fails', async () => {
    mockCreateIngredient.mockImplementationOnce(() => {
      throw new Error('createIngredient api error')
    })
    try {
      await createSaveIngredient({
        ingredientInput: mockIngredientInput,
        categoryApi: {
          createCategory: jest.fn(),
          getAllCategories: jest.fn(),
          deleteAllCategories: jest.fn(),
          findOrCreateCategory:
            contextValue.dataSources.categoryApi.findOrCreateCategory
        },
        ingredientApi: {
          createIngredient:
            contextValue.dataSources.ingredientApi.createIngredient,
          deleteIngredient: jest.fn(),
          getAllIngredients: jest.fn(),
          deleteAllIngredients: jest.fn()
        }
      })
    } catch (error) {
      expect(error).toStrictEqual(new Error('createIngredient api error'))
    }
  })
})

describe('createSaveIngredients', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should omit an ingredient if ingredient creation fails', async () => {
    jest
      .spyOn(saveRecipeMethods, 'createSaveIngredient')
      .mockRejectedValue(new Error('Ingredient creation failed'))
    await expect(
      createSaveIngredients({
        ingredients: [],
        categoryApi: {
          createCategory: jest.fn(),
          getAllCategories: jest.fn(),
          deleteAllCategories: jest.fn(),
          findOrCreateCategory:
            contextValue.dataSources.categoryApi.findOrCreateCategory
        },
        ingredientApi: {
          createIngredient:
            contextValue.dataSources.ingredientApi.createIngredient,
          deleteIngredient: jest.fn(),
          getAllIngredients: jest.fn(),
          deleteAllIngredients: jest.fn()
        }
      })
    ).resolves.toEqual([])
  })
})
