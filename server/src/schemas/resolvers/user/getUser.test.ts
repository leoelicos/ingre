import { singleResult, withoutUser } from '../../../test-utils/singleResult'
import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { UserInput } from '../../types'
import { typeDefs } from '../../typeDefs'
import { resolvers } from '../../resolvers'
import '../../../utils/auth'

const mockFindOneUserById = jest.fn()
const input: UserInput = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
}
const mockUserId = '12345'
const mockUser = {
  _id: mockUserId,
  firstName: input.firstName,
  lastName: input.lastName,
  pro: false,
  email: input.email
}

export const GET_USER = gql`
  query GetUser {
    getUser {
      _id
      email
      firstName
      lastName
      pro
    }
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
    userApi: {
      findOneUserById: (e: unknown) => mockFindOneUserById(e)
    }
  },
  user: mockUser
}

describe('getUser', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should get context user', async () => {
    mockFindOneUserById.mockReturnValueOnce(mockUser)

    const result = await testServer.executeOperation(
      { query: GET_USER },
      { contextValue }
    )

    const { errors, data = {} } = singleResult(result)

    expect(errors).toBeUndefined()
    expect(data?.['getUser']).toStrictEqual(mockUser)
  })

  it('should throw an error if context user is null', async () => {
    mockFindOneUserById.mockReturnValueOnce(mockUser)

    const result = await testServer.executeOperation(
      { query: GET_USER },
      { contextValue: withoutUser(contextValue) }
    )
    const { errors, data = {} } = singleResult(result)

    expect(errors?.[0]?.message).toBe('Not logged in!')
    expect(data).toBeNull()
  })

  it('should throw NOT_FOUND if the user no longer exists', async () => {
    mockFindOneUserById.mockResolvedValueOnce(null)

    const result = await testServer.executeOperation(
      { query: GET_USER },
      { contextValue }
    )
    const { errors, data } = singleResult(result)

    expect(errors?.[0]?.message).toBe('Could not find user')
    expect(errors?.[0]?.['extensions']).toEqual({ code: 'NOT_FOUND' })
    expect(data).toBeNull()
  })
})
