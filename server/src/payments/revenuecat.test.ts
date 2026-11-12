import {
  RevenueCatSyncError,
  normaliseRevenueCatEvent,
  revenueCatSync
} from './revenuecat'
import { USER, revenueCatEvent } from '../test-utils/paymentEvents'

/* Paddle + RevenueCat: store purchases reported by RevenueCat, in the same shape as Paddle's. */

const now = new Date(1795000000000)

const state = (overrides: Record<string, unknown> = {}, testing = false) => {
  const result = normaliseRevenueCatEvent(revenueCatEvent(overrides), {
    now,
    testing
  })
  if (result.kind !== 'entitlement') throw new Error(`got ${result.kind}`)
  return result.state
}

describe('normaliseRevenueCatEvent', () => {
  it('normalises an App Store purchase', () => {
    expect(state()).toEqual({
      eventId: 'revenuecat:CD489E0E-5D52-4C52-A3B4-2E2D4E5E1B9A',
      source: 'APP_STORE',
      userId: USER,
      subscriptionId: '2000000812345678',
      customerId: null,
      productId: 'ingre_manager_monthly',
      tier: 'MANAGER',
      interval: 'month',
      status: 'active',
      expiresAt: new Date(1797465600000),
      occurredAt: new Date(1794787205000),
      environment: 'sandbox'
    })
  })

  it('decides the status from the event type', () => {
    expect(state({ period_type: 'TRIAL' }).status).toBe('trialing')
    expect(state({ type: 'RENEWAL' }).status).toBe('active')
    expect(state({ type: 'EXPIRATION' }).status).toBe('canceled')
    // a cancelled renewal keeps the paid period; a refund ends it now
    expect(state({ type: 'CANCELLATION' }).status).toBe('active')
    expect(
      state({ type: 'CANCELLATION', cancel_reason: 'CUSTOMER_SUPPORT' }).status
    ).toBe('canceled')
    expect(state({ type: 'CANCELLATION', expiration_at_ms: 1 }).status).toBe(
      'canceled'
    )
    // grace period: still paid up
    expect(state({ type: 'BILLING_ISSUE' }).status).toBe('active')
    expect(state({ type: 'BILLING_ISSUE', expiration_at_ms: 1 }).status).toBe(
      'past_due'
    )
    expect(
      state({ type: 'NON_RENEWING_PURCHASE', expiration_at_ms: null }).status
    ).toBe('active')
  })

  it('copes with messy payloads', () => {
    expect(
      state({
        app_user_id: '$RCAnonymousID:8b9d1f',
        original_app_user_id: '$RCAnonymousID:8b9d1f',
        aliases: ['$RCAnonymousID:8b9d1f', USER.toUpperCase()],
        entitlement_ids: null,
        entitlement_id: 'Leader',
        product_id: 'ingre_explorer_annual:yearly',
        store: 'PLAY_STORE',
        environment: 'PRODUCTION',
        expiration_at_ms: '1797465600000',
        event_timestamp_ms: undefined,
        original_transaction_id: null,
        transaction_id: 'GPA.3345-1234'
      })
    ).toMatchObject({
      userId: USER,
      tier: 'LEADER',
      interval: 'year',
      source: 'PLAY_STORE',
      environment: 'production',
      expiresAt: new Date(1797465600000),
      occurredAt: new Date(1794787200000),
      subscriptionId: 'GPA.3345-1234'
    })
    expect(
      state({
        app_user_id: null,
        original_app_user_id: null,
        aliases: null,
        entitlement_ids: [],
        product_id: null,
        store: 'MAC_APP_STORE',
        purchased_at_ms: null,
        event_timestamp_ms: null,
        transaction_id: null,
        original_transaction_id: null
      })
    ).toMatchObject({
      userId: null,
      tier: null,
      interval: null,
      source: 'APP_STORE',
      occurredAt: now,
      subscriptionId: null,
      productId: null
    })
    expect(state({ store: 'SOMETHING_NEW' }).source).toBe('OTHER')
    expect(state({ store: undefined }).source).toBe('OTHER')
  })

  it('ignores what does not change an entitlement', () => {
    const reason = (overrides: Record<string, unknown>, testing = false) =>
      normaliseRevenueCatEvent(revenueCatEvent(overrides), { now, testing })
    expect(reason({ type: 'TEST' })).toMatchObject({
      kind: 'ignored',
      reason: 'TEST does not change an entitlement'
    })
    expect(reason({ store: 'PADDLE' })).toMatchObject({
      kind: 'ignored',
      reason: 'Paddle purchases come from the Paddle webhook'
    })
    expect(reason({ environment: 'PRODUCTION' }, true)).toMatchObject({
      kind: 'ignored',
      reason: 'a production purchase sent to a test server'
    })
    expect(reason({ environment: 'SANDBOX' }, true)).toMatchObject({
      kind: 'entitlement'
    })
  })

  it('refuses what is not a RevenueCat webhook', () => {
    expect(normaliseRevenueCatEvent({ event: { id: 1 } })).toEqual({
      kind: 'invalid',
      reason: 'not a RevenueCat webhook'
    })
    expect(normaliseRevenueCatEvent(revenueCatEvent()).kind).toBe('entitlement')
  })
})

describe('revenueCatSync', () => {
  it('is off without REVENUECAT_API_KEY', () => {
    expect(revenueCatSync({})).toBeNull()
  })

  it('posts a Paddle subscription to v1/receipts', async () => {
    const fetch = jest.fn(async () => new Response('{}', { status: 200 }))
    const sync = revenueCatSync(
      {
        REVENUECAT_API_KEY: 'pdl_public_key',
        REVENUECAT_API_URL: 'http://rc.test/'
      },
      fetch
    )
    await sync?.syncPaddle(USER, 'sub_1')
    expect(fetch).toHaveBeenCalledWith('http://rc.test/v1/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Platform': 'paddle',
        Authorization: 'Bearer pdl_public_key'
      },
      body: JSON.stringify({ app_user_id: USER, fetch_token: 'sub_1' })
    })
  })

  it('fails when RevenueCat refuses, and defaults to the real API', async () => {
    const fetch = jest.fn(async () => new Response('{}', { status: 503 }))
    const sync = revenueCatSync({ REVENUECAT_API_KEY: 'k' }, fetch)
    await expect(sync?.syncPaddle(USER, 'sub_1')).rejects.toThrow(
      RevenueCatSyncError
    )
    expect(fetch).toHaveBeenCalledWith(
      'https://api.revenuecat.com/v1/receipts',
      expect.anything()
    )
  })

  it('uses global fetch by default', async () => {
    const original = global.fetch
    const fake = jest.fn(async () => new Response('{}', { status: 201 }))
    global.fetch = fake
    try {
      await revenueCatSync({ REVENUECAT_API_KEY: 'k' })?.syncPaddle(
        USER,
        'sub_1'
      )
      expect(fake).toHaveBeenCalled()
    } finally {
      global.fetch = original
    }
  })
})
