import type { Request, Response } from 'express'
import Stripe from 'stripe'
import { HANDLED, stateFor, stripeWebhook, tierOf } from './stripe'

/* #312: Stripe's events keep the user's tier and activation status in step. */

const stripe = new Stripe('sk_test_local', { apiVersion: '2020-08-27' })
/* a made-up signing secret for these tests only; real ones come from STRIPE_WEBHOOK_SECRET */
const SECRET = 'whsec_unit_test_only'

const event = (type: string, object: object): Stripe.Event =>
  ({
    id: 'evt_1',
    object: 'event',
    type,
    data: { object }
  }) as unknown as Stripe.Event

const subscription = (overrides: object = {}) => ({
  id: 'sub_1',
  object: 'subscription',
  customer: 'cus_1',
  status: 'active',
  metadata: {},
  items: { data: [{ price: { lookup_key: 'ingre_manager_monthly' } }] },
  ...overrides
})

describe('stateFor', () => {
  it('handles the subscription lifecycle', () => {
    ;(['created', 'updated', 'deleted'] as const).forEach((kind) =>
      expect(
        stateFor(event(`customer.subscription.${kind}`, subscription()))
      ).toEqual({
        filter: { stripeCustomerId: 'cus_1' },
        state: {
          customerId: 'cus_1',
          subscriptionId: 'sub_1',
          status: 'active',
          tier: 'MANAGER'
        }
      })
    )
    expect(
      stateFor(
        event(
          'customer.subscription.deleted',
          subscription({ status: 'canceled', customer: { id: 'cus_2' } })
        )
      )?.state
    ).toMatchObject({ customerId: 'cus_2', status: 'canceled' })
  })

  it('a completed checkout links the Customer to the user in client_reference_id', () => {
    const session = {
      customer: 'cus_1',
      client_reference_id: 'u1',
      subscription: 'sub_1',
      payment_status: 'paid',
      metadata: { ingre_tier: 'LEADER' }
    }
    expect(stateFor(event('checkout.session.completed', session))).toEqual({
      filter: { _id: 'u1' },
      state: {
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        status: 'active',
        tier: 'LEADER'
      }
    })
    expect(
      stateFor(
        event('checkout.session.completed', {
          ...session,
          payment_status: 'unpaid',
          metadata: null
        })
      )?.state
    ).toMatchObject({ status: 'incomplete', tier: null })
    expect(
      stateFor(
        event('checkout.session.completed', {
          ...session,
          client_reference_id: null
        })
      )
    ).toBeNull()
    expect(
      stateFor(
        event('checkout.session.completed', { ...session, customer: null })
      )
    ).toBeNull()
  })

  it('a paid invoice makes the user active; a failed one past due', () => {
    const invoice = { customer: 'cus_1', subscription: 'sub_1' }
    expect(stateFor(event('invoice.paid', invoice))?.state).toEqual({
      customerId: 'cus_1',
      subscriptionId: 'sub_1',
      status: 'active',
      tier: null
    })
    expect(
      stateFor(
        event('invoice.payment_failed', {
          customer: 'cus_1',
          subscription: null
        })
      )?.state
    ).toEqual({
      customerId: 'cus_1',
      subscriptionId: null,
      status: 'past_due',
      tier: null
    })
    expect(stateFor(event('invoice.paid', { customer: null }))).toBeNull()
  })

  it('ignores every other event', () => {
    expect(stateFor(event('charge.succeeded', {}))).toBeNull()
    expect(HANDLED).toHaveLength(6)
  })
})

describe('tierOf', () => {
  it('reads the Price’s lookup key, else the subscription’s metadata', () => {
    const odd = { items: { data: [{ price: { lookup_key: null } }] } }
    expect(
      tierOf(subscription(odd) as unknown as Stripe.Subscription)
    ).toBeNull()
    expect(
      tierOf(
        subscription({
          ...odd,
          metadata: { ingre_tier: 'EXPLORER' }
        }) as unknown as Stripe.Subscription
      )
    ).toBe('EXPLORER')
    expect(
      tierOf(
        subscription({ items: { data: [] } }) as unknown as Stripe.Subscription
      )
    ).toBeNull()
  })
})

describe('stripeWebhook', () => {
  const respond = () => {
    const res = { status: jest.fn(), json: jest.fn() }
    res.status.mockReturnValue(res)
    return res
  }
  const request = (body: string, signature: string | undefined) =>
    ({
      body: Buffer.from(body),
      header: (name: string) =>
        name === 'stripe-signature' ? signature : undefined
    }) as unknown as Request
  const store = () => ({
    setSubscription: jest.fn(() => Promise.resolve(null))
  })
  const signed = (payload: string) =>
    stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET })

  it('is off (503) until STRIPE_WEBHOOK_SECRET is set', async () => {
    const res = respond()
    await stripeWebhook(
      stripe,
      store(),
      {}
    )(request('{}', 'x'), res as unknown as Response)
    expect(res.status).toHaveBeenCalledWith(503)
  })

  it('refuses a bad or missing signature (400) and changes nothing', async () => {
    const users = store()
    const handler = stripeWebhook(stripe, users, {
      STRIPE_WEBHOOK_SECRET: SECRET
    })
    for (const signature of ['t=1,v1=nope', undefined]) {
      const res = respond()
      await handler(request('{}', signature), res as unknown as Response)
      expect(res.status).toHaveBeenCalledWith(400)
    }
    expect(users.setSubscription).not.toHaveBeenCalled()
  })

  it('applies a signed subscription event to the user with that Customer', async () => {
    const users = store()
    const payload = JSON.stringify(
      event(
        'customer.subscription.updated',
        subscription({ status: 'past_due' })
      )
    )
    const res = respond()
    await stripeWebhook(stripe, users, { STRIPE_WEBHOOK_SECRET: SECRET })(
      request(payload, signed(payload)),
      res as unknown as Response
    )
    expect(users.setSubscription).toHaveBeenCalledWith(
      { stripeCustomerId: 'cus_1' },
      {
        customerId: 'cus_1',
        subscriptionId: 'sub_1',
        status: 'past_due',
        tier: 'MANAGER'
      }
    )
    expect(res.json).toHaveBeenCalledWith({ received: true, handled: true })
  })

  it('acknowledges an event it does not handle', async () => {
    const users = store()
    const payload = JSON.stringify(event('charge.succeeded', {}))
    const res = respond()
    await stripeWebhook(stripe, users, { STRIPE_WEBHOOK_SECRET: SECRET })(
      request(payload, signed(payload)),
      res as unknown as Response
    )
    expect(users.setSubscription).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ received: true, handled: false })
  })
})
