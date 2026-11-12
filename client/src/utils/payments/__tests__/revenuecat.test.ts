import { Purchases } from '@revenuecat/purchases-js'
import {
  highestEntitlement,
  loadPurchases,
  tierOfEntitlement,
  webEntitlement
} from '../revenuecat'
import type { PurchasesSdk } from '../revenuecat'

/*
 * Paddle + RevenueCat: the web SDK reads the user's entitlements. No module mocks (#169):
 * a fake SDK is injected, and the real one is only asked to do what needs no network.
 */

const fakeSdk = (configured: boolean, appUserId = 'u1') => {
  const instance = {
    getAppUserId: jest.fn(() => appUserId),
    changeUser: jest.fn(async () => ({})),
    getCustomerInfo: jest.fn(async () => ({
      entitlements: { active: { explorer: {}, Manager: {}, other: {} } }
    }))
  }
  const sdk = {
    isConfigured: jest.fn(() => configured),
    getSharedInstance: jest.fn(() => instance),
    configure: jest.fn(() => instance)
  }
  return { sdk: sdk as unknown as PurchasesSdk & typeof sdk, instance }
}

describe('RevenueCat web SDK', () => {
  it('loads the SDK on demand', async () => {
    expect(await loadPurchases()).toBe(Purchases)
  })

  it('reads entitlement ids as tiers', () => {
    expect(tierOfEntitlement('ingre_leader')).toBe('LEADER')
    expect(tierOfEntitlement(' Manager ')).toBe('MANAGER')
    expect(tierOfEntitlement('pro')).toBeNull()
    expect(highestEntitlement(['explorer', 'leader'])).toBe('LEADER')
    expect(highestEntitlement([])).toBeNull()
  })

  it('configures once and reads the highest active entitlement', async () => {
    const { sdk, instance } = fakeSdk(false)
    expect(await webEntitlement('rcb_sb_abc', 'u1', async () => sdk)).toBe(
      'MANAGER'
    )
    expect(sdk.configure).toHaveBeenCalledWith({
      apiKey: 'rcb_sb_abc',
      appUserId: 'u1'
    })
    expect(instance.changeUser).not.toHaveBeenCalled()
  })

  it('reuses the configured SDK and switches to this user', async () => {
    const { sdk, instance } = fakeSdk(true, 'someone-else')
    await webEntitlement('rcb_sb_abc', 'u1', async () => sdk)
    expect(sdk.configure).not.toHaveBeenCalled()
    expect(instance.changeUser).toHaveBeenCalledWith('u1')
  })

  it('uses the real SDK by default, which refuses a secret key', async () => {
    expect(Purchases.isConfigured()).toBe(false)
    await expect(webEntitlement('sk_not_a_public_key', 'u1')).rejects.toThrow()
    expect(Purchases.isConfigured()).toBe(false)
  })
})
