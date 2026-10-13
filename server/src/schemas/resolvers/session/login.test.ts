import { singleResult } from '../../../test-utils/singleResult'
import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { UserInput } from '../../types'
import { typeDefs } from '../../typeDefs'
import { resolvers } from '../../resolvers'
import '../../../utils/auth'

const mockSignToken = jest.fn()
const mockFindOneUser = jest.fn()
const mockCheckUserPassword = jest.fn()

const mockToken = 'token'

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

jest.mock('../../../utils/auth', () => ({
  signToken: (e: unknown) => mockSignToken(e)
}))

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
  const mockUserId = '12345'
  const mockUser = {
    _id: mockUserId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email
  }

  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should login and return the token and user', async () => {
    mockCheckUserPassword.mockReturnValueOnce(mockUser)
    mockSignToken.mockReturnValueOnce(mockToken)

    const result = await testServer.executeOperation(
      {
        query: LOGIN,
        variables: { email: input.email, password: input.password }
      },
      contextValue
    )

    const { errors, data = {} } = singleResult(result)

    expect(errors).toBeUndefined()
    expect(data?.login).toStrictEqual({
      user: { _id: mockUser._id },
      token: mockToken
    })
    expect(mockCheckUserPassword).toHaveBeenCalledWith({
      email: input.email,
      password: input.password
    })
    expect(mockSignToken).toHaveBeenCalledWith(mockUser)
  })

  it('should throw an error if checkUserPassword returns false', async () => {
    mockCheckUserPassword.mockReturnValueOnce(null)
    mockSignToken.mockReturnValueOnce(mockToken)

    const result = await testServer.executeOperation(
      {
        query: LOGIN,
        variables: { email: input.email, password: input.password }
      },
      contextValue
    )
    const { errors, data = {} } = singleResult(result)

    expect(errors?.[0].message).toBe('Incorrect credentials')
    expect(data?.login).toBeNull()
    expect(mockSignToken).not.toHaveBeenCalled()
  })

  it('should throw an error if checkUserPassword throws', async () => {
    mockCheckUserPassword.mockRejectedValueOnce(null)
    mockSignToken.mockReturnValueOnce(mockToken)

    const result = await testServer.executeOperation(
      {
        query: LOGIN,
        variables: { email: input.email, password: input.password }
      },
      contextValue
    )
    const { errors, data } = singleResult(result)

    expect(errors?.[0].message).toBe('Unexpected error value: null')
    expect(data?.login).toBeNull()
    expect(mockSignToken).not.toHaveBeenCalled()
  })
})
