import { singleResult } from '../../../test-utils/singleResult'
import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { typeDefs } from '../../typeDefs'
import { resolvers } from '../../resolvers'
import '../../../utils/auth'
import { getRootEndpointFromHeaders } from './checkout'

const mockUser = {
  _id: '12345',
  firstName: 'John',
  lastName: 'Doe',
  email: 'test@example.com',
  pro: false,
  savedRecipes: [],
  numSavedRecipes: 0
}

const mockStripePay = jest.fn()

export const CHECKOUT = gql`
  query Checkout {
    checkout {
      session
    }
  }
`

interface ContextValue {
  headers?: { referer?: string }
  dataSources: unknown
  user?: object
}

const createTestServer = () =>
  new ApolloServer<ContextValue>({ typeDefs, resolvers })

let testServer = createTestServer()

const contextValue: ContextValue = {
  headers: { referer: 'http://localhost:3000/some-page' },
  dataSources: {
    stripeApi: {
      stripePay: (e: unknown) => mockStripePay(e)
    }
  },
  user: mockUser
}

describe('checkout', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should check out', async () => {
    mockStripePay.mockReturnValueOnce({ id: 'mockstripeid' })

    const result = await testServer.executeOperation(
      { query: CHECKOUT },
      { contextValue }
    )

    const { errors, data = {} } = singleResult(result)

    expect(errors).toBeUndefined()
    expect(data?.checkout).toStrictEqual({ session: 'mockstripeid' })
    expect(mockStripePay).toHaveBeenCalledWith({
      productName: 'ingré PRO',
      productDescription: 'Access instructions to cook each recipe',
      productImages: [
        'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'
      ],
      productCost: 500,
      productCurrency: 'usd',
      rootEndpoint: 'http://localhost:3000'
    })
  })

  it('util function "getRootEndpointFromHeaders" extracts the right origin from the URL', async () => {
    expect(getRootEndpointFromHeaders({ headers: undefined })).toBe('')
    expect(getRootEndpointFromHeaders({ headers: { referer: '' } })).toBe('')
    expect(
      getRootEndpointFromHeaders({
        headers: { referer: 'http://localhost:3000/some-page' }
      })
    ).toBe('http://localhost:3000')
  })

  it('should throw an error if stripePay fails', async () => {
    mockStripePay.mockRejectedValueOnce(null)

    const result = await testServer.executeOperation(
      { query: CHECKOUT },
      { contextValue }
    )
    const { errors, data = {} } = singleResult(result)

    expect(errors?.[0].message).toBe('could not create stripe response')
    expect(data?.checkout).toBeNull()
  })

  it('if headers is null, stripePay is called with blank referrer', async () => {
    mockStripePay.mockReturnValueOnce({ id: 'mockstripeid' })

    const result = await testServer.executeOperation(
      { query: CHECKOUT },
      {
        contextValue: {
          ...contextValue,
          headers: { referer: 'http://localhost:3000/some-page' }
        }
      }
    )

    const { errors, data = {} } = singleResult(result)

    expect(errors).toBeUndefined()
    expect(data?.checkout).toStrictEqual({ session: 'mockstripeid' })
  })
})
