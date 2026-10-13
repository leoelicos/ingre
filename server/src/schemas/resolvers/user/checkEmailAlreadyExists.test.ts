import { singleResult } from '../../../test-utils/singleResult'
import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { typeDefs } from '../../typeDefs'
import { resolvers } from '../../resolvers'
import '../../../utils/auth'

const mockFindOneUser = jest.fn()

const mockUser = {
  _id: '123',
  firstName: '234',
  lastName: '345',
  pro: false,
  email: 'test@example.com'
}

export const CHECK_EMAIL_ALREADY_EXISTS = gql`
  query CheckEmailAlreadyExists($email: String!) {
    checkEmailAlreadyExists(email: $email)
  }
`

interface ContextValue {
  headers: Record<string, string>
  dataSources: unknown
}

const createTestServer = () =>
  new ApolloServer<ContextValue>({ typeDefs, resolvers })

let testServer = createTestServer()

const contextValue = {
  headers: {},
  dataSources: {
    userApi: {
      findOneUser: (e: unknown) => mockFindOneUser(e)
    }
  }
}

describe('getUser', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should get context user', async () => {
    mockFindOneUser.mockReturnValueOnce(mockUser)

    const result = await testServer.executeOperation(
      {
        query: CHECK_EMAIL_ALREADY_EXISTS,
        variables: { email: mockUser.email }
      },
      { contextValue }
    )

    const { errors, data = {} } = singleResult(result)

    expect(errors).toBeUndefined()
    expect(data?.checkEmailAlreadyExists).toBe(true)
  })

  it('should return false if findOneUser returns null', async () => {
    mockFindOneUser.mockReturnValueOnce(null)

    const result = await testServer.executeOperation(
      {
        query: CHECK_EMAIL_ALREADY_EXISTS,
        variables: { email: mockUser.email }
      },
      { contextValue }
    )

    const { data = {} } = singleResult(result)

    expect(data?.checkEmailAlreadyExists).toBe(false)
  })

  it('should throw if findOneUser throws', async () => {
    mockFindOneUser.mockRejectedValueOnce(new Error('uh-oh'))

    const result = await testServer.executeOperation(
      {
        query: CHECK_EMAIL_ALREADY_EXISTS,
        variables: { email: mockUser.email }
      },
      { contextValue }
    )

    const { errors, data = {} } = singleResult(result)

    expect(errors?.[0].message).toBe('uh-oh')
    expect(data?.checkEmailAlreadyExists).toBeNull()
  })
})
