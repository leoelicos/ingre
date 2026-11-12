import { singleResult, withoutUser } from '../../../test-utils/singleResult'
import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { typeDefs } from '../../typeDefs'
import { resolvers } from '../../resolvers'
import '../../../utils/auth'

const mockUser = {
  _id: '12345',
  firstName: 'John',
  lastName: 'Doe',
  email: 'test@example.com'
}
const mockRemoveRecipeInput = {
  recipeId: '671789864b95dc5ac046da54'
}

const mockDeleteRecipe = jest.fn()

export const REMOVE_RECIPE = gql`
  mutation RemoveRecipe($recipeId: ID!) {
    removeRecipe(recipeId: $recipeId)
  }
`

interface ContextValue {
  headers: Record<string, string>
  dataSources: unknown
  user?: object
}

const createTestServer = () =>
  new ApolloServer<ContextValue>({ typeDefs, resolvers })

let testServer = createTestServer()

const contextValue = {
  headers: {},
  dataSources: {
    recipeApi: {
      deleteRecipe: (e: unknown) => mockDeleteRecipe(e)
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
    const { errors } = singleResult(result)
    expect(errors).toBeUndefined()
    // only the user's own recipe; its saves go with it
    expect(mockDeleteRecipe).toHaveBeenCalledWith({
      recipeId: mockRemoveRecipeInput.recipeId,
      userId: mockUser._id
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
    const { errors } = singleResult(result)
    expect(errors?.[0]?.message).toBe('delete recipe error')
  })

  it('should throw an error if context user is null', async () => {
    const result = await testServer.executeOperation(
      { query: REMOVE_RECIPE, variables: mockRemoveRecipeInput },
      { contextValue: withoutUser(contextValue) }
    )
    const { errors } = singleResult(result)
    expect(errors?.[0]?.message).toBe('Not logged in!')
  })
})
