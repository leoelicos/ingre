/*
 * #314: a stand-in for Apple's signing chain (root, WWDR intermediate, App Store leaf),
 * made fresh in memory for each test run: a tiny DER writer builds the certificates and
 * node:crypto signs them, so no keys are committed and no Apple service is called.
 */
import {
  generateKeyPairSync,
  sign,
  X509Certificate,
  type KeyObject
} from 'node:crypto'

const len = (n: number): Buffer => {
  if (n < 0x80) return Buffer.from([n])
  const bytes: number[] = []
  for (let v = n; v > 0; v >>= 8) bytes.unshift(v & 0xff)
  return Buffer.from([0x80 | bytes.length, ...bytes])
}
const tlv = (tag: number, body: Buffer) =>
  Buffer.concat([Buffer.from([tag]), len(body.length), body])
const seq = (...parts: Buffer[]) => tlv(0x30, Buffer.concat(parts))
const set = (...parts: Buffer[]) => tlv(0x31, Buffer.concat(parts))
const int = (n: number) => tlv(0x02, Buffer.from([n]))
const oid = (dotted: string) => {
  const [a = 0, b = 0, ...rest] = dotted.split('.').map(Number)
  const bytes = [a * 40 + b]
  for (const part of rest) {
    const chunk: number[] = []
    let v = part
    do {
      chunk.unshift(v & 0x7f)
      v = Math.floor(v / 128)
    } while (v > 0)
    for (let i = 0; i < chunk.length - 1; i += 1)
      chunk[i] = (chunk[i] ?? 0) | 0x80
    bytes.push(...chunk)
  }
  return tlv(0x06, Buffer.from(bytes))
}
const utf8 = (s: string) => tlv(0x0c, Buffer.from(s))
const time = (d: Date) =>
  tlv(
    0x18,
    Buffer.from(`${d.toISOString().replace(/[-:T]/g, '').slice(0, 14)}Z`)
  )
const name = (cn: string) => seq(set(seq(oid('2.5.4.3'), utf8(cn))))
const explicit = (n: number, body: Buffer) => tlv(0xa0 + n, body)
const ECDSA_SHA256 = seq(oid('1.2.840.10045.4.3.2'))

export const LEAF_OID = '1.2.840.113635.100.6.11.1'
export const INTERMEDIATE_OID = '1.2.840.113635.100.6.2.1'

export interface CertOptions {
  readonly subject: string
  readonly issuer: string
  readonly publicKey: KeyObject
  readonly signer: KeyObject
  readonly ca: boolean
  readonly markers?: ReadonlyArray<string>
  readonly notBefore?: Date
  readonly notAfter?: Date
  readonly serial?: number
}

/** One DER certificate. */
export const makeCert = ({
  subject,
  issuer,
  publicKey,
  signer,
  ca,
  markers = [],
  notBefore = new Date('2020-01-01T00:00:00Z'),
  notAfter = new Date('2040-01-01T00:00:00Z'),
  serial = 1
}: CertOptions): Buffer => {
  const extensions = [
    seq(
      oid('2.5.29.19'),
      tlv(0x01, Buffer.from([0xff])),
      tlv(0x04, seq(...(ca ? [tlv(0x01, Buffer.from([0xff]))] : [])))
    ),
    ...markers.map((m) => seq(oid(m), tlv(0x04, Buffer.from([0x05, 0x00]))))
  ]
  const tbs = seq(
    explicit(0, int(2)),
    int(serial),
    ECDSA_SHA256,
    name(issuer),
    seq(time(notBefore), time(notAfter)),
    name(subject),
    publicKey.export({ type: 'spki', format: 'der' }),
    explicit(3, seq(...extensions))
  )
  const signature = sign('sha256', tbs, signer)
  return seq(
    tbs,
    ECDSA_SHA256,
    tlv(0x03, Buffer.concat([Buffer.from([0]), signature]))
  )
}

const ec = () => generateKeyPairSync('ec', { namedCurve: 'prime256v1' })

export interface AppleChain {
  /** trust this instead of Apple Root CA - G3 */
  readonly rootPem: string
  /** x5c for a JWS header: leaf, intermediate, root (base64 DER) */
  readonly x5c: ReadonlyArray<string>
  readonly leafKey: KeyObject
}

export const appleChain = (
  overrides: {
    leaf?: Partial<CertOptions>
    intermediate?: Partial<CertOptions>
  } = {}
): AppleChain => {
  const root = ec()
  const intermediate = ec()
  const leaf = ec()
  const rootDer = makeCert({
    subject: 'Test Root CA',
    issuer: 'Test Root CA',
    publicKey: root.publicKey,
    signer: root.privateKey,
    ca: true
  })
  const intermediateDer = makeCert({
    subject: 'Test WWDR',
    issuer: 'Test Root CA',
    publicKey: intermediate.publicKey,
    signer: root.privateKey,
    ca: true,
    markers: [INTERMEDIATE_OID],
    serial: 2,
    ...overrides.intermediate
  })
  const leafDer = makeCert({
    subject: 'Test App Store Signing',
    issuer: 'Test WWDR',
    publicKey: leaf.publicKey,
    signer: intermediate.privateKey,
    ca: false,
    markers: [LEAF_OID],
    serial: 3,
    ...overrides.leaf
  })
  return {
    rootPem: new X509Certificate(rootDer).toString(),
    x5c: [leafDer, intermediateDer, rootDer].map((d) => d.toString('base64')),
    leafKey: leaf.privateKey
  }
}

const part = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

/** An Apple-style JWS (ES256, x5c) over `payload`, signed by the chain's leaf. */
export const signJws = (
  chain: AppleChain,
  payload: unknown,
  header: Record<string, unknown> = {}
): string => {
  const unsigned = `${part({ alg: 'ES256', x5c: chain.x5c, ...header })}.${part(payload)}`
  const signature = sign('sha256', Buffer.from(unsigned), {
    key: chain.leafKey,
    dsaEncoding: 'ieee-p1363'
  }).toString('base64url')
  return `${unsigned}.${signature}`
}
