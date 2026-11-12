/*
 * Paddle + RevenueCat: where normalised payment events land. `claim` makes each event
 * count once (`webhook_events`); `apply` writes the entitlement to the user holding the
 * subscription (else the user the purchase was tied to), unless that user already has
 * a newer event.
 */
import { z } from 'zod'
import type { EntitlementState } from '../payments/entitlement'
import { SqlStore } from './sqlStore'
import { activationFields } from './user'
import { assignments } from './userRows'

export type ApplyOutcome = 'applied' | 'stale' | 'no-user'

/** What the webhooks need; EntitlementApi in production, a fake in unit tests. */
export interface EntitlementStore {
  /** true the first time an event id is seen, false for a repeat delivery */
  claim(eventId: string): Promise<boolean>
  /** forgets an event, so the provider's retry is processed */
  release(eventId: string): Promise<void>
  apply(state: EntitlementState): Promise<ApplyOutcome>
}

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

const outcome = z.object({
  found: z.coerce.number(),
  applied: z.coerce.number()
})

export class EntitlementApi extends SqlStore implements EntitlementStore {
  public async claim(eventId: string): Promise<boolean> {
    const claimed = await this.sql.query(
      `insert into webhook_events (id) values ($1)
       on conflict do nothing returning id`,
      [eventId]
    )
    return claimed.length === 1
  }

  public async release(eventId: string): Promise<void> {
    await this.sql.query('delete from webhook_events where id = $1', [eventId])
  }

  /**
   * One statement: the user holding the subscription, else the user it was tied to,
   * updated only when its last event is not newer, so a newer event that lands
   * meanwhile still wins.
   */
  public async apply(state: EntitlementState): Promise<ApplyOutcome> {
    const set = assignments(entitlementFields(state), 4)
    const [row] = await this.sql.query(
      `with target as (
         select id from (
           select id, 0 as rank from users
           where $1::text is not null and entitlement_subscription_id = $1
           union all
           select id, 1 as rank from users
           where $2::text is not null and public_id = $2
         ) candidates
         order by rank limit 1
       ),
       updated as (
         update users u set ${set.text}
         from target
         where u.id = target.id
           and (u.entitlement_updated_at is null
             or u.entitlement_updated_at <= $3)
         returning u.id
       )
       select (select count(*) from target) as found,
         (select count(*) from updated) as applied`,
      [state.subscriptionId, state.userId, state.occurredAt, ...set.values]
    )
    const { found, applied } = outcome.parse(row)
    if (found === 0) return 'no-user'
    return applied === 1 ? 'applied' : 'stale'
  }
}
