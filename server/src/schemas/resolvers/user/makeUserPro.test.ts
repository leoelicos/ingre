import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { UserInput } from '../../types'
import { typeDefs } from '../../typeDefs'
import { resolvers } from '../../resolvers'
import '../../../utils/auth'
import { Types } from 'mongoose'

const mockMakeUserPro = jest.fn()

export const MAKE_USER_PRO = gql`
  mutation MakeUserPro {
    makeUserPro {
      _id
      pro
    }
  }
`

interface ContextValue {
  headers: Record<string, string>
  dataSources: any
}

const createTestServer = () =>
  new ApolloServer<ContextValue>({ typeDefs, resolvers })

let testServer = createTestServer()

const contextValue = {
  headers: {},
  dataSources: { userApi: { makeUserPro: mockMakeUserPro } } as any,
  user: {
    _id: new Types.ObjectId(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    pro: false,
    savedRecipes: [],
    numSavedRecipes: 0
  }
}

describe('makeUserPro', () => {
  const input: UserInput = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  }
  const mockUserId = '12345'
  const mockProUser = {
    _id: mockUserId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    pro: true
  }

  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should make user pro', async () => {
    mockMakeUserPro.mockReturnValueOnce(mockProUser)

    const result = await testServer.executeOperation(
      { query: MAKE_USER_PRO },
      { contextValue: contextValue as any }
    )

    const {
      errors,
      data = {}
    }: { errors: unknown | undefined; data: { [key: string]: unknown } | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect(errors).toBeUndefined()
    expect((data as any)?.makeUserPro).toStrictEqual({ _id: mockUserId, pro: true })
  })

  it('should throw an error if there was an error with makeUserPro', async () => {
    mockMakeUserPro.mockRejectedValueOnce(new Error('User not found'))

    const result = await testServer.executeOperation(
      { query: MAKE_USER_PRO },
      { contextValue: contextValue as any }
    )
    const {
      errors,
      data = {}
    }: { errors: unknown | undefined; data: { [key: string]: unknown } | undefined } = JSON.parse(
      JSON.stringify(result.body)
    )['singleResult']

    expect((errors as { message: string }[])[0].message).toBe('User not found')
    expect((data as any)?.makeUserPro).toBeNull()
  })

  it('should throw an error if context user is null', async () => {
    const newContextValue = JSON.parse(JSON.stringify(contextValue))
    newContextValue.user = undefined

    const result = await testServer.executeOperation(
      {
        query: MAKE_USER_PRO,
        variables: { email: input.email, password: input.password }
      },
      { contextValue: newContextValue }
    )
    const { errors, data }: { errors: unknown | undefined; data: { [key: string]: unknown } | undefined } =
      JSON.parse(JSON.stringify(result.body))['singleResult']

    expect((errors as { message: string }[])[0].message).toBe('Not logged in!')
    expect((data as any)?.makeUserPro).toBeNull()
  })
})
