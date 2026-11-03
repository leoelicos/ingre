import {
  PENDING_TIER_KEY,
  clearPendingTier,
  readPendingTier,
  savePendingTier
} from '../pending'

describe('pending tier', () => {
  beforeEach(() => sessionStorage.clear())

  it('is kept for this tab until cleared', () => {
    expect(readPendingTier()).toBeNull()
    savePendingTier('LEADER')
    expect(readPendingTier()).toBe('LEADER')
    clearPendingTier()
    expect(readPendingTier()).toBeNull()
  })

  it('ignores a stored value that is not a tier', () => {
    sessionStorage.setItem(PENDING_TIER_KEY, '"GOLD"')
    expect(readPendingTier()).toBeNull()
  })
})
