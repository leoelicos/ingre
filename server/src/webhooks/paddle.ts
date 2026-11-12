/*
 * Paddle + RevenueCat: Paddle Billing notifications, `POST /paddle/webhook`. The
 * Paddle-Signature header is checked over the raw body with the Paddle Node SDK and
 * PADDLE_WEBHOOK_SECRET (the notification destination's secret key); 503 while unset.
 * New subscriptions are also posted to RevenueCat when REVENUECAT_API_KEY is set.
 */
import type { Request, Response } from 'express'
import { Environment, Paddle, type Webhooks } from '@paddle/paddle-node-sdk'
import type { EntitlementStore } from '../datasources/entitlement'
import type { Env } from '../payments/keyGuard'
import {
  normalisePaddleEvent,
  paddleEnvironmentOf,
  priceTiersOf
} from '../payments/paddle'
import type { RevenueCatSync } from '../payments/revenuecat'
import { takeEvent, type AfterApply } from './entitlement'

/** The SDK's signature check (a seam for tests). */
export type SignatureCheck = Pick<Webhooks, 'isSignatureValid'>

/**
 * The Paddle Node SDK client's webhook helper. The client sets up the SDK's Node crypto,
 * so it is made even though checking a signature needs no API key.
 */
export const paddleSignatureCheck = (env: Env): SignatureCheck =>
  new Paddle(env['PADDLE_API_KEY'] || 'not-needed-for-webhooks', {
    environment:
      paddleEnvironmentOf(env) === 'production'
        ? Environment.production
        : Environment.sandbox
  }).webhooks

const syncWith = (
  sync: RevenueCatSync | null,
  wanted: boolean
): AfterApply | null =>
  sync === null || !wanted
    ? null
    : async (state) => {
        if (state.userId !== null && state.subscriptionId !== null)
          await sync.syncPaddle(state.userId, state.subscriptionId)
      }

const signatureOk = async (
  webhooks: SignatureCheck,
  body: string,
  secret: string,
  signature: string
): Promise<boolean> => {
  try {
    return await webhooks.isSignatureValid(body, secret, signature)
  } catch {
    // a missing or garbled Paddle-Signature header
    return false
  }
}

/** Mount with `express.raw({ type: 'application/json' })`: the signature covers the raw bytes. */
export const paddleWebhook =
  (
    store: EntitlementStore,
    sync: RevenueCatSync | null,
    env: Env = process.env,
    webhooks: SignatureCheck = paddleSignatureCheck(env)
  ) =>
  async (req: Request, res: Response): Promise<void> => {
    const secret = env['PADDLE_WEBHOOK_SECRET']
    if (!secret) {
      res.status(503).json({ error: 'PADDLE_WEBHOOK_SECRET is not set' })
      return
    }
    const body = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : ''
    const signature = req.header('paddle-signature') ?? ''
    if (!(await signatureOk(webhooks, body, secret, signature))) {
      res.status(400).json({ error: 'bad signature' })
      return
    }
    let payload: unknown
    try {
      payload = JSON.parse(body)
    } catch {
      res.status(400).json({ error: 'not JSON' })
      return
    }
    const normalised = normalisePaddleEvent(payload, {
      priceTiers: priceTiersOf(env),
      environment: paddleEnvironmentOf(env)
    })
    await takeEvent(
      res,
      store,
      normalised,
      syncWith(
        sync,
        normalised.kind === 'entitlement' && normalised.syncRevenueCat
      )
    )
  }
