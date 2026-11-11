import type { Request, Response } from 'express'
import { StoreApi } from '../datasources/store'
import type { StoreState } from '../store/common'
import { signJws } from '../test-utils/appleChain'
import {
  BUNDLE,
  PACKAGE,
  appleKey,
  fakeStores,
  googleKeys
} from '../test-utils/fakeStores'
import { appleNotifications, googleRtdn } from './store'

/* #314: store notices are only a nudge; the state always comes from the store itself. */

const now = Date.parse('2026-11-11T00:00:00Z')
const keys = googleKeys()
const env = {
  GOOGLE_PLAY_PACKAGE_NAME: PACKAGE,
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: JSON.stringify(keys.serviceAccount),
  GOOGLE_RTDN_TOKEN: 'rtdn-unit-test-only',
  APPLE_BUNDLE_ID: BUNDLE,
  APPLE_IAP_KEY_ID: 'KEY123',
  APPLE_IAP_ISSUER_ID: 'issuer',
  APPLE_IAP_PRIVATE_KEY: appleKey()
    .privateKey.export({ type: 'pkcs8', format: 'pem' })
    .toString()
}

const setup = (environment: Record<string, string | undefined> = env) => {
  const fake = fakeStores(keys.publicKey)
  const store = new StoreApi(environment, {
    fetch: fake.fetch,
    jws: { roots: [fake.chain.rootPem] },
    now: () => now
  })
  const applied: StoreState[] = []
  const users = {
    applyStoreNotification: jest.fn(async (state: StoreState) => {
      applied.push(state)
      return state.storeId === 'nobody' ? null : { _id: 'u1' }
    })
  }
  return { fake, store, users, applied }
}

const respond = () => {
  const res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnValue(res)
  return res
}

const call = async (
  handler: (req: Request, res: Response) => Promise<void>,
  body: unknown,
  query: Record<string, unknown> = {}
) => {
  const res = respond()
  await handler(
    { body, query } as unknown as Request,
    res as unknown as Response
  )
  return res
}

const push = (token: string) => ({
  message: {
    data: Buffer.from(
      JSON.stringify({
        packageName: PACKAGE,
        subscriptionNotification: { notificationType: 2, purchaseToken: token }
      })
    ).toString('base64')
  }
})

const activeGoogle = {
  subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
  acknowledgementState: 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',
  lineItems: [{ productId: 'ingre_explorer_monthly' }]
}

describe('googleRtdn', () => {
  it('503 until Google Play and the push token are configured', async () => {
    const off = setup({})
    expect(
      (await call(googleRtdn(off.store, off.users, {}), push('t'))).status
    ).toHaveBeenCalledWith(503)
    const noToken = setup({ ...env, GOOGLE_RTDN_TOKEN: undefined })
    expect(
      (
        await call(
          googleRtdn(noToken.store, noToken.users, {
            ...env,
            GOOGLE_RTDN_TOKEN: ''
          }),
          push('t')
        )
      ).status
    ).toHaveBeenCalledWith(503)
  })

  it('401 without the right push token', async () => {
    const { store, users } = setup()
    const handler = googleRtdn(store, users, env)
    expect((await call(handler, push('t'))).status).toHaveBeenCalledWith(401)
    expect(
      (await call(handler, push('t'), { token: 'wrong' })).status
    ).toHaveBeenCalledWith(401)
    expect(
      (
        await call(handler, push('t'), {
          token: 'rtdn-unit-test-only-but-longer'
        })
      ).status
    ).toHaveBeenCalledWith(401)
  })

  it('re-reads the purchase from Google and applies it', async () => {
    const { fake, store, users, applied } = setup()
    fake.google.set('tok-1', activeGoogle)
    const res = await call(googleRtdn(store, users, env), push('tok-1'), {
      token: 'rtdn-unit-test-only'
    })
    expect(res.json).toHaveBeenCalledWith({ received: true, handled: true })
    expect(applied[0]).toMatchObject({
      storeId: 'tok-1',
      tier: 'EXPLORER',
      status: 'active'
    })
  })

  it('test notices are acknowledged and ignored', async () => {
    const { store, users } = setup()
    const res = await call(
      googleRtdn(store, users, env),
      { message: {} },
      { token: 'rtdn-unit-test-only' }
    )
    expect(res.json).toHaveBeenCalledWith({ received: true, handled: false })
    expect(users.applyStoreNotification).not.toHaveBeenCalled()
  })

  it('an unknown token is dropped; an outage is a 500 so Pub/Sub retries', async () => {
    const { fake, store, users } = setup()
    const handler = googleRtdn(store, users, env)
    const q = { token: 'rtdn-unit-test-only' }
    expect((await call(handler, push('unknown'), q)).json).toHaveBeenCalledWith(
      {
        received: true,
        handled: false
      }
    )
    fake.failNext(503)
    expect((await call(handler, push('x'), q)).status).toHaveBeenCalledWith(500)
  })
})

describe('appleNotifications', () => {
  const transaction = {
    originalTransactionId: '2000000000000001',
    bundleId: BUNDLE,
    productId: 'ingre_manager_monthly',
    environment: 'Production',
    signedDate: now
  }

  it('503 until the App Store is configured', async () => {
    const off = setup({})
    expect(
      (await call(appleNotifications(off.store, off.users), {})).status
    ).toHaveBeenCalledWith(503)
  })

  it('verifies the notice, re-reads the subscription and applies it', async () => {
    const { fake, store, users, applied } = setup()
    fake.apple.set('2000000000000001', { status: 1, transaction })
    const signedPayload = signJws(fake.chain, {
      notificationType: 'DID_CHANGE_RENEWAL_PREF',
      subtype: 'UPGRADE',
      data: {
        bundleId: BUNDLE,
        signedTransactionInfo: signJws(fake.chain, transaction)
      },
      signedDate: now
    })
    const res = await call(appleNotifications(store, users), { signedPayload })
    expect(res.json).toHaveBeenCalledWith({ received: true, handled: true })
    expect(applied[0]).toMatchObject({
      platform: 'APPLE',
      tier: 'MANAGER',
      storeId: '2000000000000001'
    })
  })

  it('a forged notice is dropped without touching anyone', async () => {
    const { store, users } = setup()
    const forged = signJws(fakeStores().chain, { data: { bundleId: BUNDLE } })
    const res = await call(appleNotifications(store, users), {
      signedPayload: forged
    })
    expect(res.json).toHaveBeenCalledWith({ received: true, handled: false })
    expect(users.applyStoreNotification).not.toHaveBeenCalled()
  })

  it('a TEST notice is fine; a subscription nobody holds is not handled', async () => {
    const { fake, store, users } = setup()
    const test = signJws(fake.chain, {
      notificationType: 'TEST',
      data: { bundleId: BUNDLE }
    })
    expect(
      (await call(appleNotifications(store, users), { signedPayload: test }))
        .json
    ).toHaveBeenCalledWith({
      received: true,
      handled: false
    })
    fake.apple.set('nobody', {
      status: 1,
      transaction: { ...transaction, originalTransactionId: 'nobody' }
    })
    const orphan = signJws(fake.chain, {
      data: {
        bundleId: BUNDLE,
        signedTransactionInfo: signJws(fake.chain, {
          ...transaction,
          originalTransactionId: 'nobody'
        })
      }
    })
    expect(
      (await call(appleNotifications(store, users), { signedPayload: orphan }))
        .json
    ).toHaveBeenCalledWith({
      received: true,
      handled: false
    })
  })
})
