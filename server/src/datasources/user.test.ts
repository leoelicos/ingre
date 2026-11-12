import { ConflictError } from '../errors'
import type { StoreState } from '../store/common'
import { newPublicId } from '../test-utils/ids'
import { useTestDb } from '../test-utils/pg'
import { saveTestRecipe } from '../test-utils/recipes'
import { insertUser, storedUser } from '../test-utils/users'
import { UserApi, MIN_PASSWORD_LENGTH } from './user'
import { assignments } from './userRows'

jest.setTimeout(60000)

const sql = useTestDb()
const userApi = new UserApi()

const input = {
  email: 'email@example.com',
  password: 'password123',
  firstName: ' John ',
  lastName: ' Doe '
}

const store = (overrides: Partial<StoreState> = {}): StoreState => ({
  platform: 'GOOGLE',
  productId: 'ingre_manager_monthly',
  tier: 'MANAGER',
  status: 'active',
  expiresAt: new Date('2026-12-11T00:00:00Z'),
  storeId: 'tok-1',
  replacesStoreId: null,
  accountUserId: null,
  ...overrides
})

const subscription = {
  customerId: 'cus_1',
  subscriptionId: 'sub_1',
  status: 'active',
  tier: 'EXPLORER' as const
}

describe('UserApi', () => {
  it('creates a user with a hashed password and a public id', async () => {
    const user = await userApi.createUser(input)
    expect(user).toMatchObject({
      _id: expect.stringMatching(/^[0-9a-f]{24}$/),
      email: input.email,
      firstName: 'John',
      lastName: 'Doe',
      pro: false,
      tier: null,
      active: false,
      savedRecipes: [],
      numSavedRecipes: 0
    })
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/)
    expect(await userApi.findOneUser({ email: input.email })).toEqual(user)
  })

  it('refuses a short password and a taken email', async () => {
    await expect(
      userApi.createUser({
        ...input,
        password: 'x'.repeat(MIN_PASSWORD_LENGTH - 1)
      })
    ).rejects.toThrow('at least 5')
    await userApi.createUser(input)
    await expect(userApi.createUser(input)).rejects.toThrow()
  })

  it('reports a create that returned nothing', async () => {
    const quiet = new UserApi({ ...sql(), query: async () => [] })
    await expect(quiet.createUser(input)).rejects.toThrow('User not created')
  })

  it('checks passwords', async () => {
    const user = await userApi.createUser(input)
    expect(
      await userApi.checkUserPassword({
        email: input.email,
        password: input.password
      })
    ).toEqual(user)
    expect(
      await userApi.checkUserPassword({
        email: input.email,
        password: 'password124'
      })
    ).toBeNull()
    expect(
      await userApi.checkUserPassword({
        email: 'nobody@example.com',
        password: input.password
      })
    ).toBeNull()
  })

  it('returns null for unknown users', async () => {
    const id = newPublicId()
    expect(await userApi.findOneUserById({ id })).toBeNull()
    expect(await userApi.getUserSavedRecipes({ id })).toBeNull()
    expect(
      await userApi.findOneUser({ email: 'nobody@example.com' })
    ).toBeNull()
    expect(
      await userApi.addRecipeToUser({ userId: id, recipeId: newPublicId() })
    ).toBeNull()
    expect(
      await userApi.removeRecipeFromUser({
        userId: id,
        recipeId: newPublicId()
      })
    ).toBeNull()
  })

  it('saves recipes in order, once each, and removes them', async () => {
    const { _id: userId } = await userApi.createUser(input)
    const first = await saveTestRecipe({ name: 'First' })
    const second = await saveTestRecipe({ name: 'Second' })
    await userApi.addRecipeToUser({ userId, recipeId: second._id })
    await userApi.addRecipeToUser({ userId, recipeId: first._id })
    const twice = await userApi.addRecipeToUser({
      userId,
      recipeId: second._id
    })
    expect(twice).toMatchObject({
      savedRecipes: [second._id, first._id],
      numSavedRecipes: 2
    })
    const saved = await userApi.getUserSavedRecipes({ id: userId })
    expect(saved?.map(({ name }) => name)).toEqual(['Second', 'First'])
    const found = await userApi.findOneUserById({ id: userId })
    expect(found?.savedRecipes).toMatchObject([
      {
        _id: second._id,
        name: 'Second',
        libraryId: 'some-library-id',
        instructions: 'Test instructions',
        ingredients: [
          { name: 'Chicken', category: { name: 'Meat' } },
          { name: 'Broccoli', category: { name: 'Vegetables' } }
        ]
      },
      { _id: first._id }
    ])
    // a recipe that does not exist is not saved
    expect(
      (await userApi.addRecipeToUser({ userId, recipeId: newPublicId() }))
        ?.numSavedRecipes
    ).toBe(2)
    const removed = await userApi.removeRecipeFromUser({
      userId,
      recipeId: second._id
    })
    expect(removed?.savedRecipes).toEqual([first._id])
    await userApi.addRecipeToUser({ userId, recipeId: second._id })
    expect((await storedUser(userId)).savedRecipes).toEqual([
      first._id,
      second._id
    ])
  })

  it('makes a user pro, recording the tier bought (#208)', async () => {
    const { _id } = await userApi.createUser(input)
    expect((await userApi.makeUserPro({ _id })).pro).toBe(true)
    const upgraded = await userApi.makeUserPro({ _id, tier: 'LEADER' })
    expect(upgraded).toMatchObject({ pro: true, tier: 'LEADER' })
    // the old flow, with no tier, keeps the tier it has
    expect((await userApi.makeUserPro({ _id })).tier).toBe('LEADER')
    await expect(userApi.makeUserPro({ _id: newPublicId() })).rejects.toThrow(
      'User not found'
    )
  })

  it('finds who to bill (#312)', async () => {
    const { _id } = await userApi.createUser(input)
    expect(await userApi.findBilling(_id)).toEqual({
      email: input.email,
      name: 'John Doe',
      customerId: null,
      subscriptionId: null
    })
    await expect(userApi.findBilling(newPublicId())).rejects.toThrow(
      'User not found'
    )
  })

  it('sets a Stripe subscription by user or by customer (#312)', async () => {
    const { _id } = await userApi.createUser(input)
    expect(await userApi.setSubscription({ _id }, subscription)).toMatchObject({
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: 'sub_1',
      subscriptionStatus: 'active',
      active: true,
      tier: 'EXPLORER',
      pro: true
    })
    const ended = await userApi.setSubscription(
      { stripeCustomerId: 'cus_1' },
      { ...subscription, subscriptionId: null, status: 'canceled', tier: null }
    )
    expect(ended).toMatchObject({
      stripeSubscriptionId: 'sub_1',
      active: false,
      tier: null
    })
    expect(
      await userApi.setSubscription(
        { stripeCustomerId: 'cus_unknown' },
        subscription
      )
    ).toBeNull()
  })

  it('ties a store purchase to one account only (#314)', async () => {
    const { _id } = await userApi.createUser(input)
    expect(await userApi.setStoreSubscription(_id, store())).toMatchObject({
      storePlatform: 'GOOGLE',
      storeProductId: 'ingre_manager_monthly',
      storeId: 'tok-1',
      storeExpiresAt: new Date('2026-12-11T00:00:00Z'),
      tier: 'MANAGER',
      active: true
    })
    // the same purchase again, for the same user, is fine
    await userApi.setStoreSubscription(_id, store())
    const other = await insertUser({ email: 'grace@example.com' })
    await expect(
      userApi.setStoreSubscription(other, store())
    ).rejects.toBeInstanceOf(ConflictError)
    await expect(
      userApi.setStoreSubscription(
        other,
        store({ storeId: 'tok-2', replacesStoreId: 'tok-1' })
      )
    ).rejects.toThrow('belongs to another account')
    await expect(
      userApi.setStoreSubscription(newPublicId(), store({ storeId: 'tok-3' }))
    ).rejects.toThrow('User not found')
  })

  it('applies store notifications to the holder, the replaced holder, then the account (#314)', async () => {
    const holder = await userApi.createUser(input)
    await userApi.setStoreSubscription(holder._id, store())
    expect(
      await userApi.applyStoreNotification(store({ status: 'past_due' }))
    ).toMatchObject({ _id: holder._id, active: false })
    expect(
      await userApi.applyStoreNotification(
        store({ storeId: 'tok-2', replacesStoreId: 'tok-1' })
      )
    ).toMatchObject({ _id: holder._id, storeId: 'tok-2', active: true })
    const account = await insertUser({ email: 'grace@example.com' })
    expect(
      await userApi.applyStoreNotification(
        store({ storeId: 'tok-9', accountUserId: account })
      )
    ).toMatchObject({ _id: account, storeId: 'tok-9' })
    // an old token can't claim an account
    expect(
      await userApi.applyStoreNotification(
        store({ storeId: 'tok-8', accountUserId: account, status: 'canceled' })
      )
    ).toBeNull()
    expect(
      await userApi.applyStoreNotification(
        store({ storeId: 'tok-7', replacesStoreId: 'tok-6' })
      )
    ).toBeNull()
  })
})

describe('assignments', () => {
  it('numbers the columns it sets and refuses unknown fields', () => {
    expect(assignments({ pro: true, tier: 'LEADER' }, 3)).toEqual({
      text: 'pro = $3, tier = $4',
      values: [true, 'LEADER']
    })
    expect(assignments({ active: false })).toEqual({
      text: 'active = $1',
      values: [false]
    })
    expect(() => assignments({ email: 'x' })).toThrow('No column for email')
  })
})
