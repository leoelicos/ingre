/** Platform biometric login adapter. Desktop uses WebAuthn; iOS/Android use Capacitor. */

export type BiometricPlatform = 'web' | 'ios' | 'android' | 'unknown'

export type BiometricResult =
  | { ok: true }
  | { ok: false; reason: 'unavailable' | 'cancelled' | 'failed' }

export function detectPlatform(
  userAgent = '',
  capacitor = false
): BiometricPlatform {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios'
  if (/Android/i.test(userAgent)) return 'android'
  if (capacitor) return 'unknown'
  return 'web'
}

export function biometricAvailable(
  platform: BiometricPlatform,
  hasWebAuthn: boolean
): boolean {
  if (platform === 'ios' || platform === 'android') return true
  if (platform === 'web') return hasWebAuthn
  return false
}

export async function authenticateBiometric(input: {
  platform: BiometricPlatform
  hasWebAuthn: boolean
  nativeCheck: () => Promise<boolean>
  webCheck: () => Promise<boolean>
}): Promise<BiometricResult> {
  if (!biometricAvailable(input.platform, input.hasWebAuthn)) {
    return { ok: false, reason: 'unavailable' }
  }
  try {
    const ok =
      input.platform === 'web'
        ? await input.webCheck()
        : await input.nativeCheck()
    return ok ? { ok: true } : { ok: false, reason: 'failed' }
  } catch {
    return { ok: false, reason: 'cancelled' }
  }
}
