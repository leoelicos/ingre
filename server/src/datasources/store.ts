/*
 * #314: store purchases from the native apps. Each store is on only when its credentials
 * are in the environment; without them every check refuses (STORE_NOT_CONFIGURED), so a
 * purchase is never trusted unverified.
 */
import { StoreNotConfiguredError, StoreVerificationError } from '../errors'
import { AppleStore, appleConfig } from '../store/apple'
import type { Env, StorePlatform, StoreState } from '../store/common'
import { GooglePlay, googleConfig } from '../store/google'
import type { VerifyOptions } from '../store/jws'

export interface StoreDeps {
  readonly fetch?: typeof fetch
  /** Apple JWS roots, for tests */
  readonly jws?: VerifyOptions
  readonly now?: () => number
}

export class StoreApi {
  readonly google: GooglePlay | null
  readonly apple: AppleStore | null
  constructor(env: Env = process.env, deps: StoreDeps = {}) {
    const fetchImpl = deps.fetch ?? fetch
    const now = deps.now ?? Date.now
    const google = googleConfig(env)
    const apple = appleConfig(env)
    this.google = google && new GooglePlay(google, fetchImpl, now)
    this.apple = apple && new AppleStore(apple, fetchImpl, deps.jws ?? {}, now)
  }

  /**
   * Verifies a purchase the app just made or restored for `userId`. `purchaseToken` is
   * Google's purchase token or Apple's signed transaction (JWS).
   */
  async verify(
    platform: StorePlatform,
    productId: string,
    purchaseToken: string,
    userId: string
  ): Promise<StoreState> {
    const state = await this.check(platform, purchaseToken)
    if (state.productId !== productId)
      throw new StoreVerificationError('the purchase is for another product')
    if (state.accountUserId !== null && state.accountUserId !== userId)
      throw new StoreVerificationError(
        'the purchase belongs to another account'
      )
    return state
  }

  private async check(platform: StorePlatform, token: string) {
    if (platform === 'GOOGLE') {
      if (this.google === null) throw new StoreNotConfiguredError('Google Play')
      return this.google.verify(token)
    }
    if (this.apple === null) throw new StoreNotConfiguredError('App Store')
    return this.apple.verify(token)
  }
}
