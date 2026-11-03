import {
  MICROPAYMENTS_KEY,
  PICK_PRICE_CENTS,
  isUnlocked,
  readUnlocked,
  stubGateway,
  unlock
} from '../micropayment'

describe('micropayment stub (#218)', () => {
  beforeEach(() => localStorage.clear())

  it('the stub gateway charges nothing: a stub receipt with charged false', async () => {
    const receipt = await stubGateway.charge({
      productId: 'pick:dahl',
      amountCents: PICK_PRICE_CENTS,
      currency: 'usd'
    })
    expect(receipt).toEqual({
      id: 'stub_pick:dahl',
      amountCents: PICK_PRICE_CENTS,
      currency: 'usd',
      charged: false
    })
  })

  it('unlock records the pick on the device after the gateway answers', async () => {
    expect(isUnlocked(readUnlocked(), 'pick:dahl')).toBe(false)
    const receipt = await unlock(stubGateway, 'pick:dahl')
    expect(receipt.charged).toBe(false)
    expect(isUnlocked(readUnlocked(), 'pick:dahl')).toBe(true)
    expect(
      JSON.parse(localStorage.getItem(MICROPAYMENTS_KEY) ?? 'null')
    ).toEqual(['pick:dahl'])
  })

  it('unlocking twice keeps one entry', async () => {
    await unlock(stubGateway, 'pick:dahl')
    await unlock(stubGateway, 'pick:dahl')
    expect(readUnlocked()).toEqual(['pick:dahl'])
  })

  it('a gateway that fails unlocks nothing', async () => {
    const failing = { charge: () => Promise.reject(new Error('declined')) }
    await expect(unlock(failing, 'pick:dahl')).rejects.toThrow('declined')
    expect(readUnlocked()).toEqual([])
  })

  it('ignores a bad stored value', () => {
    localStorage.setItem(MICROPAYMENTS_KEY, '"x"')
    expect(readUnlocked()).toEqual([])
    localStorage.setItem(MICROPAYMENTS_KEY, '[1,"a"]')
    expect(readUnlocked()).toEqual(['a'])
  })
})
