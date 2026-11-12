import { Schema, model } from 'mongoose'

/**
 * Paddle + RevenueCat: one row per payment event already taken, keyed by
 * `<provider>:<event id>`. Providers deliver at least once (and retry on any non-2xx),
 * so a second delivery of the same event is recognised and skipped.
 */
export interface WebhookEventSchema {
  _id: string
  receivedAt: Date
}

const webhookEventSchema = new Schema<WebhookEventSchema>({
  _id: { type: String, required: true },
  receivedAt: { type: Date, default: () => new Date() }
})

export const WebhookEvent = model('WebhookEvent', webhookEventSchema)
