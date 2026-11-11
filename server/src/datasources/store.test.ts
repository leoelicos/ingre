import { StoreNotConfiguredError, StoreVerificationError } from '../errors'
import { appAccountTokenFor } from '../store/common'
import { signJws } from '../test-utils/appleChain'
import {
  BUNDLE,
  PACKAGE,
  appleKey,
  fakeStores,
  googleKeys
} from '../test-utils/fakeStores'
import { StoreApi } from './store'

/* #314: a store is on only with its credentials; without them nothing is trusted. */

const now = Date.parse('2026-11-11T00:00:00Z')
const USER = '65a1b2c3d4e5f60718293a4b'
const OTHER = '65a1b2c3d4e5f60718293a4c'
const keys = googleKeys()
const env = {
  GOOGLE_PLAY_PACKAGE_NAME: PACKAGE,
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: JSON.stringify(keys.serviceAccount),
  APPLE_BUNDLE_ID: BUNDLE,
  APPLE_IAP_KEY_ID: 'KEY123',
  APPLE_IAP_ISSUER_ID: 'issuer',
  APPLE_IAP_PRIVATE_KEY: appleKey()
    .privateKey.export({ type: 'pkcs8', format: 'pem' })
    .toString()
}

const googlePurchase = (
  account: string,
  productId = 'ingre_manager_monthly'
) => ({
  subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
  acknowledgementState: 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',
  lineItems: [{ productId, expiryTime: '2026-12-11T00:00:00Z' }],
  externalAccountIdentifiers: { obfuscatedExternalAccountId: account }
})

const appleTransaction = (account: string) => ({
  originalTransactionId: '2000000000000001',
  bundleId: BUNDLE,
  productId: 'ingre_leader_monthly',
  appAccountToken: appAccountTokenFor(account),
  environment: 'Sandbox',
  signedDate: now
})

const setup = (environment: Record<string, string | undefined> = env) => {
  const fake = fakeStores(keys.publicKey)
  const api = new StoreApi(environment, {
    fetch: fake.fetch,
    jws: { roots: [fake.chain.rootPem] },
    now: () => now
  })
  return { fake, api }
}

test('with no credentials both stores are off and every purchase is refused', async () => {
  const { api } = setup({})
  expect(api.google).toBeNull()
  expect(api.apple).toBeNull()
  await expect(
    api.verify('GOOGLE', 'ingre_manager_monthly', 't', USER)
  ).rejects.toThrow(new StoreNotConfiguredError('Google Play'))
  await expect(
    api.verify('APPLE', 'ingre_manager_monthly', 't', USER)
  ).rejects.toThrow(new StoreNotConfiguredError('App Store'))
})

test('the default environment has no store credentials in tests', () => {
  const api = new StoreApi()
  expect(api.google).toBeNull()
  expect(api.apple).toBeNull()
})

test('a Google purchase for this user and product is verified', async () => {
  const { fake, api } = setup()
  fake.google.set('tok', googlePurchase(USER))
  await expect(
    api.verify('GOOGLE', 'ingre_manager_monthly', 'tok', USER)
  ).resolves.toMatchObject({
    platform: 'GOOGLE',
    tier: 'MANAGER',
    storeId: 'tok'
  })
})

test('an Apple purchase for this user and product is verified', async () => {
  const { fake, api } = setup()
  fake.apple.set('2000000000000001', {
    status: 1,
    transaction: appleTransaction(USER)
  })
  const jws = signJws(fake.chain, appleTransaction(USER))
  await expect(
    api.verify('APPLE', 'ingre_leader_monthly', jws, USER)
  ).resolves.toMatchObject({
    platform: 'APPLE',
    tier: 'LEADER',
    status: 'active'
  })
})

test('another product, or a purchase of another user, is refused', async () => {
  const { fake, api } = setup()
  fake.google.set('tok', googlePurchase(OTHER))
  fake.google.set('mine', googlePurchase(USER))
  await expect(
    api.verify('GOOGLE', 'ingre_manager_monthly', 'tok', USER)
  ).rejects.toThrow(
    new StoreVerificationError('the purchase belongs to another account')
  )
  await expect(
    api.verify('GOOGLE', 'ingre_leader_monthly', 'mine', USER)
  ).rejects.toThrow(
    new StoreVerificationError('the purchase is for another product')
  )
})
