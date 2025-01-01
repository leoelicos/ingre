import { Types } from 'mongoose'
import { ApolloServer } from '@apollo/server'
import { typeDefs } from 'schemas/typeDefs'
import { resolvers } from 'schemas/resolvers'
import gql from 'graphql-tag'

export const GET_RECIPE = gql`
  query GetRecipe($id: ID!) {
    getRecipe(_id: $id) {
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

const mockUser = {
  _id: '64a92550c9acc32c05995a5f',
  firstName: 'pro',
  lastName: 'pro',
  email: 'pro@ingre.com',
  password: '$2b$10$aMyVYp/RuQWeVVefUl7Wj.m.AcOoR54LoFhCvtnOz6rx2O9qTNkI.',
  savedRecipes: ['67179523a5b4544355ebab56', '675440fe65ec6e62c95f5eaa'],
  pro: true,
  numSavedRecipes: 2,
  id: '64a92550c9acc32c05995a5f'
}

interface ContextValue {
  headers: object
  dataSources: { recipeApi: object }
  user: object | null
}

const createTestServer = () =>
  new ApolloServer<ContextValue>({ typeDefs, resolvers })

let testServer = createTestServer()

const mockGetRecipe = jest.fn()
const contextValue = {
  headers: {},
  dataSources: {
    recipeApi: {
      getRecipe: (e: any) => mockGetRecipe(e)
    }
  },
  user: mockUser
}

describe('getRecipe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // GraphQL responses return _id fields as strings
  const recipeId = new Types.ObjectId().toHexString()
  const chickenId = new Types.ObjectId().toHexString()
  const broccoliId = new Types.ObjectId().toHexString()
  const meatId = new Types.ObjectId().toHexString()
  const vegetableId = new Types.ObjectId().toHexString()

  const recipe = {
    _id: recipeId,
    name: 'Test Recipe',
    portions: 4,
    ingredients: [],
    picture_url: 'http://example.com/image.jpg',
    edamamId: 'some-edamam-id',
    instructions: 'Test instructions'
  }
  // GraphQL responses return _id fields as strings
  const populatedRecipe = {
    ...recipe,
    ingredients: [
      {
        _id: chickenId,
        name: 'Chicken',
        quantity: 1,
        measure: 'unit',
        category: { _id: meatId, name: 'meat' }
      },
      {
        _id: broccoliId,
        name: 'Broccoli',
        quantity: 2,
        measure: 'head',
        category: { _id: vegetableId, name: 'vegetable' }
      }
    ]
  }

  it('should return the recipe when found', async () => {
    mockGetRecipe.mockResolvedValueOnce(populatedRecipe)
    const result = await testServer.executeOperation(
      { query: GET_RECIPE, variables: { id: recipeId } },
      { contextValue }
    )

    const {
      errors,
      data = {}
    }: { errors: any | undefined; data: any | undefined } = JSON.parse(
      JSON.stringify(result?.body)
    )['singleResult']
    expect(data.getRecipe).toStrictEqual(populatedRecipe)
    expect(errors).toBe(undefined)
    expect(mockGetRecipe).toHaveBeenCalled()
  })

  it('should throw an error if the recipe is not found', async () => {
    mockGetRecipe.mockResolvedValueOnce(null)

    const result = await testServer.executeOperation(
      { query: GET_RECIPE, variables: { id: recipeId } },
      { contextValue }
    )

    const { errors }: { errors: any | undefined; data: any | undefined } =
      JSON.parse(JSON.stringify(result?.body))['singleResult']

    expect(errors).toStrictEqual([
      {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
        locations: [{ column: 3, line: 2 }],
        message: 'could not find recipe',
        path: ['getRecipe']
      }
    ])
  })

  it('should throw an error if api error occurs', async () => {
    mockGetRecipe.mockImplementationOnce(() => {
      throw new Error('Unexpected error')
    })

    const result = await testServer.executeOperation(
      { query: GET_RECIPE, variables: { id: recipeId } },
      { contextValue }
    )

    const { errors }: { errors: any | undefined } = JSON.parse(
      JSON.stringify(result?.body)
    )['singleResult']

    expect(errors).toStrictEqual([
      {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
        locations: [{ column: 3, line: 2 }],
        message: 'Unexpected error',
        path: ['getRecipe']
      }
    ])
  })

  it('should throw an error if no user is found', async () => {
    mockGetRecipe.mockResolvedValueOnce(populatedRecipe)

    const result = await testServer.executeOperation(
      { query: GET_RECIPE, variables: { id: recipeId } },
      { contextValue: { ...contextValue, user: null } }
    )
    const { errors }: { errors: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors[0].message).toBe('Not logged in!')
  })
})
