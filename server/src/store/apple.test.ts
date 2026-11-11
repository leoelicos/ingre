import { verify } from 'node:crypto'
import { StoreVerificationError } from '../errors'
import { signJws } from '../test-utils/appleChain'
import { BUNDLE, appleKey, fakeStores } from '../test-utils/fakeStores'
import { AppleStore, appleConfig, statusOfApple } from './apple'
import { appAccountTokenFor } from './common'

/* #314: StoreKit 2 transactions are verified, then their status is read back from Apple. */

const key = appleKey()
const now = Date.parse('2026-11-11T00:00:00Z')
const USER = '65a1b2c3d4e5f60718293a4b'
const pem = key.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
const env = {
  APPLE_BUNDLE_ID: BUNDLE,
  APPLE_IAP_KEY_ID: 'KEY123',
  APPLE_IAP_ISSUER_ID: '57246542-96fe-1a63-e053-0824d011072a',
  APPLE_IAP_PRIVATE_KEY: pem
}

const transaction = (overrides: Record<string, unknown> = {}) => ({
  transactionId: '2000000000000002',
  originalTransactionId: '2000000000000001',
  bundleId: BUNDLE,
  productId: 'ingre_explorer_monthly',
  type: 'Auto-Renewable Subscription',
  expiresDate: Date.parse('2026-12-11T00:00:00Z'),
  appAccountToken: appAccountTokenFor(USER),
  environment: 'Sandbox',
  signedDate: now,
  ...overrides
})

const setup = () => {
  const fake = fakeStores()
  const config = appleConfig(env)
  if (config === null) throw new Error('config')
  const store = new AppleStore(
    config,
    fake.fetch,
    { roots: [fake.chain.rootPem] },
    () => now
  )
  return { fake, store }
}

describe('appleConfig', () => {
  test('needs all four values', () => {
    expect(appleConfig({})).toBeNull()
    expect(appleConfig({ ...env, APPLE_IAP_PRIVATE_KEY: '' })).toBeNull()
    expect(appleConfig({ ...env, APPLE_IAP_KEY_ID: undefined })).toBeNull()
  })
  test('takes the .p8 key with newlines, escaped newlines or base64', () => {
    expect(appleConfig(env)?.privateKey).toBe(pem)
    expect(
      appleConfig({ ...env, APPLE_IAP_PRIVATE_KEY: pem.replace(/\n/g, '\\n') })
        ?.privateKey
    ).toBe(pem)
    expect(
      appleConfig({
        ...env,
        APPLE_IAP_PRIVATE_KEY: Buffer.from(pem).toString('base64')
      })?.privateKey
    ).toBe(pem)
  })
})

test.each([
  [1, 'active'],
  [4, 'active'],
  [3, 'past_due'],
  [2, 'canceled'],
  [5, 'canceled'],
  [9, 'incomplete'],
  ['1', 'incomplete']
])('status %p -> %s', (code, expected) => {
  expect(statusOfApple(code)).toBe(expected)
})

test('the API token is ES256 for this app and key', () => {
  const { store } = setup()
  const [h = '', p = '', s = ''] = store.apiToken().split('.')
  const decode = (part: string) =>
    JSON.parse(Buffer.from(part, 'base64url').toString()) as Record<
      string,
      unknown
    >
  expect(decode(h)).toEqual({ alg: 'ES256', kid: 'KEY123', typ: 'JWT' })
  expect(decode(p)).toEqual({
    iss: env.APPLE_IAP_ISSUER_ID,
    iat: now / 1000,
    exp: now / 1000 + 300,
    aud: 'appstoreconnect-v1',
    bid: BUNDLE
  })
  expect(
    verify(
      'sha256',
      Buffer.from(`${h}.${p}`),
      { key: key.publicKey, dsaEncoding: 'ieee-p1363' },
      Buffer.from(s, 'base64url')
    )
  ).toBe(true)
})

