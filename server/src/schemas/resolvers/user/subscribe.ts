import { requireUser } from '../../../utils/requireUser'
import { isActiveStatus, type Tier } from '../../../utils/tiers'
import { MyContext } from '../../types'

/**
 * #312: subscribes the signed-in user to a tier. `token` is the id Stripe.js's
 * `createToken(cardElement)` gave the browser; no card number ever reaches this server.
 */
export const subscribe = async (
  _parent: unknown,
  { tier, token }: { tier: Tier; token: string },
  { dataSources, user }: MyContext
) => {
  const { _id } = requireUser(user)
  const billing = await dataSources.userApi.findBilling(_id)
  const subscribed = await dataSources.billingApi.subscribe({
    ...billing,
    tier,
    token,
    userId: String(_id)
  })
  await dataSources.userApi.setSubscription({ _id }, { ...subscribed, tier })
  return {
    tier,
    status: subscribed.status,
    active: isActiveStatus(subscribed.status)
  }
}
