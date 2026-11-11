/*
 * #312: the three tiers as Stripe subscriptions. Products and monthly Prices are made once by
 * the setup script (scripts/stripe-setup.ts); the Plans page tokenises a card with Stripe.js
 * (`createToken`), and `subscribe` attaches that token to the user's Customer and subscribes.
 */
import Stripe from 'stripe'
import { PaymentDeclinedError, PaymentProviderError } from '../errors'
import {
  LOOKUP_KEYS,
  TIERS,
  TIER_METADATA_KEY,
  tierProduct,
  type Tier
} from '../utils/tiers'
import { getStripe } from './stripe'

type Env = Readonly<Record<string, string | undefined>>

export const CURRENCY = 'usd'

/** STRIPE_PRICE_<TIER> pins a tier's Price id; else the Price is found by lookup key. */
export const pinnedPrice = (tier: Tier, env: Env): string | null =>
  env[`STRIPE_PRICE_${tier}`] || null

export interface Subscribed {
  readonly customerId: string
  readonly subscriptionId: string
  readonly status: string
}

export interface SetupResult {
  readonly tier: Tier
  readonly productId: string
  readonly priceId: string
  /** false when the Price was already there (the script is idempotent) */
  readonly created: boolean
}

const declined = (error: unknown): never => {
  if (error instanceof Stripe.errors.StripeCardError) {
    throw new PaymentDeclinedError(error.message, error.code ?? null)
  }
  throw new PaymentProviderError('could not reach Stripe')
}

export class BillingApi {
  private stripe: Stripe
  private env: Env
  constructor(stripe: Stripe = getStripe(), env: Env = process.env) {
    this.stripe = stripe
    this.env = env
  }

  /** The tier's active monthly Price, by lookup key. */
  private findPrice = async (tier: Tier): Promise<Stripe.Price | null> => {
    const { data } = await this.stripe.prices.list({
      lookup_keys: [LOOKUP_KEYS[tier]],
      active: true,
      limit: 1
    })
    return data[0] ?? null
  }

  /** The tier's Product, by its metadata, so a re-run never makes a second one. */
  private findProduct = async (tier: Tier): Promise<Stripe.Product | null> => {
    const { data } = await this.stripe.products.list({
      active: true,
      limit: 100
    })
    return (
      data.find((product) => product.metadata[TIER_METADATA_KEY] === tier) ??
      null
    )
  }

  public priceId = async (tier: Tier): Promise<string> => {
    const pinned = pinnedPrice(tier, this.env)
    if (pinned !== null) return pinned
    const price = await this.findPrice(tier)
    if (price === null) {
      throw new PaymentProviderError(
        `no Stripe price for ${tier}: run npm run stripe:setup`
      )
    }
    return price.id
  }

  /** Makes whatever Product or Price is missing, and reuses the rest. */
  public setUp = async (): Promise<SetupResult[]> => {
    const results: SetupResult[] = []
    for (const tier of TIERS) {
      const { productName, productDescription, productCost } = tierProduct(tier)
      const price = await this.findPrice(tier)
      if (price !== null) {
        const product =
          typeof price.product === 'string' ? price.product : price.product.id
        results.push({
          tier,
          productId: product,
          priceId: price.id,
          created: false
        })
        continue
      }
      const product =
        (await this.findProduct(tier)) ??
        (await this.stripe.products.create({
          name: productName,
          description: productDescription,
          metadata: { [TIER_METADATA_KEY]: tier }
        }))
      const made = await this.stripe.prices.create({
        product: product.id,
        unit_amount: productCost,
        currency: CURRENCY,
        recurring: { interval: 'month' },
        lookup_key: LOOKUP_KEYS[tier],
        metadata: { [TIER_METADATA_KEY]: tier }
      })
      results.push({
        tier,
        productId: product.id,
        priceId: made.id,
        created: true
      })
    }
    return results
  }

  /**
   * Attaches the Stripe.js token to the user's Customer as its payment source (making the
   * Customer on first use), then subscribes it to the tier, or moves its subscription there.
   */
  public subscribe = async ({
    tier,
    token,
    email,
    name,
    userId,
    customerId,
    subscriptionId
  }: {
    tier: Tier
    token: string
    email: string
    name: string
    userId: string
    customerId: string | null
    subscriptionId: string | null
  }): Promise<Subscribed> => {
    const price = await this.priceId(tier)
    const customer = await (
      customerId === null
        ? this.stripe.customers.create({
            email,
            name,
            source: token,
            metadata: { userId }
          })
        : this.stripe.customers.update(customerId, { source: token })
    ).catch(declined)
    const metadata = { userId, [TIER_METADATA_KEY]: tier }
    const subscription = await (
      subscriptionId === null
        ? this.stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price }],
            metadata
          })
        : this.moveTo(subscriptionId, price, metadata)
    ).catch(declined)
    return {
      customerId: customer.id,
      subscriptionId: subscription.id,
      status: subscription.status
    }
  }

  private moveTo = async (
    subscriptionId: string,
    price: string,
    metadata: Record<string, string>
  ): Promise<Stripe.Subscription> => {
    const current = await this.stripe.subscriptions.retrieve(subscriptionId)
    const item = current.items.data[0]
    return this.stripe.subscriptions.update(subscriptionId, {
      items: item === undefined ? [{ price }] : [{ id: item.id, price }],
      metadata
    })
  }
}
