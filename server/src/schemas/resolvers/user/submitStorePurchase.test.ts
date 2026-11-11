import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import mongoose, { Types } from 'mongoose'
import { createDataSources } from '../../../datasources'
import { StoreApi } from '../../../datasources/store'
import { UserApi } from '../../../datasources/user'
import { User } from '../../../models/User'
import type { StoreState } from '../../../store/common'
import { PACKAGE, fakeStores, googleKeys } from '../../../test-utils/fakeStores'
import { singleResult } from '../../../test-utils/singleResult'
import { resolvers } from '../../resolvers'
import { typeDefs } from '../../typeDefs'

/* #314: a native app's purchase, verified with the store, sets the same fields as #312. */

jest.setTimeout(60000)

const SUBMIT = gql`
  mutation Submit(
    $platform: StorePlatform!
    $productId: String!
    $purchaseToken: String!
  ) {
    submitStorePurchase(
      platform: $platform
      productId: $productId
      purchaseToken: $purchaseToken
    ) {
      platform
      productId
      tier
      status
      active
      expiresAt
    }
  }
`

const keys = googleKeys()
const now = Date.parse('2026-11-11T00:00:00Z')
const fake = fakeStores(keys.publicKey)
const storeApi = new StoreApi(
  {
    GOOGLE_PLAY_PACKAGE_NAME: PACKAGE,
    GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: JSON.stringify(keys.serviceAccount)
  },
  { fetch: fake.fetch, now: () => now }
)
const server = new ApolloServer({ typeDefs, resolvers })
const userApi = new UserApi()

