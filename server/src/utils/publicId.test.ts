import { isPublicId, publicIdOf } from './publicId'

describe('public ids', () => {
  it('accepts 24 hex digits, lower-cased', () => {
    expect(publicIdOf('65A1B2C3D4E5F60718293A4B')).toBe(
      '65a1b2c3d4e5f60718293a4b'
    )
    expect(publicIdOf('65a1b2c3d4e5f60718293a4')).toBeNull()
    expect(publicIdOf('anonymous:abc')).toBeNull()
    expect(publicIdOf(42)).toBeNull()
    expect(isPublicId('65a1b2c3d4e5f60718293a4b')).toBe(true)
    // ids are stored lower-case, so upper case is not one
    expect(isPublicId('65A1B2C3D4E5F60718293A4B')).toBe(false)
    expect(isPublicId(null)).toBe(false)
  })
})
