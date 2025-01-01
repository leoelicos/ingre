import Stripe from 'stripe'

export class StripeApi {
  private stripe: Stripe
  constructor() {
    this.stripe = getStripe()
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

export const getStripe = () =>
  new Stripe('sk_test_4eC39HqLyjWDarjtT1zdp7dc', {
    apiVersion: '2020-08-27'
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
      cancel_url: `${rootEndpoint}/`
    })
  } catch (error) {
    throw new Error('could not create stripe session')
  }
}
