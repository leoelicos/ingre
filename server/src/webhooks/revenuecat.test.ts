import type { Request, Response } from 'express'
import { USER, revenueCatEvent } from '../test-utils/paymentEvents'
import { revenueCatWebhook } from './revenuecat'

/* Paddle + RevenueCat: RevenueCat's webhooks, authorised by the header set in its dashboard. */

const AUTH = 'rc_webhook_unit_test_only'

const fakeStore = () => ({
  claim: jest.fn(async () => true),
  release: jest.fn(async () => undefined),
  apply: jest.fn(async () => 'applied' as const)
})

const call = async (
  body: unknown,
  authorization: string | undefined,
  env: Record<string, string | undefined> = { REVENUECAT_WEBHOOK_AUTH: AUTH },
  store = fakeStore()
) => {
  const res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnValue(res)
  const req = {
    body,
    header: (name: string) =>
      name === 'authorization' ? authorization : undefined
  }
  await revenueCatWebhook(
    store,
    env,
    () => new Date(1795000000000)
  )(req as unknown as Request, res as unknown as Response)
  return { res, store }
}

describe('revenueCatWebhook', () => {
  it('is 503 until REVENUECAT_WEBHOOK_AUTH is set, 401 with the wrong header', async () => {
    expect(
      (await call(revenueCatEvent(), AUTH, {})).res.status
    ).toHaveBeenCalledWith(503)
    expect(
      (await call(revenueCatEvent(), 'Bearer guess')).res.status
    ).toHaveBeenCalledWith(401)
    expect(
      (await call(revenueCatEvent(), undefined)).res.status
    ).toHaveBeenCalledWith(401)
  })

  it('applies a store purchase', async () => {
    const { res, store } = await call(revenueCatEvent(), AUTH)
    expect(store.apply).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER,
        tier: 'MANAGER',
        source: 'APP_STORE'
      })
    )
    expect(res.json).toHaveBeenCalledWith({
      received: true,
      handled: true,
      outcome: 'applied'
    })
  })

  it('ignores production purchases on a test server, and refuses junk', async () => {
    const production = await call(
      revenueCatEvent({ environment: 'PRODUCTION' }),
      AUTH,
      { REVENUECAT_WEBHOOK_AUTH: AUTH, APP_ENV: 'test' }
    )
    expect(production.store.apply).not.toHaveBeenCalled()
    expect(production.res.json).toHaveBeenCalledWith(
      expect.objectContaining({ handled: false })
    )
    expect((await call({ nope: true }, AUTH)).res.status).toHaveBeenCalledWith(
      400
    )
  })

  it('uses the clock by default', async () => {
    const res = { status: jest.fn(), json: jest.fn() }
    res.status.mockReturnValue(res)
    await revenueCatWebhook(fakeStore(), { REVENUECAT_WEBHOOK_AUTH: AUTH })(
      {
        body: revenueCatEvent(),
        header: () => AUTH
      } as unknown as Request,
      res as unknown as Response
    )
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ handled: true })
    )
  })
})
