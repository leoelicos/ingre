import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { typeDefs } from 'schemas/typeDefs'
import { resolvers } from 'schemas/resolvers'
import 'utils/auth'

const mockUpdateRecipe = jest.fn()
const mockUser = {
  _id: '12345',
  firstName: 'John',
  lastName: 'Doe',
  email: 'test@example.com'
}
const mockUpdateRecipeInput = {
  recipeId: '67179523a5b4544355ebab56',
  input: {
    edamamId: '4bd3f94346ff2cb493285199f5f06f71',
    ingredients: [
      {
        category: 'Meat',
        measure: 'unit',
        name: 'Duck',
        quantity: 1.5
      }
    ],
    instructions: 'Cook it3',
    name: 'Roast duck',
    picture_url: 'www.duck2.com',
    portions: 5
  }
}
const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($recipeId: ID!, $input: RecipeInput!) {
    updateRecipe(recipeId: $recipeId, input: $input) {
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

const mockUpdatedRecipe = {
  _id: '67179523a5b4544355ebab56',
  name: 'Roast duck',
  portions: 5,
  ingredients: [
    {
      _id: '675abc26259a9ced5be2dbf1',
      name: 'Duck',
      quantity: 1.5,
      measure: 'unit',
      category: { _id: '67178ab14b95dc5ac046da62', name: 'Meat' }
    }
  ],
  picture_url: 'www.duck3.com',
  edamamId: '4bd3f94346ff2cb493285199f5f06f71',
  instructions: 'Cook it3'
}
mockUpdateRecipe.mockReturnValue(mockUpdatedRecipe)

const contextValue = {
  headers: {},
  dataSources: {
    userApi: {},
    categoryApi: {},
    ingredientApi: {},
    recipeApi: {
      updateRecipe: (e: any) => mockUpdateRecipe(e)
    }
  },
  user: mockUser
}

// retest
describe('updateRecipe', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('updates a recipe', async () => {
    const result = await testServer.executeOperation(
      { query: UPDATE_RECIPE, variables: mockUpdateRecipeInput },
      { contextValue }
    )
    const response2: { errors: any | undefined; data: any | undefined } =
      JSON.parse(JSON.stringify(result.body))['singleResult']
    expect(response2.errors).toBeUndefined()
    expect(response2.data.updateRecipe).toStrictEqual(mockUpdatedRecipe)
  })

  it('handles updateRecipe error', async () => {
    mockUpdateRecipe.mockImplementationOnce(() => {
      throw new Error('mongoose error')
    })
    const result = await testServer.executeOperation(
      { query: UPDATE_RECIPE, variables: mockUpdateRecipeInput },
      { contextValue }
    )
    const response2: { errors: any | undefined; data: any | undefined } =
      JSON.parse(JSON.stringify(result.body))['singleResult']
    expect(response2.errors).toStrictEqual([
      {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
        locations: [{ column: 3, line: 2 }],
        message: 'mongoose error',
        path: ['updateRecipe']
      }
    ])
    expect(response2.data.updateRecipe).toBeNull()
  })

  it('should throw an error if context user is null', async () => {
    const result = await testServer.executeOperation(
      { query: UPDATE_RECIPE, variables: mockUpdateRecipeInput },
      { contextValue: { ...contextValue, user: null } }
    )
    const { errors }: { errors: any | undefined; data: any | undefined } =
      JSON.parse(JSON.stringify(result.body))['singleResult']
    expect(errors[0].message).toBe('Not logged in!')
  })
})
