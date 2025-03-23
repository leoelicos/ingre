import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { UserInput } from 'schemas/types'
import { typeDefs } from 'schemas/typeDefs'
import { resolvers } from 'schemas/resolvers'
import 'utils/auth'

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

  it('should get context user', async () => {
    mockFindOneUserById.mockReturnValueOnce(mockUser)

    const result = await testServer.executeOperation(
      { query: GET_USER },
      { contextValue }
    )

    const {
      errors,
      data = {}
    }: { errors: any | undefined; data: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors).toBeUndefined()
    expect(data.getUser).toStrictEqual(mockUser)
  })

  it('should throw an error if context user is null', async () => {
    mockFindOneUserById.mockReturnValueOnce(mockUser)

    const result = await testServer.executeOperation(
      { query: GET_USER },
      { contextValue: { ...contextValue, user: null } }
    )
    const {
      errors,
      data = {}
    }: { errors: any | undefined; data: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors[0].message).toBe('Not logged in!')
    expect(data.getUser).toBeNull()
  })

  it('should throw an error if context user has no _id', async () => {
    mockFindOneUserById.mockReturnValueOnce(mockUser)

    const result = await testServer.executeOperation(
      { query: GET_USER },
      { contextValue: { ...contextValue, user: {} } }
    )
    const {
      errors,
      data = {}
    }: { errors: any | undefined; data: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors[0].message).toBe('Not logged in!')
    expect(data.getUser).toBeNull()
  })
})
