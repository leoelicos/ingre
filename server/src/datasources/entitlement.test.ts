import type { EntitlementState } from '../payments/entitlement'
import { OTHER_USER, USER } from '../test-utils/paymentEvents'
import { useTestDb } from '../test-utils/pg'
import { insertUser, storedUser } from '../test-utils/users'
import { EntitlementApi, entitlementFields } from './entitlement'

/* Paddle + RevenueCat: each event counts once, and an old event never undoes a newer one. */

jest.setTimeout(60000)

const sql = useTestDb()
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

describe('EntitlementApi', () => {
  beforeEach(async () => {
    await insertUser({ publicId: USER, email: 'ada@example.com' })
    await insertUser({ publicId: OTHER_USER, email: 'grace@example.com' })
  })

  it('claims an event id once, and can let it go', async () => {
    expect(await api.claim('paddle:evt_1')).toBe(true)
    expect(await api.claim('paddle:evt_1')).toBe(false)
    await api.release('paddle:evt_1')
    expect(await api.claim('paddle:evt_1')).toBe(true)
  })

  it('uses the client it is given', async () => {
    const own = new EntitlementApi(sql())
    expect(await own.claim('revenuecat:evt_9')).toBe(true)
    expect(await api.claim('revenuecat:evt_9')).toBe(false)
  })

  it('applies to the purchase’s user, then follows the subscription', async () => {
    expect(await api.apply(state())).toBe('applied')
    expect(await storedUser(USER)).toMatchObject({
      tier: 'MANAGER',
      active: true,
      pro: true,
      subscriptionStatus: 'active',
      entitlementSource: 'PADDLE',
      entitlementSubscriptionId: 'sub_1',
      entitlementProductId: 'pri_1',
      entitlementInterval: 'year',
      entitlementExpiresAt: new Date('2027-11-12T00:00:00Z'),
      entitlementUpdatedAt: new Date('2026-11-12T00:00:00Z'),
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
    expect(await storedUser(USER)).toMatchObject({
      tier: null,
      active: false,
      subscriptionStatus: 'canceled',
      paddleCustomerId: 'ctm_1'
    })
    expect((await storedUser(OTHER_USER)).subscriptionStatus).toBeNull()
  })

  it('prefers the subscription holder over the user id', async () => {
    await api.apply(state())
    expect(await api.apply(state({ userId: OTHER_USER, tier: 'LEADER' }))).toBe(
      'applied'
    )
    expect((await storedUser(USER)).tier).toBe('LEADER')
    expect((await storedUser(OTHER_USER)).tier).toBeNull()
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
    expect((await storedUser(USER)).subscriptionStatus).toBe('active')
    // an event at the same moment still applies (a repeat with new data)
    expect(
      await api.apply(
        state({ tier: 'LEADER', occurredAt: new Date('2026-12-01T00:00:00Z') })
      )
    ).toBe('applied')
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
