/*
 * Paddle + RevenueCat: the RevenueCat web SDK (@revenuecat/purchases-js) reads the signed-in
 * user's entitlements, whichever store they paid through (the server posts Paddle
 * purchases to RevenueCat). Loaded only when needed, with the Web Billing public key.
 */
import type { Purchases } from '@revenuecat/purchases-js'
import type { Tier } from '../tier/tiers'
import { TIERS } from '../tier/tiers'

/** The parts of the SDK this app uses. */
export interface PurchasesSdk {
  isConfigured(): boolean
  getSharedInstance(): Pick<
    Purchases,
    'getAppUserId' | 'changeUser' | 'getCustomerInfo'
  >
  configure(config: {
    apiKey: string
    appUserId: string
  }): Pick<Purchases, 'getAppUserId' | 'changeUser' | 'getCustomerInfo'>
}

export type LoadPurchases = () => Promise<PurchasesSdk>

export const loadPurchases: LoadPurchases = () =>
  import('@revenuecat/purchases-js').then((sdk) => sdk.Purchases)

/** An entitlement id as a tier: "manager", "Leader", "ingre_explorer". */
export const tierOfEntitlement = (id: string): Tier | null => {
  const name = id
    .trim()
    .toUpperCase()
    .replace(/^INGRE_/, '')
  return TIERS.find((tier) => tier.id === name)?.id ?? null
}

/** The highest tier among RevenueCat's active entitlements, or null. */
export const highestEntitlement = (ids: readonly string[]): Tier | null => {
  const tiers = ids.map(tierOfEntitlement)
  return [...TIERS].reverse().find(({ id }) => tiers.includes(id))?.id ?? null
}

/** The tier RevenueCat says this user has. */
export const webEntitlement = async (
  apiKey: string,
  appUserId: string,
  load: LoadPurchases = loadPurchases
): Promise<Tier | null> => {
  const sdk = await load()
  const purchases = sdk.isConfigured()
    ? sdk.getSharedInstance()
    : sdk.configure({ apiKey, appUserId })
  if (purchases.getAppUserId() !== appUserId)
    await purchases.changeUser(appUserId)
  const info = await purchases.getCustomerInfo()
  return highestEntitlement(Object.keys(info.entitlements.active))
}
