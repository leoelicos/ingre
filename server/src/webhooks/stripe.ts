/*
 * #312: Stripe tells the server about checkouts and subscriptions here, so the user's tier
 * and `active` status follow renewals, failed payments and cancellations. Every request's
 * signature is checked against STRIPE_WEBHOOK_SECRET (`stripe listen` prints one locally).
 */
import type { Request, Response } from 'express'
import Stripe from 'stripe'
import type { SubscriptionState } from '../datasources/user'
import {
  TIER_METADATA_KEY,
  isTier,
  tierOfLookupKey,
  type Tier
} from '../utils/tiers'

type Env = Readonly<Record<string, string | undefined>>

/** Where the webhook writes: the user with this Stripe Customer, or a user by id. */
export interface SubscriptionStore {
  setSubscription(
    filter: { stripeCustomerId: string } | { _id: string },
    state: SubscriptionState
  ): Promise<unknown>
}

export const HANDLED = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed'
] as const

const idOf = (
  value: string | { id: string } | null | undefined
): string | null =>
  value === null || value === undefined
    ? null
    : typeof value === 'string'
      ? value
      : value.id

/** The tier a subscription is for: its Price's lookup key, else the tier in its metadata. */
export const tierOf = (subscription: Stripe.Subscription): Tier | null => {
  const fromPrice = tierOfLookupKey(
    subscription.items.data[0]?.price.lookup_key
  )
  if (fromPrice !== null) return fromPrice
  const fromMetadata = subscription.metadata[TIER_METADATA_KEY]
  return isTier(fromMetadata) ? fromMetadata : null
}

const fromSubscription = (
  subscription: Stripe.Subscription
): SubscriptionState => ({
  customerId: idOf(subscription.customer) ?? '',
  subscriptionId: subscription.id,
  status: subscription.status,
  tier: tierOf(subscription)
})

/** What one event changes; null for events this server ignores. */
export const stateFor = (
  event: Stripe.Event
): {
  filter: { stripeCustomerId: string } | { _id: string }
  state: SubscriptionState
} | null => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = idOf(session.customer)
      const userId = session.client_reference_id
      if (customerId === null || userId === null) return null
      const metadataTier = session.metadata?.[TIER_METADATA_KEY]
      return {
        filter: { _id: userId },
        state: {
          customerId,
          subscriptionId: idOf(session.subscription),
          status: session.payment_status === 'paid' ? 'active' : 'incomplete',
          tier: isTier(metadataTier) ? metadataTier : null
        }
      }
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const state = fromSubscription(event.data.object as Stripe.Subscription)
      return { filter: { stripeCustomerId: state.customerId }, state }
    }
    case 'invoice.paid':
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = idOf(invoice.customer)
      if (customerId === null) return null
      return {
        filter: { stripeCustomerId: customerId },
        state: {
          customerId,
          subscriptionId: idOf(invoice.subscription),
          status: event.type === 'invoice.paid' ? 'active' : 'past_due',
          tier: null
        }
      }
    }
    default:
      return null
  }
}

/** The Express handler; mount it with `express.raw({ type: 'application/json' })`. */
export const stripeWebhook =
  (stripe: Stripe, users: SubscriptionStore, env: Env = process.env) =>
  async (req: Request, res: Response): Promise<void> => {
    const secret = env['STRIPE_WEBHOOK_SECRET']
    if (!secret) {
      res.status(503).json({ error: 'STRIPE_WEBHOOK_SECRET is not set' })
      return
    }
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        req.header('stripe-signature') ?? '',
        secret
      )
    } catch {
      res.status(400).json({ error: 'bad signature' })
      return
    }
    const change = stateFor(event)
    if (change !== null)
      await users.setSubscription(change.filter, change.state)
    res.json({ received: true, handled: change !== null })
  }
