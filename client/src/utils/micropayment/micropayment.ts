import type { Parse } from '../storage/storage'
import { readStored, writeStored } from '../storage/storage'

/**
 * A stubbed micropayment (#218). It shows the shape of paying a small amount for one thing
 * without any payment provider: the stub gateway answers at once and **charges nothing**.
 * A real gateway (Stripe in test mode) would implement `MicropaymentGateway` later.
 */
export const MICROPAYMENTS_KEY = 'ingre.micropayments'

/** One editor's pick costs 1 USD (100 cents); stubbed, so no money moves. */
export const PICK_PRICE_CENTS = 100

export interface ChargeRequest {
  readonly productId: string
  readonly amountCents: number
  readonly currency: 'usd'
}

export interface Receipt extends Omit<ChargeRequest, 'productId'> {
  readonly id: string
  /** false for the stub: nothing was charged */
  readonly charged: boolean
}

export interface MicropaymentGateway {
  charge: (request: ChargeRequest) => Promise<Receipt>
}

export const stubGateway: MicropaymentGateway = {
  charge: (request) =>
    Promise.resolve({
      id: `stub_${request.productId}`,
      amountCents: request.amountCents,
      currency: request.currency,
      charged: false
    })
}

const parseUnlocked: Parse<string[]> = (value) =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : null

export const readUnlocked = (): string[] =>
  readStored(MICROPAYMENTS_KEY, parseUnlocked, [])

export const isUnlocked = (
  unlocked: readonly string[],
  productId: string
): boolean => unlocked.includes(productId)

/** Pays through the gateway, and only when it answers does the device remember the unlock. */
export const unlock = async (
  gateway: MicropaymentGateway,
  productId: string
): Promise<Receipt> => {
  const receipt = await gateway.charge({
    productId,
    amountCents: PICK_PRICE_CENTS,
    currency: 'usd'
  })
  const unlocked = readUnlocked()
  if (!isUnlocked(unlocked, productId))
    writeStored(MICROPAYMENTS_KEY, [...unlocked, productId])
  return receipt
}
