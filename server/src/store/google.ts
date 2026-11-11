/*
 * #314: Google Play subscriptions, checked with the Play Developer API
 * (purchases.subscriptionsv2.get) using a service account. No Google SDK: the OAuth
 * service-account JWT is signed with node:crypto and the API is called with fetch.
 */
import { createPrivateKey, sign } from 'node:crypto'
import { StoreVerificationError } from '../errors'
import {
  tierOfProductId,
  userIdOfAccountId,
  type Env,
  type StoreState
} from './common'

const SCOPE = 'https://www.googleapis.com/auth/androidpublisher'
const API = 'https://androidpublisher.googleapis.com/androidpublisher/v3'
const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token'

export interface GoogleConfig {
  readonly packageName: string
  readonly clientEmail: string
  readonly privateKey: string
  readonly tokenUri: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const str = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null

/** The service account JSON, as is or base64 encoded (easier to paste into Render). */
const parseServiceAccount = (raw: string): Record<string, unknown> | null => {
  for (const text of [raw, Buffer.from(raw, 'base64').toString('utf8')]) {
    try {
      const parsed = JSON.parse(text) as unknown
      if (isRecord(parsed)) return parsed
    } catch {
      // try the next form
    }
  }
  return null
}

/**
 * GOOGLE_PLAY_PACKAGE_NAME and GOOGLE_PLAY_SERVICE_ACCOUNT_JSON; null (feature off) when
 * either is missing or the JSON has no client_email / private_key.
 */
export const googleConfig = (env: Env): GoogleConfig | null => {
  const packageName = env['GOOGLE_PLAY_PACKAGE_NAME']
  const raw = env['GOOGLE_PLAY_SERVICE_ACCOUNT_JSON']
  if (!packageName || !raw) return null
  const account = parseServiceAccount(raw)
  const clientEmail = str(account?.['client_email'])
  const privateKey = str(account?.['private_key'])
  if (clientEmail === null || privateKey === null) return null
  return {
    packageName,
    clientEmail,
    privateKey,
    tokenUri: str(account?.['token_uri']) ?? DEFAULT_TOKEN_URI
  }
}

const b64url = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

/** subscriptionsv2 states in Stripe's words (see common.ts). */
export const statusOfGoogle = (
  state: string | null,
  expiresAt: Date | null,
  now: number
): string => {
  switch (state) {
    case 'SUBSCRIPTION_STATE_ACTIVE':
    case 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD':
      return 'active'
    case 'SUBSCRIPTION_STATE_ON_HOLD':
    case 'SUBSCRIPTION_STATE_PAUSED':
      return 'past_due'
    // cancelled but paid up: the tier stays until the period ends
    case 'SUBSCRIPTION_STATE_CANCELED':
      return expiresAt !== null && expiresAt.getTime() > now
        ? 'active'
        : 'canceled'
    case 'SUBSCRIPTION_STATE_EXPIRED':
      return 'canceled'
    case 'SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED':
      return 'incomplete_expired'
    default:
      return 'incomplete'
  }
}

/** A SubscriptionPurchaseV2 as a StoreState; throws when it isn't one of our products. */
export const stateOfGoogle = (
  purchaseToken: string,
  body: unknown,
  now: number
): StoreState => {
  if (!isRecord(body)) throw new StoreVerificationError('no subscription')
  const items = Array.isArray(body['lineItems']) ? body['lineItems'] : []
  const item = items
    .filter(isRecord)
    .find((line) => tierOfProductId(str(line['productId'])) !== null)
  if (item === undefined)
    throw new StoreVerificationError('not an ingre subscription')
  const productId = str(item['productId']) ?? ''
  const expiry = str(item['expiryTime'])
  const expiresAt = expiry === null ? null : new Date(expiry)
  const ids = isRecord(body['externalAccountIdentifiers'])
    ? body['externalAccountIdentifiers']
    : {}
  return {
    platform: 'GOOGLE',
    productId,
    tier: tierOfProductId(productId),
    status: statusOfGoogle(str(body['subscriptionState']), expiresAt, now),
    expiresAt,
    storeId: purchaseToken,
    replacesStoreId: str(body['linkedPurchaseToken']),
    accountUserId: userIdOfAccountId(str(ids['obfuscatedExternalAccountId']))
  }
}

type Fetch = typeof fetch

export class GooglePlay {
  private cached: { token: string; until: number } | null = null
  constructor(
    readonly config: GoogleConfig,
    private readonly fetchImpl: Fetch = fetch,
    private readonly now: () => number = Date.now
  ) {}

