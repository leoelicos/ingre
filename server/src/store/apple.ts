/*
 * #314: App Store subscriptions. The app sends StoreKit 2's signed transaction (JWS); it is
 * verified against Apple's root (jws.ts), then the subscription's current status is read
 * from the App Store Server API with the in-app purchase key, so a replayed old
 * transaction can't turn a lapsed subscription back on.
 */
import { createPrivateKey, sign } from 'node:crypto'
import { StoreVerificationError } from '../errors'
import {
  tierOfProductId,
  userIdOfAppAccountToken,
  type Env,
  type StoreState
} from './common'
import { JwsError, verifyAppleJws, type VerifyOptions } from './jws'

const HOSTS = {
  Production: 'https://api.storekit.itunes.apple.com',
  Sandbox: 'https://api.storekit-sandbox.itunes.apple.com'
} as const

type Environment = keyof typeof HOSTS

export interface AppleConfig {
  readonly bundleId: string
  readonly keyId: string
  readonly issuerId: string
  readonly privateKey: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const str = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null

/** A .p8 key pasted with real newlines, escaped \n, or base64 encoded. */
const pem = (raw: string): string => {
  const unescaped = raw.replace(/\\n/g, '\n')
  if (unescaped.includes('BEGIN')) return unescaped
  return Buffer.from(raw, 'base64').toString('utf8')
}

/**
 * APPLE_BUNDLE_ID, APPLE_IAP_KEY_ID, APPLE_IAP_ISSUER_ID and APPLE_IAP_PRIVATE_KEY (the
 * .p8 In-App Purchase key); null (feature off) unless all four are set.
 */
export const appleConfig = (env: Env): AppleConfig | null => {
  const bundleId = env['APPLE_BUNDLE_ID']
  const keyId = env['APPLE_IAP_KEY_ID']
  const issuerId = env['APPLE_IAP_ISSUER_ID']
  const privateKey = env['APPLE_IAP_PRIVATE_KEY']
  if (!bundleId || !keyId || !issuerId || !privateKey) return null
  return { bundleId, keyId, issuerId, privateKey: pem(privateKey) }
}

/** App Store Server API status codes in Stripe's words (see common.ts). */
export const statusOfApple = (code: unknown): string => {
  switch (code) {
    case 1: // active
    case 4: // billing grace period: Apple says keep access
      return 'active'
    case 3: // billing retry
      return 'past_due'
    case 2: // expired
    case 5: // revoked (refunded, or Family Sharing removed)
      return 'canceled'
    default:
      return 'incomplete'
  }
}

const environmentOf = (payload: Record<string, unknown>): Environment => {
  const value = payload['environment']
  if (value === 'Production' || value === 'Sandbox') return value
  // Xcode's local StoreKit testing signs with a local certificate: never trusted here
  throw new StoreVerificationError('not an App Store transaction')
}

type Fetch = typeof fetch

export class AppleStore {
  constructor(
    readonly config: AppleConfig,
    private readonly fetchImpl: Fetch = fetch,
    private readonly jws: VerifyOptions = {},
    private readonly now: () => number = Date.now
  ) {}

  /** A verified JWS payload, or StoreVerificationError. */
  private verified(token: string): Record<string, unknown> {
    try {
      return verifyAppleJws(token, { ...this.jws, now: this.now() })
    } catch (error) {
      if (error instanceof JwsError)
        throw new StoreVerificationError(`Apple signature: ${error.message}`)
      throw error
    }
  }

  /** The ES256 bearer token the App Store Server API wants (5 minutes). */
  apiToken(): string {
    const iat = Math.floor(this.now() / 1000)
    const part = (value: unknown) =>
      Buffer.from(JSON.stringify(value)).toString('base64url')
    const unsigned = `${part({ alg: 'ES256', kid: this.config.keyId, typ: 'JWT' })}.${part(
      {
        iss: this.config.issuerId,
        iat,
        exp: iat + 300,
        aud: 'appstoreconnect-v1',
        bid: this.config.bundleId
      }
    )}`
    const signature = sign('sha256', Buffer.from(unsigned), {
      key: createPrivateKey(this.config.privateKey),
      dsaEncoding: 'ieee-p1363'
    }).toString('base64url')
    return `${unsigned}.${signature}`
  }

