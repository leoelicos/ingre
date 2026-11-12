import { useEffect, useState } from 'react'
import type { Tier } from '../../utils/tier/tiers'
import type { LoadPurchases } from '../../utils/payments/revenuecat'
import { webEntitlement } from '../../utils/payments/revenuecat'

/** Paddle + RevenueCat: the tier RevenueCat reports for the signed-in user (null when unknown). */
export const useWebEntitlement = (
  apiKey: string | null,
  userId: string | null,
  load: LoadPurchases
): Tier | null => {
  const [tier, setTier] = useState<Tier | null>(null)
  useEffect(() => {
    if (apiKey === null || userId === null) return undefined
    let live = true
    webEntitlement(apiKey, userId, load)
      .then((found) => {
        if (live) setTier(found)
      })
      .catch(() => {
        // RevenueCat unreachable: say nothing about the plan
      })
    return () => {
      live = false
    }
  }, [apiKey, userId, load])
  return tier
}
