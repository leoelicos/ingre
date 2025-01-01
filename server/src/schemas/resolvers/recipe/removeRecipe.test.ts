import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { typeDefs } from 'schemas/typeDefs'
import { resolvers } from 'schemas/resolvers'
import 'utils/auth'

const mockUser = {
  _id: '12345',
  firstName: 'John',
  lastName: 'Doe',
  email: 'test@example.com'
}
const mockRemoveRecipeInput = {
  recipeId: '671789864b95dc5ac046da54'
}

const mockRemoveRecipeFromUser = jest.fn()
const mockDeleteRecipe = jest.fn()

export const REMOVE_RECIPE = gql`
  mutation RemoveRecipe($recipeId: ID!) {
    removeRecipe(recipeId: $recipeId)
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
      removeRecipeFromUser: (e: any) => mockRemoveRecipeFromUser(e)
    },
    recipeApi: {
      deleteRecipe: (e: any) => mockDeleteRecipe(e)
    }
  },
  user: mockUser
}

describe('removeRecipe', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('should call deleteRecipe', async () => {
    const result = await testServer.executeOperation(
      { query: REMOVE_RECIPE, variables: mockRemoveRecipeInput },
      { contextValue }
    )
    const { errors }: { errors: any | undefined; data: any | undefined } =
      JSON.parse(JSON.stringify(result.body))['singleResult']
    expect(errors).toBeUndefined()
    expect(mockDeleteRecipe).toHaveBeenCalledWith({
      recipeId: mockRemoveRecipeInput.recipeId
    })
    expect(mockRemoveRecipeFromUser).toHaveBeenCalledWith({
      userId: mockUser._id,
      recipeId: mockRemoveRecipeInput.recipeId
    })
  })

  it('should throw error when deleteRecipe fails', async () => {
    mockDeleteRecipe.mockImplementationOnce(() => {
      throw new Error('delete recipe error')
    })
    const result = await testServer.executeOperation(
      { query: REMOVE_RECIPE, variables: mockRemoveRecipeInput },
      { contextValue }
    )
    const { errors }: { errors: any | undefined; data: any | undefined } =
      JSON.parse(JSON.stringify(result.body))['singleResult']
    expect(errors[0].message).toBe('delete recipe error')
  })

  it('should throw error when removeRecipeFromUser fails', async () => {
    mockRemoveRecipeFromUser.mockImplementationOnce(() => {
      throw new Error('remove recipe from user error')
    })
    const result = await testServer.executeOperation(
      { query: REMOVE_RECIPE, variables: mockRemoveRecipeInput },
      { contextValue }
    )
    const { errors }: { errors: any | undefined; data: any | undefined } =
      JSON.parse(JSON.stringify(result.body))['singleResult']
    expect(errors[0].message).toBe('remove recipe from user error')
  })

  it('should throw an error if context user is null', async () => {
    const result = await testServer.executeOperation(
      { query: REMOVE_RECIPE, variables: mockRemoveRecipeInput },
      { contextValue: { ...contextValue, user: null } }
    )
    const { errors }: { errors: any | undefined; data: any | undefined } =
      JSON.parse(JSON.stringify(result.body))['singleResult']
    expect(errors[0].message).toBe('Not logged in!')
  })
})
