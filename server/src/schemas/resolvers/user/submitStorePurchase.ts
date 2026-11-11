import type { StorePlatform } from '../../../store/common'
import { requireUser } from '../../../utils/requireUser'
import { isActiveStatus } from '../../../utils/tiers'
import { MyContext } from '../../types'

/**
 * #314: the native apps send each App Store / Google Play purchase (and each restore)
 * here. The store confirms it before anything changes; then the user gets the same
 * `active`, `subscriptionStatus` and `tier` as a Stripe subscription (#312).
 */
export const submitStorePurchase = async (
  _parent: unknown,
  {
    platform,
    productId,
    purchaseToken
  }: { platform: StorePlatform; productId: string; purchaseToken: string },
  { dataSources, user }: MyContext
) => {
  const { _id } = requireUser(user)
  const state = await dataSources.storeApi.verify(
    platform,
    productId,
    purchaseToken,
    String(_id)
  )
  await dataSources.userApi.setStoreSubscription(_id, state)
  return {
    platform: state.platform,
    productId: state.productId,
    tier: state.tier,
    status: state.status,
    active: isActiveStatus(state.status),
    expiresAt: state.expiresAt?.toISOString() ?? null
  }
}
