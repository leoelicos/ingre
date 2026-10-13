import { MyContext } from '../../types'

export const getRootEndpointFromHeaders = ({
  headers
}: {
  headers?: { referer?: string }
}) => (headers?.referer ? new URL(headers.referer).origin : '')

export const checkout = async (
  _parent: unknown,
  _args: unknown,
  { headers, dataSources }: MyContext
) => {
  //! TODO: throw if unauthenticated
  try {
    const response = await dataSources.stripeApi.stripePay({
      productName: 'ingré PRO',
      productDescription: 'Access instructions to cook each recipe',
      productImages: [
        `https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc`
      ],
      productCost: 500,
      productCurrency: 'usd',
      rootEndpoint: getRootEndpointFromHeaders({ headers })
    })
    return { session: response.id }
  } catch (e: unknown) {
    throw new Error('could not create stripe response')
  }
}
