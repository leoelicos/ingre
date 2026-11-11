import { StoreVerificationError } from '../errors'
import { PACKAGE, fakeStores, googleKeys } from '../test-utils/fakeStores'
import {
  GooglePlay,
  googleConfig,
  stateOfGoogle,
  statusOfGoogle
} from './google'

/* #314: Google Play purchases are read back from the Play Developer API, never trusted as sent. */

const keys = googleKeys()
const now = Date.parse('2026-11-11T00:00:00Z')
const env = {
  GOOGLE_PLAY_PACKAGE_NAME: PACKAGE,
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: JSON.stringify(keys.serviceAccount)
}
const USER = '65a1b2c3d4e5f60718293a4b'

const purchase = (overrides: Record<string, unknown> = {}) => ({
  kind: 'androidpublisher#subscriptionPurchaseV2',
  subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
  acknowledgementState: 'ACKNOWLEDGEMENT_STATE_PENDING',
  lineItems: [
    { productId: 'ingre_manager_monthly', expiryTime: '2026-12-11T00:00:00Z' }
  ],
  externalAccountIdentifiers: { obfuscatedExternalAccountId: USER },
  ...overrides
})

describe('googleConfig', () => {
  test('needs the package name and a service account', () => {
    expect(googleConfig({})).toBeNull()
    expect(googleConfig({ GOOGLE_PLAY_PACKAGE_NAME: PACKAGE })).toBeNull()
    expect(
      googleConfig({
        ...env,
        GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: '{"client_email":"a"}'
      })
    ).toBeNull()
    expect(
      googleConfig({
        ...env,
        GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: 'not json at all'
      })
    ).toBeNull()
    expect(
      googleConfig({ ...env, GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: '[1]' })
    ).toBeNull()
  })

  test('takes the JSON as is or base64 encoded', () => {
    const config = googleConfig(env)
    expect(config).toEqual({
      packageName: PACKAGE,
      clientEmail: keys.serviceAccount.client_email,
      privateKey: keys.serviceAccount.private_key,
      tokenUri: 'https://oauth2.googleapis.com/token'
    })
    const encoded = Buffer.from(env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON).toString(
      'base64'
    )
    expect(
      googleConfig({ ...env, GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: encoded })
    ).toEqual(config)
    const { token_uri: _, ...noUri } = keys.serviceAccount
    expect(
      googleConfig({
        ...env,
        GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: JSON.stringify(noUri)
      })?.tokenUri
    ).toBe('https://oauth2.googleapis.com/token')
  })
})

describe('statusOfGoogle', () => {
  const later = new Date(now + 1000)
  const earlier = new Date(now - 1000)
  test.each([
    ['SUBSCRIPTION_STATE_ACTIVE', later, 'active'],
    ['SUBSCRIPTION_STATE_IN_GRACE_PERIOD', later, 'active'],
    ['SUBSCRIPTION_STATE_ON_HOLD', later, 'past_due'],
    ['SUBSCRIPTION_STATE_PAUSED', later, 'past_due'],
    ['SUBSCRIPTION_STATE_CANCELED', later, 'active'],
    ['SUBSCRIPTION_STATE_CANCELED', earlier, 'canceled'],
    ['SUBSCRIPTION_STATE_CANCELED', null, 'canceled'],
    ['SUBSCRIPTION_STATE_EXPIRED', earlier, 'canceled'],
    ['SUBSCRIPTION_STATE_PENDING', null, 'incomplete'],
    [
      'SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED',
      null,
      'incomplete_expired'
    ],
    [null, null, 'incomplete']
  ])('%s -> %s', (state, expires, expected) => {
    expect(statusOfGoogle(state, expires, now)).toBe(expected)
  })
})

describe('stateOfGoogle', () => {
  test('reads tier, expiry, replaced token and account', () => {
    expect(
      stateOfGoogle('tok', purchase({ linkedPurchaseToken: 'old' }), now)
    ).toEqual({
      platform: 'GOOGLE',
      productId: 'ingre_manager_monthly',
      tier: 'MANAGER',
      status: 'active',
      expiresAt: new Date('2026-12-11T00:00:00Z'),
      storeId: 'tok',
      replacesStoreId: 'old',
      accountUserId: USER
    })
  })

  test('missing optional parts are null', () => {
    const state = stateOfGoogle(
      'tok',
      {
        subscriptionState: 'SUBSCRIPTION_STATE_PENDING',
        lineItems: [{ productId: 'ingre_leader_monthly' }]
      },
      now
    )
    expect(state).toMatchObject({
      tier: 'LEADER',
      status: 'incomplete',
      expiresAt: null,
      replacesStoreId: null,
      accountUserId: null
    })
  })

  test('refuses anything that is not one of our subscriptions', () => {
    expect(() => stateOfGoogle('tok', null, now)).toThrow(
      StoreVerificationError
    )
    expect(() => stateOfGoogle('tok', {}, now)).toThrow(
      'not an ingre subscription'
    )
    expect(() =>
      stateOfGoogle('tok', { lineItems: [{ productId: 'coins' }, 3] }, now)
    ).toThrow('not an ingre subscription')
  })
})