  /** A signed transaction for this app and one of our products. */
  private transaction(token: string): Record<string, unknown> {
    const payload = this.verified(token)
    if (payload['bundleId'] !== this.config.bundleId)
      throw new StoreVerificationError('transaction is for another app')
    if (tierOfProductId(str(payload['productId'])) === null)
      throw new StoreVerificationError('not an ingre subscription')
    return payload
  }

  /** The subscription's current state from the App Store Server API. */
  async status(
    originalTransactionId: string,
    environment: Environment
  ): Promise<StoreState> {
    const response = await this.fetchImpl(
      `${HOSTS[environment]}/inApps/v1/subscriptions/${encodeURIComponent(originalTransactionId)}`,
      { headers: { authorization: `Bearer ${this.apiToken()}` } }
    )
    if (response.status >= 400 && response.status < 500)
      throw new StoreVerificationError(
        'the App Store does not know this subscription'
      )
    if (!response.ok) throw new Error(`App Store Server API ${response.status}`)
    const body = (await response.json()) as unknown
    const groups =
      isRecord(body) && Array.isArray(body['data']) ? body['data'] : []
    const last = groups
      .filter(isRecord)
      .flatMap((g) =>
        Array.isArray(g['lastTransactions']) ? g['lastTransactions'] : []
      )
      .filter(isRecord)
      .find((t) => t['originalTransactionId'] === originalTransactionId)
    const signed = str(last?.['signedTransactionInfo'])
    if (last === undefined || signed === null)
      throw new StoreVerificationError(
        'the App Store does not know this subscription'
      )
    const transaction = this.transaction(signed)
    const productId = str(transaction['productId']) ?? ''
    const expires = transaction['expiresDate']
    return {
      platform: 'APPLE',
      productId,
      tier: tierOfProductId(productId),
      status:
        transaction['revocationDate'] === undefined
          ? statusOfApple(last['status'])
          : 'canceled',
      expiresAt: typeof expires === 'number' ? new Date(expires) : null,
      storeId: originalTransactionId,
      replacesStoreId: null,
      accountUserId: userIdOfAppAccountToken(
        str(transaction['appAccountToken'])
      )
    }
  }

  /** Checks a StoreKit 2 signed transaction (Transaction.jwsRepresentation). */
  async verify(signedTransaction: string): Promise<StoreState> {
    const transaction = this.transaction(signedTransaction)
    const original = str(transaction['originalTransactionId'])
    if (original === null)
      throw new StoreVerificationError('no original transaction id')
    const state = await this.status(original, environmentOf(transaction))
    // the app's token travels on the first transaction; keep it when the latest lacks it
    const accountUserId =
      state.accountUserId ??
      userIdOfAppAccountToken(str(transaction['appAccountToken']))
    return { ...state, accountUserId }
  }

  /**
   * An App Store Server Notification V2 (`{ signedPayload }`): verified, then the
   * subscription's state re-read from Apple. Null for TEST notices and other apps.
   */
  async fromNotification(body: unknown): Promise<StoreState | null> {
    const signedPayload = isRecord(body) ? str(body['signedPayload']) : null
    if (signedPayload === null)
      throw new StoreVerificationError('no signedPayload')
    const notice = this.verified(signedPayload)
    const data = isRecord(notice['data']) ? notice['data'] : null
    if (data === null || data['bundleId'] !== this.config.bundleId) return null
    const signed = str(data['signedTransactionInfo'])
    if (signed === null) return null
    return this.verify(signed)
  }
}
