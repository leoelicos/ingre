import { X509Certificate, generateKeyPairSync } from 'node:crypto'
import { APPLE_ROOT_CA_G3, APPLE_ROOT_CA_G3_SHA256 } from './appleRoot'
import { JwsError, verifyAppleJws } from './jws'
import { appleChain, makeCert, signJws } from '../test-utils/appleChain'

/* #314: Apple's signed transactions are only believed when the chain ends at the pinned root. */

const chain = appleChain()
const roots = [chain.rootPem]
const now = Date.parse('2026-11-11T00:00:00Z')
const b64 = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url')

const fails = (token: string, message: string, options = { roots, now }) =>
  expect(() => verifyAppleJws(token, options)).toThrow(new JwsError(message))

test('the pinned root is Apple Root CA - G3', () => {
  const root = new X509Certificate(APPLE_ROOT_CA_G3)
  expect(root.fingerprint256).toBe(APPLE_ROOT_CA_G3_SHA256)
  expect(root.subject).toContain('Apple Root CA - G3')
})

test('a token signed down a trusted chain gives its payload', () => {
  const payload = { productId: 'ingre_manager_monthly', signedDate: now }
  expect(verifyAppleJws(signJws(chain, payload), { roots, now })).toEqual(
    payload
  )
})

test('without a signedDate the chain is checked at "now"', () => {
  expect(verifyAppleJws(signJws(chain, { a: 1 }), { roots, now })).toEqual({
    a: 1
  })
  expect(verifyAppleJws(signJws(chain, { a: 1 }), { roots })).toEqual({ a: 1 })
})

test('by default only the Apple root is trusted', () => {
  expect(() => verifyAppleJws(signJws(chain, {}))).toThrow('untrusted root')
})

test('shape problems are refused', () => {
  fails('a.b', 'not a JWS')
  fails(`${b64({ alg: 'HS256' })}.${b64({})}.x`, 'not ES256')
  fails(`${Buffer.from('nope').toString('base64url')}.x.y`, 'not JSON')
  fails(`${b64([1])}.x.y`, 'not ES256')
  fails(
    `${b64({ alg: 'ES256' })}.x.y`,
    'x5c must hold leaf, intermediate and root'
  )
  fails(
    `${b64({ alg: 'ES256', x5c: ['a', 'b'] })}.x.y`,
    'x5c must hold leaf, intermediate and root'
  )
  fails(
    `${b64({ alg: 'ES256', x5c: ['a', 'b', 3] })}.x.y`,
    'x5c must hold leaf, intermediate and root'
  )
  fails(`${b64({ alg: 'ES256', x5c: ['a', 'b', 'c'] })}.x.y`, 'bad certificate')
})

test('another root is untrusted', () => {
  fails(signJws(appleChain(), {}), 'untrusted root')
})

test('the leaf and intermediate need their Apple markers', () => {
  const noLeafMarker = appleChain({ leaf: { markers: [] } })
  fails(
    signJws(noLeafMarker, {}),
    'leaf is not an App Store signing certificate',
    {
      roots: [noLeafMarker.rootPem],
      now
    }
  )
  const noWwdr = appleChain({ intermediate: { markers: [] } })
  fails(signJws(noWwdr, {}), 'intermediate is not Apple WWDR', {
    roots: [noWwdr.rootPem],
    now
  })
})

test('a leaf from another intermediate breaks the chain', () => {
  const other = appleChain()
  const mixed = {
    ...chain,
    x5c: [other.x5c[0] ?? '', chain.x5c[1] ?? '', chain.x5c[2] ?? '']
  }
  fails(signJws({ ...mixed, leafKey: other.leafKey }, {}), 'broken chain')
})

test('a leaf signed by a stranger key with the right names breaks the chain', () => {
  const stranger = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
  const leaf = makeCert({
    subject: 'Test App Store Signing',
    issuer: 'Test WWDR',
    publicKey: stranger.publicKey,
    signer: stranger.privateKey,
    ca: false,
    markers: ['1.2.840.113635.100.6.11.1']
  })
  const forged = {
    ...chain,
    x5c: [leaf.toString('base64'), chain.x5c[1] ?? '', chain.x5c[2] ?? ''],
    leafKey: stranger.privateKey
  }
  fails(signJws(forged, {}), 'broken chain')
})

test('a changed payload fails the signature', () => {
  const [h, , s] = signJws(chain, {
    productId: 'ingre_explorer_monthly'
  }).split('.')
  fails(
    `${h}.${b64({ productId: 'ingre_leader_monthly' })}.${s}`,
    'bad signature'
  )
})

test('a payload that is not an object is refused', () => {
  fails(signJws(chain, [1, 2]), 'payload is not an object')
})

test('certificates must be valid when the payload was signed', () => {
  fails(
    signJws(chain, { signedDate: Date.parse('2045-01-01') }),
    'certificate expired'
  )
  const expired = appleChain({ leaf: { notAfter: new Date('2021-01-01') } })
  fails(signJws(expired, {}), 'certificate expired', {
    roots: [expired.rootPem],
    now
  })
})