describe('GooglePlay', () => {
  const setup = () => {
    const fake = fakeStores(keys.publicKey)
    const config = googleConfig(env)
    if (config === null) throw new Error('config')
    let clock = now
    const play = new GooglePlay(config, fake.fetch, () => clock)
    return { fake, play, tick: (ms: number) => (clock += ms) }
  }

  test('verifies a purchase, then acknowledges it on the server', async () => {
    const { fake, play } = setup()
    fake.google.set('tok-1', purchase())
    await expect(play.verify('tok-1')).resolves.toMatchObject({
      tier: 'MANAGER',
      status: 'active',
      accountUserId: USER
    })
    expect(fake.requests.map((r) => `${r.method} ${r.url}`)).toEqual([
      'POST https://oauth2.googleapis.com/token',
      `GET https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE}/purchases/subscriptionsv2/tokens/tok-1`,
      `POST https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE}/purchases/subscriptions/ingre_manager_monthly/tokens/tok-1:acknowledge`
    ])
    expect(fake.requests[1]?.headers['authorization']).toBe('Bearer ya29.test')
    const grant = new URLSearchParams(fake.requests[0]?.body ?? '')
    expect(grant.get('grant_type')).toBe(
      'urn:ietf:params:oauth:grant-type:jwt-bearer'
    )
    const claims = JSON.parse(
      Buffer.from(
        grant.get('assertion')?.split('.')[1] ?? '',
        'base64url'
      ).toString()
    ) as Record<string, unknown>
    expect(claims).toMatchObject({
      iss: keys.serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token'
    })
  })

  test('does not acknowledge twice, or a purchase that is not paid for', async () => {
    const { fake, play } = setup()
    fake.google.set(
      'acked',
      purchase({ acknowledgementState: 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED' })
    )
    fake.google.set(
      'pending',
      purchase({ subscriptionState: 'SUBSCRIPTION_STATE_PENDING' })
    )
    await play.verify('acked')
    await play.verify('pending')
    expect(
      fake.requests.filter((r) => r.url.endsWith(':acknowledge'))
    ).toHaveLength(0)
  })

  test('reuses the access token until shortly before it expires', async () => {
    const { fake, play, tick } = setup()
    fake.google.set(
      't',
      purchase({ acknowledgementState: 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED' })
    )
    await play.verify('t')
    await play.verify('t')
    tick(3600 * 1000)
    await play.verify('t')
    expect(fake.requests.filter((r) => r.url.includes('oauth2'))).toHaveLength(
      2
    )
  })

  test('an unknown token is refused; an outage is an error', async () => {
    const { fake, play } = setup()
    await expect(play.verify('nope')).rejects.toThrow(
      'Google Play does not know this purchase'
    )
    fake.google.set('t', purchase())
    await play.accessToken()
    fake.failNext(503)
    await expect(play.verify('t')).rejects.toThrow('Google Play API 503')
    // the acknowledgement fails
    const failing = setup()
    failing.fake.google.set('t', purchase())
    await failing.play.accessToken()
    const original = failing.fake.fetch
    const play2 = new GooglePlay(
      failing.play.config,
      (async (url, init) =>
        String(url).endsWith(':acknowledge')
          ? new Response('', { status: 500 })
          : original(url, init)) as typeof fetch,
      () => now
    )
    await expect(play2.verify('t')).rejects.toThrow(
      'Google Play acknowledge 500'
    )
  })

  test('a refused service account is an error', async () => {
    const other = googleKeys()
    const fake = fakeStores(other.publicKey)
    const config = googleConfig(env)
    if (config === null) throw new Error('config')
    await expect(
      new GooglePlay(config, fake.fetch).accessToken()
    ).rejects.toThrow('Google refused the service account')
  })

  test('a token response without expiry lasts an hour', async () => {
    const config = googleConfig(env)
    if (config === null) throw new Error('config')
    let calls = 0
    const fetchImpl = (async () => {
      calls += 1
      return new Response(JSON.stringify({ access_token: 'a' }), {
        status: 200
      })
    }) as typeof fetch
    const play = new GooglePlay(config, fetchImpl, () => now)
    await play.accessToken()
    await play.accessToken()
    expect(calls).toBe(1)
  })

  describe('tokenOfNotification', () => {
    const { play } = setup()
    const push = (notice: unknown) => ({
      message: {
        data: Buffer.from(JSON.stringify(notice)).toString('base64'),
        messageId: '1'
      },
      subscription: 'projects/ingre/subscriptions/play'
    })
    test('gives the purchase token of a subscription notice for this app', () => {
      expect(
        play.tokenOfNotification(
          push({
            version: '1.0',
            packageName: PACKAGE,
            subscriptionNotification: {
              notificationType: 4,
              purchaseToken: 'tok-9',
              subscriptionId: 'ingre_explorer_monthly'
            }
          })
        )
      ).toBe('tok-9')
    })
    test('ignores test notices, other apps and junk', () => {
      expect(
        play.tokenOfNotification(
          push({ packageName: PACKAGE, testNotification: {} })
        )
      ).toBeNull()
      expect(
        play.tokenOfNotification(
          push({
            packageName: 'other.app',
            subscriptionNotification: { purchaseToken: 'x' }
          })
        )
      ).toBeNull()
      expect(
        play.tokenOfNotification({
          message: { data: Buffer.from('{').toString('base64') }
        })
      ).toBeNull()
      expect(play.tokenOfNotification({ message: {} })).toBeNull()
      expect(play.tokenOfNotification({})).toBeNull()
      expect(play.tokenOfNotification(null)).toBeNull()
    })
  })
})
