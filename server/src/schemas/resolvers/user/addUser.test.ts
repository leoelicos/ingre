import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { UserInput } from 'schemas/types'
import { typeDefs } from 'schemas/typeDefs'
import { resolvers } from 'schemas/resolvers'
import 'utils/auth'

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
  email: input.email
}

const mockSignToken = jest.fn()
const mockFindOneUser = jest.fn()
const mockCreateUser = jest.fn()

const mockToken = 'token'

const ADD_USER = gql`
  mutation AddUser($input: UserInput!) {
    addUser(input: $input) {
      token
      user {
        _id
        email
        firstName
        lastName
      }
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

jest.mock('utils/auth', () => ({ signToken: (e: any) => mockSignToken(e) }))

let testServer = createTestServer()

const contextValue = {
  headers: {},
  dataSources: {
    userApi: {
      findOneUser: (e: any) => mockFindOneUser(e),
      createUser: (e: any) => mockCreateUser(e)
    }
  },
  user: mockUser
}

describe('addUser', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should create a new user and return a token and user', async () => {
    mockFindOneUser.mockReturnValueOnce(null)
    mockCreateUser.mockReturnValueOnce(mockUser)
    mockSignToken.mockReturnValueOnce(mockToken)

    const result = await testServer.executeOperation(
      { query: ADD_USER, variables: { input } },
      { contextValue }
    )

    const {
      errors,
      data = {}
    }: { errors: any | undefined; data: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors).toBeUndefined()
    expect(data.addUser).toStrictEqual({ user: mockUser, token: mockToken })
    expect(mockFindOneUser).toHaveBeenCalledWith({ email: input.email })
    expect(mockCreateUser).toHaveBeenCalledWith(input)
    expect(mockSignToken).toHaveBeenCalledWith(mockUser)
  })

  it('should throw an error if the email is already in use', async () => {
    mockFindOneUser.mockReturnValueOnce(mockUser)
    mockCreateUser.mockReturnValueOnce(mockUser)
    mockSignToken.mockReturnValueOnce(mockToken)

    const result = await testServer.executeOperation(
      { query: ADD_USER, variables: { input } },
      { contextValue }
    )
    const {
      errors,
      data = {}
    }: { errors: any | undefined; data: any | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors[0].message).toBe('Email already in use')
    expect(data.addUser).toBeNull()
    expect(mockFindOneUser).toHaveBeenCalledWith({ email: input.email })
    expect(mockCreateUser).not.toHaveBeenCalled()
    expect(mockSignToken).not.toHaveBeenCalled()
  })
})