describe('verify', () => {
  test('a sandbox purchase is checked with the sandbox status API', async () => {
    const { fake, store } = setup()
    fake.apple.set('2000000000000001', {
      status: 1,
      transaction: transaction()
    })
    await expect(
      store.verify(signJws(fake.chain, transaction()))
    ).resolves.toEqual({
      platform: 'APPLE',
      productId: 'ingre_explorer_monthly',
      tier: 'EXPLORER',
      status: 'active',
      expiresAt: new Date('2026-12-11T00:00:00Z'),
      storeId: '2000000000000001',
      replacesStoreId: null,
      accountUserId: USER
    })
    expect(fake.requests[0]?.url).toBe(
      'https://api.storekit-sandbox.itunes.apple.com/inApps/v1/subscriptions/2000000000000001'
    )
    expect(fake.requests[0]?.headers['authorization']).toMatch(/^Bearer ey/)
  })

  test('the latest transaction wins: an upgrade shows the new tier, the status comes from Apple', async () => {
    const { fake, store } = setup()
    fake.apple.set('2000000000000001', {
      status: 3,
      transaction: transaction({
        productId: 'ingre_leader_monthly',
        appAccountToken: undefined,
        expiresDate: undefined
      })
    })
    await expect(
      store.verify(
        signJws(fake.chain, transaction({ environment: 'Production' }))
      )
    ).resolves.toMatchObject({
      tier: 'LEADER',
      status: 'past_due',
      expiresAt: null,
      accountUserId: USER
    })
    expect(fake.requests[0]?.url).toContain(
      'https://api.storekit.itunes.apple.com/'
    )
  })

  test('a revoked (refunded) transaction is cancelled', async () => {
    const { fake, store } = setup()
    fake.apple.set('2000000000000001', {
      status: 1,
      transaction: transaction({ revocationDate: now })
    })
    await expect(
      store.verify(signJws(fake.chain, transaction()))
    ).resolves.toMatchObject({
      status: 'canceled'
    })
  })

  test('without an appAccountToken the account is unknown', async () => {
    const { fake, store } = setup()
    const t = transaction({ appAccountToken: undefined })
    fake.apple.set('2000000000000001', { status: 1, transaction: t })
    await expect(store.verify(signJws(fake.chain, t))).resolves.toMatchObject({
      accountUserId: null
    })
  })

  test.each([
    [{ bundleId: 'other.app' }, 'transaction is for another app'],
    [{ productId: 'coins' }, 'not an ingre subscription'],
    [{ environment: 'Xcode' }, 'not an App Store transaction'],
    [{ originalTransactionId: undefined }, 'no original transaction id']
  ])('refuses %p', async (overrides, message) => {
    const { fake, store } = setup()
    await expect(
      store.verify(signJws(fake.chain, transaction(overrides)))
    ).rejects.toThrow(new StoreVerificationError(message))
  })

  test('refuses a forged signature', async () => {
    const { store } = setup()
    const stranger = fakeStores().chain
    await expect(
      store.verify(signJws(stranger, transaction()))
    ).rejects.toThrow('Apple signature: untrusted root')
  })

  test('refuses a subscription Apple does not know', async () => {
    const { fake, store } = setup()
    await expect(
      store.verify(signJws(fake.chain, transaction()))
    ).rejects.toThrow('the App Store does not know this subscription')
  })

  test('an outage is an error, not a refusal', async () => {
    const { fake, store } = setup()
    fake.failNext(500)
    await expect(
      store.verify(signJws(fake.chain, transaction()))
    ).rejects.toThrow('App Store Server API 500')
  })

  test('a status answer without our transaction is refused', async () => {
    const { fake } = setup()
    const config = appleConfig(env)
    if (config === null) throw new Error('config')
    const answers = [
      {},
      { data: [{}] },
      {
        data: [
          { lastTransactions: [{ originalTransactionId: '2000000000000001' }] }
        ]
      }
    ]
    for (const answer of answers) {
      const store = new AppleStore(
        config,
        (async () =>
          new Response(JSON.stringify(answer), {
            status: 200
          })) as typeof fetch,
        { roots: [fake.chain.rootPem] },
        () => now
      )
      await expect(
        store.verify(signJws(fake.chain, transaction()))
      ).rejects.toThrow('the App Store does not know this subscription')
    }
  })

  test('errors other than signature problems pass through', async () => {
    const config = appleConfig({ ...env })
    if (config === null) throw new Error('config')
    const store = new AppleStore(
      config,
      fetch,
      { roots: ['not a pem'] },
      () => now
    )
    const fake = fakeStores()
    await expect(
      store.verify(signJws(fake.chain, transaction()))
    ).rejects.not.toBeInstanceOf(StoreVerificationError)
  })
})

describe('fromNotification', () => {
  const notice = (data: Record<string, unknown>) => ({
    notificationType: 'DID_RENEW',
    notificationUUID: 'b1',
    data,
    version: '2.0',
    signedDate: now
  })

  test('re-reads the subscription a signed notice is about', async () => {
    const { fake, store } = setup()
    fake.apple.set('2000000000000001', {
      status: 2,
      transaction: transaction()
    })
    const signedPayload = signJws(
      fake.chain,
      notice({
        bundleId: BUNDLE,
        signedTransactionInfo: signJws(fake.chain, transaction())
      })
    )
    await expect(
      store.fromNotification({ signedPayload })
    ).resolves.toMatchObject({
      storeId: '2000000000000001',
      status: 'canceled'
    })
  })

  test('TEST notices and other apps are ignored', async () => {
    const { fake, store } = setup()
    await expect(
      store.fromNotification({
        signedPayload: signJws(fake.chain, notice({ bundleId: BUNDLE }))
      })
    ).resolves.toBeNull()
    await expect(
      store.fromNotification({
        signedPayload: signJws(fake.chain, notice({ bundleId: 'x' }))
      })
    ).resolves.toBeNull()
    await expect(
      store.fromNotification({
        signedPayload: signJws(fake.chain, { notificationType: 'TEST' })
      })
    ).resolves.toBeNull()
  })

  test('an unsigned or missing payload is refused', async () => {
    const { store } = setup()
    await expect(store.fromNotification({})).rejects.toThrow('no signedPayload')
    await expect(store.fromNotification(null)).rejects.toThrow(
      'no signedPayload'
    )
    await expect(
      store.fromNotification({ signedPayload: 'a.b.c' })
    ).rejects.toThrow(StoreVerificationError)
  })
})
