import { PaymentProviderError } from '../../../errors'
import { tierProduct, type Tier } from '../../../utils/tiers'
import { MyContext } from '../../types'

export const getRootEndpointFromHeaders = ({
  headers
}: {
  headers?: { referer?: string } | undefined
}) => (headers?.referer ? new URL(headers.referer).origin : '')

/** The old PRO product, which a checkout without a tier still buys. */
const LEGACY_PRODUCT = {
  productName: 'ingré PRO',
  productDescription: 'Access instructions to cook each recipe',
  productCost: 500
}

export const productFor = (tier: Tier | null | undefined) =>
  tier ? tierProduct(tier) : LEGACY_PRODUCT

export const checkout = async (
  _parent: unknown,
  { tier }: { tier?: Tier | null },
  { headers, dataSources }: MyContext
) => {
  //! TODO: throw if unauthenticated
  try {
    const response = await dataSources.stripeApi.stripePay({
      ...productFor(tier),
      productImages: [
        'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'
      ],
      productCurrency: 'usd',
      rootEndpoint: getRootEndpointFromHeaders({ headers })
    })
    return { session: response.id }
  } catch {
    throw new PaymentProviderError('could not create stripe response')
  }
}
