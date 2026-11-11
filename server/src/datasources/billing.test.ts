import type Stripe from 'stripe'
import { PaymentDeclinedError, PaymentProviderError } from '../errors'
import { fakeStripe } from '../test-utils/fakeStripe'
import { BillingApi, pinnedPrice } from './billing'

/* #312: the tiers as subscriptions, against a local Stripe stand-in (no module mocks). */

const fake = fakeStripe()
let stripe: Stripe

beforeAll(async () => {
  stripe = await fake.start()
})
afterAll(() => fake.stop())

const who = {
  email: 'cook@example.com',
  name: 'Home Cook',
  userId: 'u1',
  customerId: null,
  subscriptionId: null
}

describe('setUp (the idempotent setup script)', () => {
  it('makes a Product and a monthly USD Price per tier, then nothing more on a re-run', async () => {
    const billing = new BillingApi(stripe, {})
    const first = await billing.setUp()
    expect(first.map(({ tier, created }) => [tier, created])).toEqual([
      ['EXPLORER', true],
      ['MANAGER', true],
      ['LEADER', true]
    ])
    expect(fake.prices.map((p) => [p['lookup_key'], p['unit_amount']])).toEqual(
      [
        ['ingre_explorer_monthly', 400],
        ['ingre_manager_monthly', 800],
        ['ingre_leader_monthly', 1600]
      ]
    )
    expect(
      fake.prices.every(
        (p) => JSON.stringify(p['recurring']) === '{"interval":"month"}'
      )
    ).toBe(true)
    const again = await billing.setUp()
    expect(again.every(({ created }) => !created)).toBe(true)
    expect(again.map(({ priceId }) => priceId)).toEqual(
      first.map(({ priceId }) => priceId)
    )
    expect(fake.products).toHaveLength(3)
  })

  it('reuses a tier’s Product when only its Price is missing', async () => {
    const leader = fake.prices.findIndex(
      (p) => p['lookup_key'] === 'ingre_leader_monthly'
    )
    fake.prices.splice(leader, 1)
    const results = await new BillingApi(stripe, {}).setUp()
    expect(results.find(({ tier }) => tier === 'LEADER')?.created).toBe(true)
    expect(fake.products).toHaveLength(3)
  })

  it('reads an expanded product on an existing Price', async () => {
    const explorer = fake.prices[0]
    if (explorer === undefined) throw new Error('no price')
    const product = explorer['product']
    explorer['product'] = { id: product, object: 'product' }
    const results = await new BillingApi(stripe, {}).setUp()
    expect(results[0]?.productId).toBe(product)
    explorer['product'] = product
  })
})

describe('subscribe, with Stripe’s documented test tokens', () => {
  it('tok_visa: makes the Customer with the token as its source and an active subscription', async () => {
    const result = await new BillingApi(stripe, {}).subscribe({
      ...who,
      tier: 'MANAGER',
      token: 'tok_visa'
    })
    expect(result.status).toBe('active')
    const customer = fake.calls.find(
      (c) => c.method === 'POST' && c.path === '/v1/customers'
    )
    expect(customer?.body).toMatchObject({
      source: 'tok_visa',
      email: who.email,
      'metadata[userId]': 'u1'
    })
    const sub = fake.calls.find(
      (c) => c.method === 'POST' && c.path === '/v1/subscriptions'
    )
    const manager = fake.prices.find(
      (p) => p['lookup_key'] === 'ingre_manager_monthly'
    )
    expect(sub?.body['items[0][price]']).toBe(manager?.['id'])
    expect(sub?.body['metadata[ingre_tier]']).toBe('MANAGER')
  })

  it('tok_visa_chargeDeclined: a decline with Stripe’s code, and no subscription', async () => {
    const before = fake.calls.filter(
      (c) => c.path === '/v1/subscriptions'
    ).length
    const attempt = new BillingApi(stripe, {}).subscribe({
      ...who,
      tier: 'EXPLORER',
      token: 'tok_visa_chargeDeclined'
    })
    await expect(attempt).rejects.toBeInstanceOf(PaymentDeclinedError)
    await expect(attempt).rejects.toMatchObject({
      extensions: { code: 'PAYMENT_DECLINED', decline: 'card_declined' }
    })
    expect(
      fake.calls.filter((c) => c.path === '/v1/subscriptions').length
    ).toBe(before)
  })

  it('tok_chargeCustomerFail: attaches, then the first charge fails: incomplete', async () => {
    const result = await new BillingApi(stripe, {}).subscribe({
      ...who,
      tier: 'EXPLORER',
      token: 'tok_chargeCustomerFail'
    })
    expect(result.status).toBe('incomplete')
  })

  it('an existing Customer gets the new token; an existing subscription moves to the new Price', async () => {
    const billing = new BillingApi(stripe, {})
    const first = await billing.subscribe({
      ...who,
      tier: 'EXPLORER',
      token: 'tok_visa'
    })
    const moved = await billing.subscribe({
      ...who,
      customerId: first.customerId,
      subscriptionId: first.subscriptionId,
      tier: 'LEADER',
      token: 'tok_mastercard'
    })
    expect(moved).toEqual({ ...first, status: 'active' })
    const update = fake.calls
      .filter(
        (c) =>
          c.method === 'POST' &&
          c.path === `/v1/subscriptions/${first.subscriptionId}`
      )
      .pop()
    const leader = fake.prices.find(
      (p) => p['lookup_key'] === 'ingre_leader_monthly'
    )
    expect(update?.body['items[0][price]']).toBe(leader?.['id'])
    expect(update?.body['items[0][id]']).toMatch(/^si_/)
    const customer = fake.calls
      .filter((c) => c.path === `/v1/customers/${first.customerId}`)
      .pop()
    expect(customer?.body['source']).toBe('tok_mastercard')
  })

  it('a pinned Price id is used as is', async () => {
    expect(pinnedPrice('LEADER', { STRIPE_PRICE_LEADER: 'price_pinned' })).toBe(
      'price_pinned'
    )
    expect(pinnedPrice('LEADER', { STRIPE_PRICE_LEADER: '' })).toBeNull()
    await new BillingApi(stripe, {
      STRIPE_PRICE_LEADER: 'price_pinned'
    }).subscribe({
      ...who,
      tier: 'LEADER',
      token: 'tok_visa'
    })
    const sub = fake.calls
      .filter((c) => c.method === 'POST' && c.path === '/v1/subscriptions')
      .pop()
    expect(sub?.body['items[0][price]']).toBe('price_pinned')
  })

  it('says to run the setup script when a tier has no Price', async () => {
    fake.prices.length = 0
    await expect(
      new BillingApi(stripe, {}).subscribe({
        ...who,
        tier: 'LEADER',
        token: 'tok_visa'
      })
    ).rejects.toThrow('npm run stripe:setup')
  })

  it('Stripe being down is a provider error, not a decline', async () => {
    fake.setDown(true)
    await expect(
      new BillingApi(stripe, { STRIPE_PRICE_LEADER: 'price_pinned' }).subscribe(
        {
          ...who,
          tier: 'LEADER',
          token: 'tok_visa'
        }
      )
    ).rejects.toBeInstanceOf(PaymentProviderError)
    fake.setDown(false)
  })
})
