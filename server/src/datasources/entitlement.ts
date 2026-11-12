/*
 * Paddle + RevenueCat: where normalised payment events land. `claim` makes each event
 * count once; `apply` writes the entitlement to the user holding the subscription (else
 * the user the purchase was tied to), unless that user already has a newer event.
 */
import { User } from '../models/User'
import { WebhookEvent } from '../models/WebhookEvent'
import type { EntitlementState } from '../payments/entitlement'
import { activationFields } from './user'

export type ApplyOutcome = 'applied' | 'stale' | 'no-user'

/** What the webhooks need; EntitlementApi in production, a fake in unit tests. */
export interface EntitlementStore {
  /** true the first time an event id is seen, false for a repeat delivery */
  claim(eventId: string): Promise<boolean>
  /** forgets an event, so the provider's retry is processed */
  release(eventId: string): Promise<void>
  apply(state: EntitlementState): Promise<ApplyOutcome>
}

const DUPLICATE_KEY = 11000

const isDuplicateKey = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === DUPLICATE_KEY

export const entitlementFields = (state: EntitlementState) => ({
  entitlementSource: state.source,
  entitlementSubscriptionId: state.subscriptionId,
  entitlementProductId: state.productId,
  entitlementInterval: state.interval,
  entitlementExpiresAt: state.expiresAt,
  entitlementUpdatedAt: state.occurredAt,
  ...(state.customerId === null ? {} : { paddleCustomerId: state.customerId }),
  ...activationFields(state.status, state.tier)
})

export class EntitlementApi implements EntitlementStore {
  public async claim(eventId: string): Promise<boolean> {
    try {
      await WebhookEvent.create({ _id: eventId })
      return true
    } catch (error) {
      if (isDuplicateKey(error)) return false
      throw error
    }
  }

  public async release(eventId: string): Promise<void> {
    await WebhookEvent.deleteOne({ _id: eventId })
  }

  public async apply(state: EntitlementState): Promise<ApplyOutcome> {
    const filters = [
      ...(state.subscriptionId === null
        ? []
        : [{ entitlementSubscriptionId: state.subscriptionId }]),
      ...(state.userId === null ? [] : [{ _id: state.userId }])
    ]
    for (const filter of filters) {
      const user = await User.findOne(filter).select('_id')
      if (!user) continue
      // one conditional write, so a newer event landing after the read still wins
      const { matchedCount } = await User.updateOne(
        {
          _id: user._id,
          $or: [
            { entitlementUpdatedAt: null },
            { entitlementUpdatedAt: { $lte: state.occurredAt } }
          ]
        },
        { $set: entitlementFields(state) }
      )
      return matchedCount === 1 ? 'applied' : 'stale'
    }
    return 'no-user'
  }
}
