/*
 * Paddle + RevenueCat: the part both payment webhooks share. A normalised event is taken
 * once (by event id); if writing it fails, the claim is let go and the provider gets a 500,
 * so its retry is processed again rather than skipped as a duplicate.
 */
import { createHash, timingSafeEqual } from 'node:crypto'
import type { Response } from 'express'
import type { EntitlementStore } from '../datasources/entitlement'
import type { EntitlementState, Normalised } from '../payments/entitlement'

const digest = (value: string): Buffer =>
  createHash('sha256').update(value).digest()

/** Constant time whatever the lengths, so a wrong guess doesn't learn the secret's length. */
export const sameSecret = (given: unknown, expected: string): boolean =>
  typeof given === 'string' && timingSafeEqual(digest(given), digest(expected))

/** Runs after an event is applied to a user, e.g. posting the purchase to RevenueCat. */
export type AfterApply = (state: EntitlementState) => Promise<void>

export const takeEvent = async (
  res: Response,
  store: EntitlementStore,
  normalised: Normalised,
  afterApply: AfterApply | null = null
): Promise<void> => {
  if (normalised.kind === 'invalid') {
    res.status(400).json({ error: normalised.reason })
    return
  }
  if (normalised.kind === 'ignored') {
    res.json({ received: true, handled: false, reason: normalised.reason })
    return
  }
  const { state } = normalised
  if (!(await store.claim(state.eventId))) {
    res.json({ received: true, handled: false, duplicate: true })
    return
  }
  try {
    const outcome = await store.apply(state)
    if (outcome === 'applied' && afterApply !== null) await afterApply(state)
    res.json({ received: true, handled: outcome === 'applied', outcome })
  } catch (error) {
    console.error('payment webhook failed', state.eventId, error)
    await store.release(state.eventId)
    res.status(500).json({ error: 'could not apply the event' })
  }
}
