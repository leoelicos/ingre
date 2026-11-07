import {
  authenticateBiometric,
  biometricAvailable,
  detectPlatform
} from '../biometric'

describe('biometric', () => {
  it('detects ios, android and web', () => {
    expect(
      detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
    ).toBe('ios')
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 14)')).toBe('android')
    expect(detectPlatform('Mozilla/5.0 (Macintosh)')).toBe('web')
    expect(detectPlatform('', true)).toBe('unknown')
    expect(detectPlatform()).toBe('web')
  })

  it('is available on native always and on web only with WebAuthn', () => {
    expect(biometricAvailable('ios', false)).toBe(true)
    expect(biometricAvailable('android', false)).toBe(true)
    expect(biometricAvailable('web', true)).toBe(true)
    expect(biometricAvailable('web', false)).toBe(false)
    expect(biometricAvailable('unknown', true)).toBe(false)
  })

  it('returns ok when the platform check passes', async () => {
    const result = await authenticateBiometric({
      platform: 'ios',
      hasWebAuthn: false,
      nativeCheck: async () => true,
      webCheck: async () => false
    })
    expect(result).toEqual({ ok: true })
  })

  it('uses the web check on web', async () => {
    const result = await authenticateBiometric({
      platform: 'web',
      hasWebAuthn: true,
      nativeCheck: async () => false,
      webCheck: async () => true
    })
    expect(result).toEqual({ ok: true })
  })

  it('returns failed when the check returns false', async () => {
    const result = await authenticateBiometric({
      platform: 'ios',
      hasWebAuthn: false,
      nativeCheck: async () => false,
      webCheck: async () => true
    })
    expect(result).toEqual({ ok: false, reason: 'failed' })
  })

  it('returns unavailable on web without WebAuthn', async () => {
    const result = await authenticateBiometric({
      platform: 'web',
      hasWebAuthn: false,
      nativeCheck: async () => true,
      webCheck: async () => true
    })
    expect(result).toEqual({ ok: false, reason: 'unavailable' })
  })

  it('returns cancelled when the check throws', async () => {
    const result = await authenticateBiometric({
      platform: 'android',
      hasWebAuthn: false,
      nativeCheck: async () => {
        throw new Error('cancelled')
      },
      webCheck: async () => true
    })
    expect(result).toEqual({ ok: false, reason: 'cancelled' })
  })
})
