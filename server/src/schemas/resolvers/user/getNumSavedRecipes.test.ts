import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { typeDefs } from 'schemas/typeDefs'
import { resolvers } from 'schemas/resolvers'
import 'utils/auth'

const mockFindOneUserById = jest.fn()
const mockUser = {
  _id: '64a92550c9acc32c05995a5f',
  firstName: 'pro',
  lastName: 'pro',
  email: 'pro@ingre.com',
  savedRecipes: ['67179523a5b4544355ebab56', '675440fe65ec6e62c95f5eaa'],
  pro: true,
  numSavedRecipes: 7,
  id: '64a92550c9acc32c05995a5f'
}

export const GET_NUM_SAVED_RECIPES = gql`
  query getNumSavedRecipes {
    getNumSavedRecipes
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
      findOneUserById: (e: any) => mockFindOneUserById(e)
    }
  },
  user: mockUser
}

describe('getUser', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should get number of saved recipes', async () => {
    mockFindOneUserById.mockReturnValueOnce({
      ...mockUser,
      savedRecipes: [
        {
          _id: '67179523a5b4544355ebab56',
          name: 'Roast duck',
          portions: 5,
          ingredients: [
            {
              _id: '675acc2fab6815670847bed4',
              name: 'Duck',
              quantity: 1.5,
              measure: 'unit',
              category: {
                _id: '67178ab14b95dc5ac046da62',
                name: 'Meat',
                __v: 0,
                id: '67178ab14b95dc5ac046da62'
              },
              __v: 0,
              id: '675acc2fab6815670847bed4'
            }
          ],
          picture_url: 'www.duck4.com',
          edamamId: '4bd3f94346ff2cb493285199f5f06f71',
          instructions: 'Cook it3',
          __v: 9,
          id: '67179523a5b4544355ebab56'
        },
        {
          _id: '675440fe65ec6e62c95f5eaa',
          name: 'Roast chicken',
          portions: 2,
          ingredients: [
            {
              _id: '675440fd65ec6e62c95f5ea6',
              name: 'Chicken',
              quantity: 2.5,
              measure: 'unit',
              category: {
                _id: '67178ab14b95dc5ac046da62',
                name: 'Meat',
                __v: 0,
                id: '67178ab14b95dc5ac046da62'
              },
              __v: 0,
              id: '675440fd65ec6e62c95f5ea6'
            }
          ],
          picture_url: 'www.google.com',
          edamamId: '4bd3f94346ff2cb493285199f5f06f71',
          instructions: 'Make it',
          __v: 0,
          id: '675440fe65ec6e62c95f5eaa'
        }
      ],
      pro: true,
      numSavedRecipes: 2,
      id: '64a92550c9acc32c05995a5f'
    })

    const result = await testServer.executeOperation(
      { query: GET_NUM_SAVED_RECIPES },
      { contextValue }
    )

    const {
      errors,
      data = {}
    }: { errors: any | undefined; data: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors).toBeUndefined()
    expect(data.getNumSavedRecipes).toStrictEqual(2)
  })

  it('should throw an error if context user is null', async () => {
    mockFindOneUserById.mockReturnValueOnce(mockUser)

    const result = await testServer.executeOperation(
      { query: GET_NUM_SAVED_RECIPES },
      { contextValue: { ...contextValue, user: null } }
    )
    const {
      errors,
      data = {}
    }: { errors: any | undefined; data: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors[0].message).toBe('Not logged in!')
    expect(data.getNumSavedRecipes).toBeNull()
  })

  it('should throw an error if no user is found', async () => {
    mockFindOneUserById.mockReturnValueOnce(null)

    const result = await testServer.executeOperation(
      { query: GET_NUM_SAVED_RECIPES },
      { contextValue }
    )
    const {
      errors,
      data = {}
    }: { errors: any | undefined; data: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors[0].message).toBe('Could not find user')
    expect(data.getNumSavedRecipes).toBeNull()
  })
})
