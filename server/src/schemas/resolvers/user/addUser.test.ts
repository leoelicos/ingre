import { isRecord, singleResult } from '../../../test-utils/singleResult'
import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { UserInput } from '../../types'
import { typeDefs } from '../../typeDefs'
import { resolvers } from '../../resolvers'
import { Types } from 'mongoose'
import { readUserFromAuthHeader } from '../../../utils/auth'

const input: UserInput = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
}

const SECRET = 'addUser-test-secret'
process.env['JWT_SECRET'] = SECRET

const mockUserId = new Types.ObjectId()

const mockUser = {
  _id: mockUserId,
  firstName: input.firstName,
  lastName: input.lastName,
  email: input.email,
  pro: false,
  savedRecipes: []
}
const mockFindOneUser = jest.fn()
const mockCreateUser = jest.fn()

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
      findOneUser: (e: unknown) => mockFindOneUser(e),
      createUser: (e: unknown) => mockCreateUser(e)
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

    const result = await testServer.executeOperation(
      { query: ADD_USER, variables: { input } },
      { contextValue }
    )

    const { errors, data = {} } = singleResult(result)

    expect(errors).toBeUndefined()
    const added = data?.['addUser']
    if (!isRecord(added)) throw new Error('expected addUser')
    expect(added['user']).toStrictEqual({
      _id: mockUserId.toString(),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email
    })
    // the real signToken: the token carries the new user
    expect(
      readUserFromAuthHeader(`Bearer ${String(added['token'])}`, SECRET)?.email
    ).toBe(input.email)
    expect(mockFindOneUser).toHaveBeenCalledWith({ email: input.email })
    expect(mockCreateUser).toHaveBeenCalledWith(input)
  })

  it('should throw an error if the email is already in use', async () => {
    mockFindOneUser.mockReturnValueOnce(mockUser)
    mockCreateUser.mockReturnValueOnce(mockUser)

    const result = await testServer.executeOperation(
      { query: ADD_USER, variables: { input } },
      { contextValue }
    )
    const { errors, data = {} } = singleResult(result)

    expect(errors?.[0]?.message).toBe('Email already in use')
    expect(data).toBeNull()
    expect(mockFindOneUser).toHaveBeenCalledWith({ email: input.email })
    expect(mockCreateUser).not.toHaveBeenCalled()
  })
})
