import Stripe from 'stripe'

export class StripeApi {
  private stripe: Stripe
  constructor(stripe: Stripe = getStripe()) {
    this.stripe = stripe
  }
  public stripePay = async ({
    productName,
    productDescription,
    productImages,
    productCost,
    productCurrency,
    rootEndpoint
  }: {
    productName: string
    productDescription: string
    productImages: Array<string>
    productCost: number
    productCurrency: string
    rootEndpoint: string
  }) => {
    try {
      const product = await createProduct({
        stripe: this.stripe,
        productName,
        productDescription,
        productImages
      })
      const price = await createPrice({
        stripe: this.stripe,
        productId: product.id,
        productCost,
        productCurrency
      })
      const session = await createSession({
        stripe: this.stripe,
        priceId: price.id,
        rootEndpoint
      })
      return session
    } catch (error) {
      throw new Error('could not process stripe payment')
    }
  }
}

/** Stripe's public sample test key, as before: production keeps using it. */
const SAMPLE_TEST_KEY = 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'

type Env = Readonly<Record<string, string | undefined>>

type StripeConnection = Pick<Stripe.StripeConfig, 'host' | 'port' | 'protocol'>

/** The sample test key, unless a stand-in host is set with its own dummy STRIPE_API_KEY (e2e). */
export const stripeKey = (env: Env): string =>
  (env['STRIPE_API_HOST'] && env['STRIPE_API_KEY']) || SAMPLE_TEST_KEY

/**
 * Where the Stripe API lives. Unset (production): stripe-node's default, api.stripe.com.
 * STRIPE_API_HOST (+ _PORT, _PROTOCOL) point it at a stand-in such as the e2e WireMock.
 */
export const stripeConnection = (env: Env): StripeConnection => {
  const host = env['STRIPE_API_HOST']
  if (!host) return {}
  const protocol = env['STRIPE_API_PROTOCOL'] === 'http' ? 'http' : 'https'
  return { host, port: env['STRIPE_API_PORT'] || 443, protocol }
}

export const getStripe = (env: Env = process.env) =>
  new Stripe(stripeKey(env), {
    apiVersion: '2020-08-27',
    ...stripeConnection(env)
  })

const createProduct = async ({
  stripe,
  productName,
  productDescription,
  productImages
}: {
  stripe: Stripe
  productName: string
  productDescription: string
  productImages: Array<string>
}) => {
  try {
    return await stripe.products.create({
      name: productName,
      description: productDescription,
      images: productImages
    })
  } catch (error) {
    throw new Error('could not create stripe product')
  }
}

const createPrice = async ({
  stripe,
  productId,
  productCost,
  productCurrency
}: {
  stripe: Stripe
  productId: string
  productCost: number
  productCurrency: string
}) => {
  try {
    return await stripe.prices.create({
      product: productId,
      unit_amount: productCost,
      currency: productCurrency
    })
  } catch (error) {
    throw new Error('could not create stripe price')
  }
}

const createSession = async ({
  stripe,
  priceId,
  rootEndpoint
}: {
  stripe: Stripe
  priceId: string
  rootEndpoint: string
}) => {
  try {
    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${rootEndpoint}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${rootEndpoint}/upgrade?checkout=cancelled`
    })
  } catch (error) {
    throw new Error('could not create stripe session')
  }
}
