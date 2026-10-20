import { isRecord, singleResult } from '../../../test-utils/singleResult'
import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { UserInput } from '../../types'
import { typeDefs } from '../../typeDefs'
import { resolvers } from '../../resolvers'
import { Types } from 'mongoose'
import { readUserFromAuthHeader } from '../../../utils/auth'

const SECRET = 'login-test-secret'
process.env['JWT_SECRET'] = SECRET

const mockFindOneUser = jest.fn()
const mockCheckUserPassword = jest.fn()

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
      }
    }
  }
`

interface ContextValue {
  headers: Record<string, string>
  dataSources: unknown
  // user: User //! TODO: prevent login if already logged in
}

const createTestServer = () =>
  new ApolloServer<ContextValue>({ typeDefs, resolvers })

let testServer = createTestServer()

const contextValue = {
  contextValue: {
    headers: {},
    dataSources: {
      userApi: {
        findOneUser: (e: unknown) => mockFindOneUser(e),
        checkUserPassword: (e: unknown) => mockCheckUserPassword(e)
      }
    }
  }
}

describe('login', () => {
  const input: UserInput = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  }
  const mockUserId = new Types.ObjectId()
  const mockUser = {
    _id: mockUserId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    pro: false,
    savedRecipes: []
  }

  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should login and return the token and user', async () => {
    mockCheckUserPassword.mockReturnValueOnce(mockUser)

    const result = await testServer.executeOperation(
      {
        query: LOGIN,
        variables: { email: input.email, password: input.password }
      },
      contextValue
    )

    const { errors, data = {} } = singleResult(result)

    expect(errors).toBeUndefined()
    const login = data?.['login']
    if (!isRecord(login)) throw new Error('expected login')
    expect(login['user']).toStrictEqual({ _id: mockUserId.toString() })
    // the real signToken: the token carries the user who logged in
    expect(
      readUserFromAuthHeader(
        `Bearer ${String(login['token'])}`,
        SECRET
      )?._id.toString()
    ).toBe(mockUserId.toString())
    expect(mockCheckUserPassword).toHaveBeenCalledWith({
      email: input.email,
      password: input.password
    })
  })

  it('should throw an error if checkUserPassword returns false', async () => {
    mockCheckUserPassword.mockReturnValueOnce(null)

    const result = await testServer.executeOperation(
      {
        query: LOGIN,
        variables: { email: input.email, password: input.password }
      },
      contextValue
    )
    const { errors, data = {} } = singleResult(result)

    expect(errors?.[0]?.message).toBe('Incorrect credentials')
    expect(data).toBeNull()
  })

  it('should throw an error if checkUserPassword throws', async () => {
    mockCheckUserPassword.mockRejectedValueOnce(null)

    const result = await testServer.executeOperation(
      {
        query: LOGIN,
        variables: { email: input.email, password: input.password }
      },
      contextValue
    )
    const { errors, data } = singleResult(result)

    expect(errors?.[0]?.message).toBe('Unexpected error value: null')
    expect(data).toBeNull()
  })
})
