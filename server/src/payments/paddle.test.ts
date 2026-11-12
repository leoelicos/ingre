import {
  normalisePaddleEvent,
  paddleEnvironmentOf,
  priceTiersOf
} from './paddle'
import {
  USER,
  paddleEvent,
  paddleSubscription
} from '../test-utils/paymentEvents'

/* Paddle + RevenueCat: Paddle's subscription events boiled down to one entitlement. */

const entitlement = (payload: unknown, options = {}) => {
  const result = normalisePaddleEvent(payload, options)
  if (result.kind !== 'entitlement') throw new Error(`got ${result.kind}`)
  return result
}

describe('normalisePaddleEvent', () => {
  it('normalises an activated subscription', () => {
    expect(entitlement(paddleEvent())).toEqual({
      kind: 'entitlement',
      syncRevenueCat: true,
      state: {
        eventId: 'paddle:evt_01hv8x2acma7ttf0ksgxz6wzyv',
        source: 'PADDLE',
        userId: USER,
        subscriptionId: 'sub_01hv8x29kz0t586xy6zn1a62ny',
        customerId: 'ctm_01hv8wt8nffez4p2t6typn4a5j',
        productId: 'pri_01hv0vax6rv18t4tamj848ne4d',
        tier: 'EXPLORER',
        interval: 'year',
        status: 'active',
        expiresAt: new Date('2027-11-12T00:00:00Z'),
        occurredAt: new Date('2026-11-12T00:00:05Z'),
        environment: 'sandbox'
      }
    })
  })

  it('maps every Paddle status to Stripe words', () => {
    const status = (paddle: string) =>
      entitlement(
        paddleEvent(
          'subscription.updated',
          paddleSubscription({ status: paddle })
        )
      ).state.status
    expect(status('trialing')).toBe('trialing')
    expect(status('past_due')).toBe('past_due')
    expect(status('paused')).toBe('past_due')
    expect(status('canceled')).toBe('canceled')
  })

  it('only posts new subscriptions to RevenueCat, and only with a user', () => {
    expect(
      entitlement(paddleEvent('subscription.created')).syncRevenueCat
    ).toBe(true)
    expect(
      entitlement(paddleEvent('subscription.updated')).syncRevenueCat
    ).toBe(false)
    const anonymous = paddleEvent(
      'subscription.created',
      paddleSubscription({ custom_data: null })
    )
    expect(entitlement(anonymous)).toMatchObject({
      syncRevenueCat: false,
      state: { userId: null }
    })
  })

  it('copes with messy payloads', () => {
    const messy = paddleSubscription({
      customer_id: null,
      custom_data: { userId: USER.toUpperCase() },
      current_billing_period: null,
      scheduled_change: {
        action: 'cancel',
        effective_at: '2027-01-01T00:00:00Z'
      },
      items: [
        { price: null },
        {
          price: {
            id: 'pri_manager',
            product_id: 'ingre_manager_monthly',
            billing_cycle: null,
            custom_data: null
          }
        },
        {
          price: {
            id: 'pri_leader',
            custom_data: { ingre_tier: 'leader' }
          }
        }
      ]
    })
    expect(
      entitlement(paddleEvent('subscription.updated', messy), {
        priceTiers: new Map([['pri_manager', 'MANAGER']]),
        environment: 'production'
      }).state
    ).toMatchObject({
      userId: USER,
      customerId: null,
      productId: 'pri_manager',
      tier: 'LEADER',
      interval: 'month',
      expiresAt: new Date('2027-01-01T00:00:00Z'),
      environment: 'production'
    })
  })

  it('falls back to canceled_at, and to no expiry or interval', () => {
    const ended = paddleSubscription({
      status: 'canceled',
      items: null,
      current_billing_period: { ends_at: 'not a date' },
      scheduled_change: { action: 'pause', effective_at: null },
      canceled_at: '2026-12-01T00:00:00Z'
    })
    expect(
      entitlement(paddleEvent('subscription.canceled', ended)).state
    ).toMatchObject({
      tier: null,
      productId: null,
      interval: null,
      expiresAt: new Date('2026-12-01T00:00:00Z')
    })
    const open = paddleSubscription({
      current_billing_period: undefined,
      items: [{ price: { id: 'pri_x', billing_cycle: { interval: 'week' } } }]
    })
    expect(
      entitlement(paddleEvent('subscription.updated', open)).state
    ).toMatchObject({ interval: null, expiresAt: null, tier: null })
  })

  it('ignores other events and unknown statuses', () => {
    expect(normalisePaddleEvent(paddleEvent('transaction.completed'))).toEqual({
      kind: 'ignored',
      eventId: 'paddle:evt_01hv8x2acma7ttf0ksgxz6wzyv',
      reason: 'transaction.completed does not change an entitlement'
    })
    expect(
      normalisePaddleEvent(
        paddleEvent(
          'subscription.updated',
          paddleSubscription({ status: 'odd' })
        )
      )
    ).toMatchObject({
      kind: 'ignored',
      reason: 'unknown subscription status odd'
    })
  })

  it('refuses what is not a Paddle subscription event', () => {
    expect(normalisePaddleEvent({ hello: 'world' })).toEqual({
      kind: 'invalid',
      reason: 'not a Paddle event'
    })
    expect(
      normalisePaddleEvent(paddleEvent('subscription.updated', { id: 1 }))
    ).toEqual({ kind: 'invalid', reason: 'malformed subscription.updated' })
    expect(
      normalisePaddleEvent(
        paddleEvent('subscription.updated', paddleSubscription(), {
          occurred_at: 'yesterday'
        })
      )
    ).toMatchObject({ kind: 'invalid' })
  })
})

describe('Paddle environment', () => {
  it('reads price tiers and the environment', () => {
    expect([
      ...priceTiersOf({
        PADDLE_PRICE_TIERS:
          ' pri_a = explorer ,pri_b=MANAGER,bad,=LEADER,pri_c=pro'
      })
    ]).toEqual([
      ['pri_a', 'EXPLORER'],
      ['pri_b', 'MANAGER']
    ])
    expect(priceTiersOf({}).size).toBe(0)
    expect(paddleEnvironmentOf({ PADDLE_ENVIRONMENT: 'production' })).toBe(
      'production'
    )
    expect(paddleEnvironmentOf({})).toBe('sandbox')
  })
})
