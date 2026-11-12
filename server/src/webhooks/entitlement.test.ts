import type { Response } from 'express'
import type { EntitlementStore } from '../datasources/entitlement'
import type { EntitlementState, Normalised } from '../payments/entitlement'
import { sameSecret, takeEvent } from './entitlement'

/* Paddle + RevenueCat: what both payment webhooks do with a normalised event. */

const state = { eventId: 'paddle:evt_1' } as EntitlementState
const entitlement: Normalised = {
  kind: 'entitlement',
  state,
  syncRevenueCat: false
}

const respond = () => {
  const res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnValue(res)
  return res
}

const fakeStore = (overrides: Partial<EntitlementStore> = {}) => ({
  claim: jest.fn(async () => true),
  release: jest.fn(async () => undefined),
  apply: jest.fn(async () => 'applied' as const),
  ...overrides
})

const take = async (
  normalised: Normalised,
  store: EntitlementStore,
  after: ((s: EntitlementState) => Promise<void>) | null = null
) => {
  const res = respond()
  await takeEvent(res as unknown as Response, store, normalised, after)
  return res
}

describe('takeEvent', () => {
  it('answers 400 for an invalid payload and 200 for an ignored one', async () => {
    const store = fakeStore()
    const invalid = await take({ kind: 'invalid', reason: 'nope' }, store)
    expect(invalid.status).toHaveBeenCalledWith(400)
    const skipped = await take(
      { kind: 'ignored', eventId: 'e', reason: 'TEST' },
      store
    )
    expect(skipped.json).toHaveBeenCalledWith({
      received: true,
      handled: false,
      reason: 'TEST'
    })
    expect(store.claim).not.toHaveBeenCalled()
  })

  it('applies an event once, then runs the follow-up', async () => {
    const store = fakeStore()
    const after = jest.fn(async () => undefined)
    const res = await take(entitlement, store, after)
    expect(store.apply).toHaveBeenCalledWith(state)
    expect(after).toHaveBeenCalledWith(state)
    expect(res.json).toHaveBeenCalledWith({
      received: true,
      handled: true,
      outcome: 'applied'
    })
  })

  it('skips a repeat delivery', async () => {
    const store = fakeStore({ claim: jest.fn(async () => false) })
    const res = await take(entitlement, store)
    expect(store.apply).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({
      received: true,
      handled: false,
      duplicate: true
    })
  })

  it('does not follow up when nothing was applied', async () => {
    const store = fakeStore({ apply: jest.fn(async () => 'no-user' as const) })
    const after = jest.fn(async () => undefined)
    const res = await take(entitlement, store, after)
    expect(after).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({
      received: true,
      handled: false,
      outcome: 'no-user'
    })
  })

  it('lets the claim go and answers 500 when anything fails, so the retry runs', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const store = fakeStore()
    const res = await take(entitlement, store, async () => {
      throw new Error('RevenueCat is down')
    })
    expect(store.release).toHaveBeenCalledWith('paddle:evt_1')
    expect(res.status).toHaveBeenCalledWith(500)
  })
})

describe('sameSecret', () => {
  it('compares in constant time', () => {
    expect(sameSecret('abc', 'abc')).toBe(true)
    expect(sameSecret('abd', 'abc')).toBe(false)
    expect(sameSecret('ab', 'abc')).toBe(false)
    expect(sameSecret(undefined, 'abc')).toBe(false)
  })
})
