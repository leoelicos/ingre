import mongoose from 'mongoose'
import { User } from '../models/User'
import { WebhookEvent } from '../models/WebhookEvent'
import type { EntitlementState } from '../payments/entitlement'
import { OTHER_USER, USER } from '../test-utils/paymentEvents'
import { EntitlementApi, entitlementFields } from './entitlement'

/* Paddle + RevenueCat: each event counts once, and an old event never undoes a newer one. */

jest.setTimeout(60000)

const api = new EntitlementApi()

const state = (
  overrides: Partial<EntitlementState> = {}
): EntitlementState => ({
  eventId: 'paddle:evt_1',
  source: 'PADDLE',
  userId: USER,
  subscriptionId: 'sub_1',
  customerId: 'ctm_1',
  productId: 'pri_1',
  tier: 'MANAGER',
  interval: 'year',
  status: 'active',
  expiresAt: new Date('2027-11-12T00:00:00Z'),
  occurredAt: new Date('2026-11-12T00:00:00Z'),
  environment: 'sandbox',
  ...overrides
})

const makeUser = (_id: string, email: string) =>
  User.create({
    _id,
    email,
    firstName: 'Ada',
    lastName: 'Lovelace',
    password: 'correct horse'
  })

describe('EntitlementApi', () => {
  beforeEach(async () => {
    mongoose.set('strictQuery', false)
    await mongoose.connect(
      `${process.env['MONGO_TEST_URI']}test_ingre_entitlement`
    )
    await makeUser(USER, 'ada@example.com')
    await makeUser(OTHER_USER, 'grace@example.com')
  })
  afterEach(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  })

  it('claims an event id once, and can let it go', async () => {
    expect(await api.claim('paddle:evt_1')).toBe(true)
    expect(await api.claim('paddle:evt_1')).toBe(false)
    await api.release('paddle:evt_1')
    expect(await api.claim('paddle:evt_1')).toBe(true)
  })

  it('rethrows anything but a duplicate', async () => {
    const spy = jest
      .spyOn(WebhookEvent, 'create')
      .mockRejectedValueOnce(new Error('down') as never)
    await expect(api.claim('paddle:evt_2')).rejects.toThrow('down')
    spy.mockRestore()
  })

  it('applies to the purchase’s user, then follows the subscription', async () => {
    expect(await api.apply(state())).toBe('applied')
    const user = await User.findById(USER).lean()
    expect(user).toMatchObject({
      tier: 'MANAGER',
      active: true,
      pro: true,
      subscriptionStatus: 'active',
      entitlementSource: 'PADDLE',
      entitlementSubscriptionId: 'sub_1',
      entitlementInterval: 'year',
      paddleCustomerId: 'ctm_1'
    })
    // a later event without the user id still finds them by subscription
    expect(
      await api.apply(
        state({
          eventId: 'paddle:evt_2',
          userId: null,
          customerId: null,
          status: 'canceled',
          occurredAt: new Date('2026-12-01T00:00:00Z')
        })
      )
    ).toBe('applied')
    expect(await User.findById(USER).lean()).toMatchObject({
      tier: null,
      active: false,
      subscriptionStatus: 'canceled',
      paddleCustomerId: 'ctm_1'
    })
  })

  it('never lets an older event undo a newer one', async () => {
    await api.apply(state({ occurredAt: new Date('2026-12-01T00:00:00Z') }))
    expect(
      await api.apply(
        state({
          status: 'past_due',
          occurredAt: new Date('2026-11-30T00:00:00Z')
        })
      )
    ).toBe('stale')
    expect((await User.findById(USER).lean())?.subscriptionStatus).toBe(
      'active'
    )
  })

  it('never lets an older event overwrite a newer one that lands mid-apply', async () => {
    const updateOne = User.updateOne.bind(User)
    const newer = state({
      eventId: 'paddle:evt_new',
      tier: 'LEADER',
      occurredAt: new Date('2026-12-01T00:00:00Z')
    })
    // the newer event is written between the older one's read and its write
    const spy = jest
      .spyOn(User, 'updateOne')
      .mockImplementationOnce(((...args: Parameters<typeof updateOne>) =>
        api.apply(newer).then(() => updateOne(...args))) as never)
    expect(await api.apply(state({ tier: 'EXPLORER' }))).toBe('stale')
    spy.mockRestore()
    expect((await User.findById(USER).lean())?.tier).toBe('LEADER')
  })

  it('reports when nobody holds the purchase', async () => {
    expect(
      await api.apply(state({ userId: null, subscriptionId: 'sub_unknown' }))
    ).toBe('no-user')
    expect(await api.apply(state({ userId: null, subscriptionId: null }))).toBe(
      'no-user'
    )
    expect(
      await api.apply(
        state({ userId: '65a1b2c3d4e5f60718293a99', subscriptionId: null })
      )
    ).toBe('no-user')
  })

  it('writes only the entitlement fields', () => {
    expect(
      entitlementFields(state({ customerId: null, status: 'past_due' }))
    ).toEqual({
      entitlementSource: 'PADDLE',
      entitlementSubscriptionId: 'sub_1',
      entitlementProductId: 'pri_1',
      entitlementInterval: 'year',
      entitlementExpiresAt: new Date('2027-11-12T00:00:00Z'),
      entitlementUpdatedAt: new Date('2026-11-12T00:00:00Z'),
      subscriptionStatus: 'past_due',
      active: false
    })
  })
})
