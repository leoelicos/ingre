import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { typeDefs } from 'schemas/typeDefs'
import { resolvers } from 'schemas/resolvers'
import 'utils/auth'

const mockGetUserSavedRecipes = jest.fn()
const mockUserSavedRecipes = [
  {
    _id: '67179523a5b4544355ebab56',
    name: 'Roast duck',
    portions: 5,
    ingredients: [
      {
        _id: '675acc2fab6815670847bed4',
        category: {
          _id: '67178ab14b95dc5ac046da62',
          name: 'Meat'
        },
        measure: 'unit',
        name: 'Duck',
        quantity: 1.5
      }
    ],
    picture_url: 'www.duck0.com',
    edamamId: '4bd3f94346ff2cb493285199f5f06f71',
    instructions: 'Cook it3'
  },
  {
    _id: '675440fe65ec6e62c95f5eaa',
    name: 'Roast chicken',
    portions: 2,
    ingredients: [
      {
        _id: '675440fd65ec6e62c95f5ea6',
        category: {
          _id: '67178ab14b95dc5ac046da62',
          name: 'Meat'
        },
        measure: 'unit',
        name: 'Chicken',
        quantity: 2.5
      }
    ],
    picture_url: 'www.google.com',
    edamamId: '4bd3f94346ff2cb493285199f5f06f71',
    instructions: 'Make it'
  }
]

const mockUser = {
  _id: '64a92550c9acc32c05995a5f',
  firstName: 'pro',
  lastName: 'pro',
  email: 'pro@ingre.com',
  password: '$2b$10$aMyVYp/RuQWeVVefUl7Wj.m.AcOoR54LoFhCvtnOz6rx2O9qTNkI.',
  savedRecipes: ['67179523a5b4544355ebab56', '675440fe65ec6e62c95f5eaa'],
  pro: true,
  __v: 0,
  numSavedRecipes: 2,
  id: '64a92550c9acc32c05995a5f'
}

export const GET_SAVED_RECIPES = gql`
  query GetSavedRecipes {
    getSavedRecipes {
      _id
      name
      portions
      ingredients {
        _id
        category {
          _id
          name
        }
        measure
        name
        quantity
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

const contextValue = {
  headers: {},
  dataSources: {
    userApi: {
      getUserSavedRecipes: (e: any) => mockGetUserSavedRecipes(e)
    }
  },
  user: mockUser
}

describe('getUser', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should get saved recipes', async () => {
    mockGetUserSavedRecipes.mockReturnValueOnce(mockUserSavedRecipes)

    const result = await testServer.executeOperation(
      { query: GET_SAVED_RECIPES },
      { contextValue }
    )

    const {
      errors,
      data = {}
    }: { errors: any | undefined; data: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors).toBeUndefined()
    expect(data.getSavedRecipes).toStrictEqual(mockUserSavedRecipes)
  })

  it('should throw an error if context user is null', async () => {
    mockGetUserSavedRecipes.mockReturnValueOnce(mockUserSavedRecipes)

    const result = await testServer.executeOperation(
      { query: GET_SAVED_RECIPES },
      { contextValue: { ...contextValue, user: null } }
    )
    const {
      errors,
      data = {}
    }: { errors: any | undefined; data: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors[0].message).toBe('Unexpected error value: "Not logged in!"')
    expect(data.getSavedRecipes).toBeNull()
  })
})
