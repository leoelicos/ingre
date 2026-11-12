import { createHmac } from 'node:crypto'
import type { Request, Response } from 'express'
import type { EntitlementStore } from '../datasources/entitlement'
import type { RevenueCatSync } from '../payments/revenuecat'
import {
  USER,
  paddleEvent,
  paddleSubscription
} from '../test-utils/paymentEvents'
import { paddleSignatureCheck, paddleWebhook } from './paddle'

/* Paddle + RevenueCat: Paddle's notifications, signature-checked with the Paddle Node SDK. */

/* a made-up secret for these tests only; real ones come from PADDLE_WEBHOOK_SECRET */
const SECRET = 'pdl_ntfset_unit_test_only'
const env = { PADDLE_WEBHOOK_SECRET: SECRET, PADDLE_ENVIRONMENT: 'sandbox' }

/** A Paddle-Signature header exactly as Paddle makes one: ts and an HMAC-SHA256 of "ts:body". */
const sign = (
  body: string,
  secret = SECRET,
  ts = Math.floor(Date.now() / 1000)
) =>
  `ts=${ts};h1=${createHmac('sha256', secret).update(`${ts}:${body}`).digest('hex')}`

const fakeStore = () => ({
  claim: jest.fn(async () => true),
  release: jest.fn(async () => undefined),
  apply: jest.fn(async () => 'applied' as const)
})

const fakeSync = () => ({ syncPaddle: jest.fn(async () => undefined) })

const call = async (
  body: unknown,
  signature: string | undefined,
  store: EntitlementStore = fakeStore(),
  sync: RevenueCatSync | null = null,
  environment: Record<string, string | undefined> = env
) => {
  const res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnValue(res)
  const req = {
    body,
    header: (name: string) =>
      name === 'paddle-signature' ? signature : undefined
  }
  await paddleWebhook(
    store,
    sync,
    environment
  )(req as unknown as Request, res as unknown as Response)
  return res
}

const raw = (payload: unknown) => Buffer.from(JSON.stringify(payload))

describe('paddleWebhook', () => {
  it('is 503 until PADDLE_WEBHOOK_SECRET is set', async () => {
    const res = await call(raw(paddleEvent()), 'x', fakeStore(), null, {})
    expect(res.status).toHaveBeenCalledWith(503)
  })

  it('refuses a bad, stale, missing or garbled signature', async () => {
    const body = raw(paddleEvent())
    const text = body.toString()
    for (const signature of [
      sign(text, 'pdl_ntfset_someone_else'),
      sign(text, SECRET, Math.floor(Date.now() / 1000) - 3600),
      undefined,
      'garbage'
    ]) {
      const res = await call(body, signature)
      expect(res.status).toHaveBeenCalledWith(400)
    }
    // a body that isn't the raw Buffer can't be checked
    expect((await call(paddleEvent(), sign(text))).status).toHaveBeenCalledWith(
      400
    )
  })

  it('refuses a signed body that is not JSON', async () => {
    const res = await call(Buffer.from('not json'), sign('not json'))
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'not JSON' })
  })

  it('applies a signed event and posts a new subscription to RevenueCat', async () => {
    const store = fakeStore()
    const sync = fakeSync()
    const body = raw(paddleEvent('subscription.created'))
    const res = await call(body, sign(body.toString()), store, sync)
    expect(store.apply).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER,
        tier: 'EXPLORER',
        status: 'active'
      })
    )
    expect(sync.syncPaddle).toHaveBeenCalledWith(
      USER,
      'sub_01hv8x29kz0t586xy6zn1a62ny'
    )
    expect(res.json).toHaveBeenCalledWith({
      received: true,
      handled: true,
      outcome: 'applied'
    })
  })

  it('does not post updates (or anything, with no key) to RevenueCat', async () => {
    const sync = fakeSync()
    const updated = raw(paddleEvent('subscription.updated'))
    await call(updated, sign(updated.toString()), fakeStore(), sync)
    expect(sync.syncPaddle).not.toHaveBeenCalled()
    const created = raw(paddleEvent('subscription.created'))
    const res = await call(created, sign(created.toString()), fakeStore(), null)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ handled: true })
    )
  })

  it('reads the price tier map from the environment', async () => {
    const store = fakeStore()
    const subscription = paddleSubscription({
      items: [{ price: { id: 'pri_plain', custom_data: null } }]
    })
    const body = raw(paddleEvent('subscription.updated', subscription))
    await call(body, sign(body.toString()), store, null, {
      ...env,
      PADDLE_PRICE_TIERS: 'pri_plain=LEADER'
    })
    expect(store.apply).toHaveBeenCalledWith(
      expect.objectContaining({ tier: 'LEADER' })
    )
  })

  it('builds the SDK check for either environment', async () => {
    const body = '{}'
    expect(
      await paddleSignatureCheck({
        PADDLE_ENVIRONMENT: 'production',
        PADDLE_API_KEY: 'k'
      }).isSignatureValid(body, SECRET, sign(body))
    ).toBe(true)
  })
})