beforeEach(async () => {
  mongoose.set('strictQuery', false)
  await mongoose.connect(`${process.env['MONGO_TEST_URI']}test_ingre_store`)
})
afterEach(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

const newUser = () =>
  userApi.createUser({
    email: `cook${Math.random()}@example.com`,
    password: 'password123',
    firstName: 'Home',
    lastName: 'Cook'
  })

const purchase = (
  state: string,
  account: Types.ObjectId | null,
  extra = {}
) => ({
  subscriptionState: state,
  acknowledgementState: 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',
  lineItems: [
    { productId: 'ingre_manager_monthly', expiryTime: '2026-12-11T00:00:00Z' }
  ],
  ...(account === null
    ? {}
    : {
        externalAccountIdentifiers: {
          obfuscatedExternalAccountId: String(account)
        }
      }),
  ...extra
})

const run = async (
  userId: Types.ObjectId | null,
  variables: Record<string, string>,
  api: StoreApi = storeApi
) =>
  singleResult(
    await server.executeOperation(
      { query: SUBMIT, variables },
      {
        contextValue: {
          dataSources: { ...createDataSources(), userApi, storeApi: api },
          ...(userId === null
            ? {}
            : {
                user: {
                  _id: userId,
                  firstName: 'Home',
                  lastName: 'Cook',
                  email: 'cook@example.com',
                  pro: false,
                  savedRecipes: [],
                  numSavedRecipes: 0
                }
              })
        }
      }
    )
  )

const google = (token: string) => ({
  platform: 'GOOGLE',
  productId: 'ingre_manager_monthly',
  purchaseToken: token
})

describe('submitStorePurchase', () => {
  it('an active Google Play purchase makes the user active on the tier', async () => {
    const user = await newUser()
    fake.google.set('tok-a', purchase('SUBSCRIPTION_STATE_ACTIVE', user._id))
    const result = await run(user._id, google('tok-a'))
    expect(result.errors).toBeUndefined()
    expect(result.data).toEqual({
      submitStorePurchase: {
        platform: 'GOOGLE',
        productId: 'ingre_manager_monthly',
        tier: 'MANAGER',
        status: 'active',
        active: true,
        expiresAt: '2026-12-11T00:00:00.000Z'
      }
    })
    const saved = await User.findById(user._id).orFail()
    expect(saved.toObject()).toMatchObject({
      tier: 'MANAGER',
      pro: true,
      active: true,
      subscriptionStatus: 'active',
      storePlatform: 'GOOGLE',
      storeProductId: 'ingre_manager_monthly',
      storeId: 'tok-a',
      storeExpiresAt: new Date('2026-12-11T00:00:00Z')
    })
  })

  it('a pending purchase is recorded but not active', async () => {
    const user = await newUser()
    fake.google.set('tok-p', {
      ...purchase('SUBSCRIPTION_STATE_PENDING', null),
      lineItems: [{ productId: 'ingre_manager_monthly' }]
    })
    const result = await run(user._id, google('tok-p'))
    expect(result.data).toEqual({
      submitStorePurchase: expect.objectContaining({
        status: 'incomplete',
        active: false,
        expiresAt: null
      })
    })
    expect((await User.findById(user._id).orFail()).tier).toBeNull()
  })

  it('one purchase cannot unlock two accounts', async () => {
    const first = await newUser()
    const second = await newUser()
    fake.google.set('tok-shared', purchase('SUBSCRIPTION_STATE_ACTIVE', null))
    await run(first._id, google('tok-shared'))
    const result = await run(second._id, google('tok-shared'))
    expect(result.errors?.[0]).toMatchObject({
      extensions: { code: 'CONFLICT' }
    })
    // nor can the token it replaced
    fake.google.set(
      'tok-new',
      purchase('SUBSCRIPTION_STATE_ACTIVE', null, {
        linkedPurchaseToken: 'tok-shared'
      })
    )
    expect(
      (await run(second._id, google('tok-new'))).errors?.[0]
    ).toMatchObject({
      extensions: { code: 'CONFLICT' }
    })
    // the same user may resubmit (a restore)
    expect((await run(first._id, google('tok-shared'))).errors).toBeUndefined()
  })

  it('refuses when the store refuses, and changes nothing', async () => {
    const user = await newUser()
    const result = await run(user._id, google('unknown'))
    expect(result.errors?.[0]).toMatchObject({
      extensions: { code: 'STORE_VERIFICATION_FAILED' }
    })
    expect((await User.findById(user._id).orFail()).active).toBe(false)
  })

  it('refuses when the store is not set up', async () => {
    const user = await newUser()
    const result = await run(
      user._id,
      { ...google('tok-a'), platform: 'APPLE' },
      new StoreApi({})
    )
    expect(result.errors?.[0]).toMatchObject({
      extensions: { code: 'STORE_NOT_CONFIGURED' }
    })
  })

  it('needs a signed-in user, who still exists', async () => {
    expect((await run(null, google('tok-a'))).errors?.[0]).toMatchObject({
      extensions: { code: 'UNAUTHENTICATED' }
    })
    fake.google.set('tok-ghost', purchase('SUBSCRIPTION_STATE_ACTIVE', null))
    expect(
      (await run(new Types.ObjectId(), google('tok-ghost'))).errors?.[0]
    ).toMatchObject({
      extensions: { code: 'NOT_FOUND' }
    })
  })
})

describe('applyStoreNotification', () => {
  const state = (overrides: Partial<StoreState> = {}): StoreState => ({
    platform: 'APPLE',
    productId: 'ingre_leader_monthly',
    tier: 'LEADER',
    status: 'active',
    expiresAt: null,
    storeId: 'orig-1',
    replacesStoreId: null,
    accountUserId: null,
    ...overrides
  })

  it('updates the user holding the subscription', async () => {
    const user = await newUser()
    await userApi.setStoreSubscription(user._id, state())
    const updated = await userApi.applyStoreNotification(
      state({ status: 'canceled' })
    )
    expect(updated).toMatchObject({
      active: false,
      tier: null,
      subscriptionStatus: 'canceled'
    })
  })

  it('follows a Google upgrade from the replaced token', async () => {
    const user = await newUser()
    await userApi.setStoreSubscription(user._id, state({ storeId: 'old' }))
    const updated = await userApi.applyStoreNotification(
      state({ storeId: 'new', replacesStoreId: 'old', tier: 'MANAGER' })
    )
    expect(updated).toMatchObject({ storeId: 'new', tier: 'MANAGER' })
  })

  it('an active purchase can claim the account the app tied it to', async () => {
    const user = await newUser()
    const claimed = await userApi.applyStoreNotification(
      state({ storeId: 'fresh', accountUserId: String(user._id) })
    )
    expect(claimed).toMatchObject({ storeId: 'fresh', active: true })
  })

  it('a lapsed one cannot, and nobody else is touched', async () => {
    const user = await newUser()
    await expect(
      userApi.applyStoreNotification(
        state({
          storeId: 'stale',
          status: 'canceled',
          accountUserId: String(user._id)
        })
      )
    ).resolves.toBeNull()
    await expect(
      userApi.applyStoreNotification(state({ storeId: 'nobody' }))
    ).resolves.toBeNull()
  })
})
