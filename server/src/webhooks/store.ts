/*
 * #314: the stores tell the server about renewals, lapses, refunds and tier changes here.
 * Neither notice is trusted as is: Google's Real-time developer notification only names a
 * purchase token, which is then re-read from the Play Developer API; Apple's App Store
 * Server Notification V2 is a signed JWS, verified, and the subscription re-read from the
 * App Store Server API. 503 while that store isn't configured.
 */
import { timingSafeEqual } from 'node:crypto'
import type { Request, Response } from 'express'
import type { StoreApi } from '../datasources/store'
import type { StoreState } from '../store/common'
import { StoreVerificationError } from '../errors'

type Env = Readonly<Record<string, string | undefined>>

export interface StoreSubscriptionStore {
  applyStoreNotification(state: StoreState): Promise<unknown>
}

const sameSecret = (given: unknown, expected: string): boolean => {
  if (typeof given !== 'string') return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

const apply = async (
  res: Response,
  users: StoreSubscriptionStore,
  read: () => Promise<StoreState | null>
) => {
  let state: StoreState | null
  try {
    state = await read()
  } catch (error) {
    // a notice we can't verify is dropped (200, so it isn't retried forever);
    // anything else (the store's API is down) is a 500 so the store retries later
    if (error instanceof StoreVerificationError) {
      res.status(200).json({ received: true, handled: false })
      return
    }
    res.status(500).json({ error: 'could not reach the store' })
    return
  }
  const user = state === null ? null : await users.applyStoreNotification(state)
  res.json({ received: true, handled: user !== null })
}

/**
 * Google Play RTDN via a Pub/Sub push subscription to
 * `/store/google/rtdn?token=<GOOGLE_RTDN_TOKEN>`.
 */
export const googleRtdn =
  (store: StoreApi, users: StoreSubscriptionStore, env: Env = process.env) =>
  async (req: Request, res: Response): Promise<void> => {
    const google = store.google
    const secret = env['GOOGLE_RTDN_TOKEN']
    if (google === null || !secret) {
      res
        .status(503)
        .json({ error: 'Google Play notifications are not set up' })
      return
    }
    if (!sameSecret(req.query['token'], secret)) {
      res.status(401).json({ error: 'bad token' })
      return
    }
    await apply(res, users, async () => {
      const token = google.tokenOfNotification(req.body)
      return token === null ? null : google.verify(token)
    })
  }

/** App Store Server Notifications V2, `POST /store/apple/notifications`. */
export const appleNotifications =
  (store: StoreApi, users: StoreSubscriptionStore) =>
  async (req: Request, res: Response): Promise<void> => {
    const apple = store.apple
    if (apple === null) {
      res.status(503).json({ error: 'App Store notifications are not set up' })
      return
    }
    await apply(res, users, () => apple.fromNotification(req.body))
  }
