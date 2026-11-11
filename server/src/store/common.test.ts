import { randomUUID } from 'node:crypto'
import {
  appAccountTokenFor,
  productIdOf,
  tierOfProductId,
  userIdOfAccountId,
  userIdOfAppAccountToken
} from './common'

/* #314: one id per tier on every store; accounts tied to purchases without personal data. */

test('the store product ids are the Stripe lookup keys', () => {
  expect(productIdOf('EXPLORER')).toBe('ingre_explorer_monthly')
  expect(productIdOf('MANAGER')).toBe('ingre_manager_monthly')
  expect(productIdOf('LEADER')).toBe('ingre_leader_monthly')
  expect(tierOfProductId('ingre_leader_monthly')).toBe('LEADER')
  expect(tierOfProductId('something_else')).toBeNull()
  expect(tierOfProductId(null)).toBeNull()
})

test('appAccountToken is the user id as a UUID, and back', () => {
  const id = '65a1b2c3d4e5f60718293a4b'
  const token = appAccountTokenFor(id)
  expect(token).toBe('65a1b2c3-d4e5-f607-1829-3a4b00000000')
  expect(userIdOfAppAccountToken(token)).toBe(id)
  expect(userIdOfAppAccountToken(token.toUpperCase())).toBe(id)
  expect(appAccountTokenFor(id.toUpperCase())).toBe(token)
})

test('other UUIDs are not user ids', () => {
  // a random v4 UUID never ends in eight zeros
  expect(userIdOfAppAccountToken(randomUUID())).toBeNull()
  expect(userIdOfAppAccountToken(null)).toBeNull()
  expect(userIdOfAppAccountToken(undefined)).toBeNull()
})

test('the Android obfuscated account id is the user id', () => {
  expect(userIdOfAccountId('65A1B2C3D4E5F60718293A4B')).toBe(
    '65a1b2c3d4e5f60718293a4b'
  )
  expect(userIdOfAccountId('not-an-id')).toBeNull()
  expect(userIdOfAccountId(null)).toBeNull()
})
