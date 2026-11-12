/*
 * Paddle + RevenueCat: RevenueCat webhooks, `POST /revenuecat/webhook`. RevenueCat sends
 * the Authorization header set in its dashboard; it must equal REVENUECAT_WEBHOOK_AUTH
 * (503 while unset, 401 when it differs). Brings App Store / Google Play purchases made
 * through RevenueCat into the same entitlement as Paddle's.
 */
import type { Request, Response } from 'express'
import type { EntitlementStore } from '../datasources/entitlement'
import { isTestingEnv, type Env } from '../payments/keyGuard'
import { normaliseRevenueCatEvent } from '../payments/revenuecat'
import { sameSecret, takeEvent } from './entitlement'

export const revenueCatWebhook =
  (
    store: EntitlementStore,
    env: Env = process.env,
    now: () => Date = () => new Date()
  ) =>
  async (req: Request, res: Response): Promise<void> => {
    const secret = env['REVENUECAT_WEBHOOK_AUTH']
    if (!secret) {
      res.status(503).json({ error: 'REVENUECAT_WEBHOOK_AUTH is not set' })
      return
    }
    if (!sameSecret(req.header('authorization'), secret)) {
      res.status(401).json({ error: 'bad authorization' })
      return
    }
    await takeEvent(
      res,
      store,
      normaliseRevenueCatEvent(req.body, {
        now: now(),
        testing: isTestingEnv(env)
      })
    )
  }