  /** An OAuth access token for the service account (cached until a minute before expiry). */
  async accessToken(): Promise<string> {
    const now = this.now()
    if (this.cached !== null && this.cached.until > now)
      return this.cached.token
    const iat = Math.floor(now / 1000)
    const unsigned = `${b64url({ alg: 'RS256', typ: 'JWT' })}.${b64url({
      iss: this.config.clientEmail,
      scope: SCOPE,
      aud: this.config.tokenUri,
      iat,
      exp: iat + 3600
    })}`
    const signature = sign(
      'sha256',
      Buffer.from(unsigned),
      createPrivateKey(this.config.privateKey)
    ).toString('base64url')
    const response = await this.fetchImpl(this.config.tokenUri, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${unsigned}.${signature}`
      }).toString()
    })
    const body = (await response.json()) as unknown
    const token = isRecord(body) ? str(body['access_token']) : null
    if (!response.ok || token === null)
      throw new Error('Google refused the service account')
    const expiresIn = isRecord(body) ? Number(body['expires_in']) || 3600 : 3600
    this.cached = { token, until: now + (expiresIn - 60) * 1000 }
    return token
  }

  private async call(path: string, method: 'GET' | 'POST') {
    const response = await this.fetchImpl(
      `${API}/applications/${encodeURIComponent(this.config.packageName)}${path}`,
      {
        method,
        headers: { authorization: `Bearer ${await this.accessToken()}` }
      }
    )
    return response
  }

  /** purchases.subscriptionsv2.get; a 4xx means Google doesn't know the token. */
  async getSubscription(purchaseToken: string): Promise<unknown> {
    const response = await this.call(
      `/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`,
      'GET'
    )
    if (response.status >= 400 && response.status < 500)
      throw new StoreVerificationError(
        'Google Play does not know this purchase'
      )
    if (!response.ok) throw new Error(`Google Play API ${response.status}`)
    return (await response.json()) as unknown
  }

  /** purchases.subscriptions.acknowledge, in case the app couldn't (3 days or it's refunded). */
  async acknowledge(productId: string, purchaseToken: string): Promise<void> {
    const response = await this.call(
      `/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`,
      'POST'
    )
    if (!response.ok)
      throw new Error(`Google Play acknowledge ${response.status}`)
  }

  /** Checks a purchase token with Google and acknowledges it once it is paid for. */
  async verify(purchaseToken: string): Promise<StoreState> {
    const body = await this.getSubscription(purchaseToken)
    const state = stateOfGoogle(purchaseToken, body, this.now())
    if (
      isRecord(body) &&
      body['acknowledgementState'] === 'ACKNOWLEDGEMENT_STATE_PENDING' &&
      state.status === 'active'
    )
      await this.acknowledge(state.productId, purchaseToken)
    return state
  }

  /**
   * The purchase token in a Real-time developer notification (Pub/Sub push body), or null
   * for test notifications, other apps and anything that isn't a subscription notice.
   */
  tokenOfNotification(body: unknown): string | null {
    const message =
      isRecord(body) && isRecord(body['message']) ? body['message'] : null
    const data = str(message?.['data'])
    if (data === null) return null
    let notice: unknown
    try {
      notice = JSON.parse(Buffer.from(data, 'base64').toString('utf8'))
    } catch {
      return null
    }
    if (!isRecord(notice) || notice['packageName'] !== this.config.packageName)
      return null
    const sub = isRecord(notice['subscriptionNotification'])
      ? notice['subscriptionNotification']
      : null
    return str(sub?.['purchaseToken'])
  }
}
