/*
 * #314: verifies Apple's signed data (JWS, ES256) without any SDK: the x5c chain in the
 * header must end at a pinned root (Apple Root CA - G3), each certificate must be signed by
 * the next and be valid at the signing time, the leaf and intermediate must carry Apple's
 * App Store receipt-signing markers, and the leaf must have signed the token.
 */
import { X509Certificate, verify } from 'node:crypto'
import { APPLE_ROOT_CA_G3 } from './appleRoot'

export class JwsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'JwsError'
  }
}

/** OID 1.2.840.113635.100.6.11.1 (App Store receipt signing leaf), DER encoded. */
const LEAF_MARKER = Buffer.from('060a2a864886f76364060b01', 'hex')
/** OID 1.2.840.113635.100.6.2.1 (Apple Worldwide Developer Relations intermediate). */
const INTERMEDIATE_MARKER = Buffer.from('060a2a864886f76364060201', 'hex')

const fromBase64Url = (part: string): Buffer => Buffer.from(part, 'base64url')

const parseJson = (buffer: Buffer): unknown => {
  try {
    return JSON.parse(buffer.toString('utf8'))
  } catch {
    throw new JwsError('not JSON')
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** The payload's own signing time (ms), when it has one. */
const signedAt = (payload: Record<string, unknown>): number | null => {
  const value = payload['signedDate']
  return typeof value === 'number' ? value : null
}

const validAt = (cert: X509Certificate, when: number) =>
  Date.parse(cert.validFrom) <= when && when <= Date.parse(cert.validTo)

export interface VerifyOptions {
  /** PEM roots to trust; Apple Root CA - G3 by default (tests pass their own). */
  readonly roots?: ReadonlyArray<string>
  /** "now" in ms, for tests */
  readonly now?: number
}

/** The verified payload of an Apple JWS; throws JwsError on anything else. */
export const verifyAppleJws = (
  token: string,
  { roots = [APPLE_ROOT_CA_G3], now = Date.now() }: VerifyOptions = {}
): Record<string, unknown> => {
  const parts = token.split('.')
  if (parts.length !== 3) throw new JwsError('not a JWS')
  const [headerPart = '', payloadPart = '', signaturePart = ''] = parts
  const header = parseJson(fromBase64Url(headerPart))
  if (!isRecord(header) || header['alg'] !== 'ES256')
    throw new JwsError('not ES256')
  const x5c = header['x5c']
  if (
    !Array.isArray(x5c) ||
    x5c.length !== 3 ||
    !x5c.every((c): c is string => typeof c === 'string')
  )
    throw new JwsError('x5c must hold leaf, intermediate and root')

  let chain: X509Certificate[]
  try {
    chain = x5c.map((c) => new X509Certificate(Buffer.from(c, 'base64')))
  } catch {
    throw new JwsError('bad certificate')
  }
  const [leaf, intermediate, root] = chain as [
    X509Certificate,
    X509Certificate,
    X509Certificate
  ]
  const trusted = roots.map((pem) => new X509Certificate(pem))
  if (!trusted.some((t) => t.fingerprint256 === root.fingerprint256))
    throw new JwsError('untrusted root')
  if (!leaf.raw.includes(LEAF_MARKER))
    throw new JwsError('leaf is not an App Store signing certificate')
  if (!intermediate.raw.includes(INTERMEDIATE_MARKER))
    throw new JwsError('intermediate is not Apple WWDR')
  if (
    !leaf.checkIssued(intermediate) ||
    !leaf.verify(intermediate.publicKey) ||
    !intermediate.checkIssued(root) ||
    !intermediate.verify(root.publicKey) ||
    !root.verify(root.publicKey)
  )
    throw new JwsError('broken chain')

  const ok = verify(
    'sha256',
    Buffer.from(`${headerPart}.${payloadPart}`),
    { key: leaf.publicKey, dsaEncoding: 'ieee-p1363' },
    fromBase64Url(signaturePart)
  )
  if (!ok) throw new JwsError('bad signature')

  const payload = parseJson(fromBase64Url(payloadPart))
  if (!isRecord(payload)) throw new JwsError('payload is not an object')
  const when = signedAt(payload) ?? now
  if (!chain.every((cert) => validAt(cert, when)))
    throw new JwsError('certificate expired')
  return payload
}
