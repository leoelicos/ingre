import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { newPublicId } from '../../../test-utils/ids'
import { useTestDb } from '../../../test-utils/pg'
import { storedUser } from '../../../test-utils/users'
import type Stripe from 'stripe'
import { BillingApi } from '../../../datasources/billing'
import { createDataSources } from '../../../datasources'
import { UserApi, subscriptionFields } from '../../../datasources/user'
import { fakeStripe } from '../../../test-utils/fakeStripe'
import { singleResult } from '../../../test-utils/singleResult'
import { resolvers } from '../../resolvers'
import { typeDefs } from '../../typeDefs'

/* #312: subscribe with a Stripe.js token, end to end on an in-memory Postgres and a Stripe stand-in. */

jest.setTimeout(60000)

const SUBSCRIBE = gql`
  mutation Subscribe($tier: Tier!, $token: String!) {
    subscribe(tier: $tier, token: $token) {
      tier
      status
      active
    }
  }
`

const fake = fakeStripe()
let stripe: Stripe
const server = new ApolloServer({ typeDefs, resolvers })
const userApi = new UserApi()

beforeAll(async () => {
  stripe = await fake.start()
  await new BillingApi(stripe, {}).setUp()
})
useTestDb()
afterAll(() => fake.stop())

const newUser = () =>
  userApi.createUser({
    email: `cook${Math.random()}@example.com`,
    password: 'password123',
    firstName: 'Home',
    lastName: 'Cook'
  })

const signedIn = (_id: string) => ({
  _id,
  firstName: 'Home',
  lastName: 'Cook',
  email: 'cook@example.com',
  pro: false,
  savedRecipes: [],
  numSavedRecipes: 0
})

const run = async (userId: string | null, tier: string, token: string) =>
  singleResult(
    await server.executeOperation(
      { query: SUBSCRIBE, variables: { tier, token } },
      {
        contextValue: {
          dataSources: {
            ...createDataSources(),
            userApi,
            billingApi: new BillingApi(stripe, {})
          },
          ...(userId === null ? {} : { user: signedIn(userId) })
        }
      }
    )
  )

describe('subscribe', () => {
  it('tok_visa: active, and the user has the tier, the Customer and the subscription', async () => {
    const user = await newUser()
    const result = await run(user._id, 'MANAGER', 'tok_visa')
    expect(result.errors).toBeUndefined()
    expect(result.data).toEqual({
      subscribe: { tier: 'MANAGER', status: 'active', active: true }
    })
    const saved = await storedUser(user._id)
    expect(saved).toMatchObject({
      tier: 'MANAGER',
      pro: true,
      active: true,
      subscriptionStatus: 'active',
      stripeCustomerId: expect.stringMatching(/^cus_/),
      stripeSubscriptionId: expect.stringMatching(/^sub_/)
    })
    /* a second tier reuses the Customer and moves the subscription */
    await run(user._id, 'LEADER', 'tok_mastercard')
    const moved = await storedUser(user._id)
    expect(moved.stripeCustomerId).toBe(saved.stripeCustomerId)
    expect(moved.stripeSubscriptionId).toBe(saved.stripeSubscriptionId)
    expect(moved.tier).toBe('LEADER')
  })

  it('tok_visa_chargeDeclined: PAYMENT_DECLINED, and the user is unchanged', async () => {
    const user = await newUser()
    const result = await run(user._id, 'EXPLORER', 'tok_visa_chargeDeclined')
    expect(result.errors?.[0]).toMatchObject({
      extensions: { code: 'PAYMENT_DECLINED', decline: 'card_declined' }
    })
    const saved = await storedUser(user._id)
    expect(saved).toMatchObject({
      tier: null,
      active: false,
      stripeCustomerId: null
    })
  })

  it('tok_chargeCustomerFail: incomplete, not active, no tier', async () => {
    const user = await newUser()
    const result = await run(user._id, 'EXPLORER', 'tok_chargeCustomerFail')
    expect(result.data).toEqual({
      subscribe: { tier: 'EXPLORER', status: 'incomplete', active: false }
    })
    const saved = await storedUser(user._id)
    expect(saved).toMatchObject({
      tier: null,
      active: false,
      subscriptionStatus: 'incomplete'
    })
  })

  it('needs a signed-in user, who still exists', async () => {
    expect((await run(null, 'EXPLORER', 'tok_visa')).errors?.[0]).toMatchObject(
      {
        extensions: { code: 'UNAUTHENTICATED' }
      }
    )
    expect(
      (await run(newPublicId(), 'EXPLORER', 'tok_visa')).errors?.[0]
    ).toMatchObject({ extensions: { code: 'NOT_FOUND' } })
  })
})

describe('setSubscription (what the webhook writes)', () => {
  it('a cancelled subscription clears the tier; a failed payment keeps it but is not active', async () => {
    const user = await newUser()
    await run(user._id, 'MANAGER', 'tok_visa')
    const { stripeCustomerId } = await storedUser(user._id)
    if (!stripeCustomerId) throw new Error('no customer')
    const pastDue = await userApi.setSubscription(
      { stripeCustomerId },
      {
        customerId: stripeCustomerId,
        subscriptionId: null,
        status: 'past_due',
        tier: null
      }
    )
    expect(pastDue).toMatchObject({
      tier: 'MANAGER',
      active: false,
      subscriptionStatus: 'past_due'
    })
    const ended = await userApi.setSubscription(
      { stripeCustomerId },
      {
        customerId: stripeCustomerId,
        subscriptionId: 'sub_x',
        status: 'canceled',
        tier: 'MANAGER'
      }
    )
    expect(ended).toMatchObject({
      tier: null,
      active: false,
      stripeSubscriptionId: 'sub_x'
    })
    expect(
      await userApi.setSubscription(
        { stripeCustomerId: 'cus_nobody' },
        {
          customerId: 'cus_nobody',
          subscriptionId: null,
          status: 'active',
          tier: null
        }
      )
    ).toBeNull()
  })

  it('an active status with no tier leaves the tier alone', () => {
    expect(
      subscriptionFields({
        customerId: 'c',
        subscriptionId: null,
        status: 'active',
        tier: null
      })
    ).toEqual({
      stripeCustomerId: 'c',
      subscriptionStatus: 'active',
      active: true
    })
  })
})
