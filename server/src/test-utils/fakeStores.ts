/*
 * #314: stand-ins for Google's OAuth + Play Developer API and Apple's App Store Server API,
 * as a fetch function. Each test sets what the store "knows"; every request is recorded.
 */
import { generateKeyPairSync, verify } from 'node:crypto'
import { appleChain, signJws, type AppleChain } from './appleChain'

export interface Recorded {
  readonly url: string
  readonly method: string
  readonly headers: Record<string, string>
  readonly body: string
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  })

export const PACKAGE = 'com.leoelicos.ingre'
export const BUNDLE = 'app.ingre'

export const googleKeys = () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048
  })
  return {
    publicKey,
    serviceAccount: {
      type: 'service_account',
      client_email: 'ingre-play@ingre.iam.gserviceaccount.com',
      private_key: privateKey
        .export({ type: 'pkcs8', format: 'pem' })
        .toString(),
      token_uri: 'https://oauth2.googleapis.com/token'
    }
  }
}

export const appleKey = () =>
  generateKeyPairSync('ec', { namedCurve: 'prime256v1' })

export interface FakeStores {
  readonly fetch: typeof fetch
  readonly requests: Recorded[]
  /** purchase token -> SubscriptionPurchaseV2 */
  readonly google: Map<string, unknown>
  /** originalTransactionId -> { status, transaction payload } */
  readonly apple: Map<
    string,
    { status: number; transaction: Record<string, unknown> }
  >
  readonly chain: AppleChain
  /** next responses with this HTTP status (for outages) */
  failNext(status: number, times?: number): void
}

export const fakeStores = (
  googlePublicKey?: ReturnType<typeof googleKeys>['publicKey']
): FakeStores => {
  const requests: Recorded[] = []
  const google = new Map<string, unknown>()
  const apple = new Map<
    string,
    { status: number; transaction: Record<string, unknown> }
  >()
  const chain = appleChain()
  let failures: number[] = []

  const handle = (r: Recorded): Response => {
    const failure = failures.shift()
    if (failure !== undefined) return json(failure, { error: 'down' })
    if (r.url === 'https://oauth2.googleapis.com/token') {
      const assertion = new URLSearchParams(r.body).get('assertion') ?? ''
      const [h = '', p = '', s = ''] = assertion.split('.')
      const ok =
        googlePublicKey === undefined ||
        verify(
          'sha256',
          Buffer.from(`${h}.${p}`),
          googlePublicKey,
          Buffer.from(s, 'base64url')
        )
      return ok
        ? json(200, { access_token: 'ya29.test', expires_in: 3599 })
        : json(400, { error: 'invalid_grant' })
    }
    const sub = r.url.match(
      /androidpublisher\/v3\/applications\/([^/]+)\/purchases\/subscriptionsv2\/tokens\/(.+)$/
    )
    if (sub) {
      const found = google.get(decodeURIComponent(sub[2] ?? ''))
      return found === undefined || sub[1] !== PACKAGE
        ? json(404, { error: { code: 404 } })
        : json(200, found)
    }
    const ack = r.url.match(
      /purchases\/subscriptions\/([^/]+)\/tokens\/(.+):acknowledge$/
    )
    if (ack) {
      const token = decodeURIComponent(ack[2] ?? '')
      const found = google.get(token)
      if (found === undefined) return json(404, {})
      google.set(token, {
        ...(found as object),
        acknowledgementState: 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED'
      })
      return new Response('', { status: 200 })
    }
    const status = r.url.match(/\/inApps\/v1\/subscriptions\/(.+)$/)
    if (status) {
      const id = decodeURIComponent(status[1] ?? '')
      const found = apple.get(id)
      if (found === undefined) return json(404, { errorCode: 4040010 })
      return json(200, {
        environment: r.url.includes('sandbox') ? 'Sandbox' : 'Production',
        bundleId: BUNDLE,
        data: [
          {
            subscriptionGroupIdentifier: '21500000',
            lastTransactions: [
              {
                originalTransactionId: id,
                status: found.status,
                signedTransactionInfo: signJws(chain, found.transaction),
                signedRenewalInfo: signJws(chain, { originalTransactionId: id })
              }
            ]
          }
        ]
      })
    }
    return json(404, { error: 'unknown route' })
  }

  const fetchImpl = (async (
    input: string | URL | Request,
    init?: RequestInit
  ) => {
    const headers: Record<string, string> = {}
    new Headers(init?.headers).forEach((v, k) => (headers[k] = v))
    const recorded = {
      url: String(input),
      method: init?.method ?? 'GET',
      headers,
      body: typeof init?.body === 'string' ? init.body : ''
    }
    requests.push(recorded)
    return handle(recorded)
  }) as typeof fetch

  return {
    fetch: fetchImpl,
    requests,
    google,
    apple,
    chain,
    failNext: (status, times = 1) => {
      failures = Array.from({ length: times }, () => status)
    }
  }
}
