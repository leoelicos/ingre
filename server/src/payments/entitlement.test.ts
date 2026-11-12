import {
  firstUserId,
  highestTier,
  intervalOfProduct,
  looseTier,
  tierOfProduct,
  userIdOf
} from './entitlement'
import { USER } from '../test-utils/paymentEvents'

describe('normalising helpers', () => {
  it('reads user ids only when they are ObjectIds', () => {
    expect(userIdOf(USER.toUpperCase())).toBe(USER)
    expect(userIdOf('$RCAnonymousID:8b9d1f')).toBeNull()
    expect(userIdOf(42)).toBeNull()
    expect(firstUserId([null, 'ada@example.com', USER])).toBe(USER)
    expect(firstUserId([])).toBeNull()
  })

  it('reads tiers from product ids, monthly or annual, with a base plan', () => {
    expect(tierOfProduct('ingre_manager_monthly')).toBe('MANAGER')
    expect(tierOfProduct('INGRE_LEADER_ANNUAL')).toBe('LEADER')
    expect(tierOfProduct('ingre_explorer_monthly:monthly')).toBe('EXPLORER')
    expect(tierOfProduct('something_else')).toBeNull()
    expect(tierOfProduct(null)).toBeNull()
  })

  it('reads intervals from product ids', () => {
    expect(intervalOfProduct('ingre_manager_annual')).toBe('year')
    expect(intervalOfProduct('com.ingre.yearly')).toBe('year')
    expect(intervalOfProduct('ingre_manager_monthly')).toBe('month')
    expect(intervalOfProduct('lifetime')).toBeNull()
    expect(intervalOfProduct(undefined)).toBeNull()
  })

  it('reads loosely written tiers and picks the highest', () => {
    expect(looseTier(' manager ')).toBe('MANAGER')
    expect(looseTier('ingre_leader')).toBe('LEADER')
    expect(looseTier('pro')).toBeNull()
    expect(looseTier(3)).toBeNull()
    expect(highestTier(['EXPLORER', null, 'LEADER', 'MANAGER'])).toBe('LEADER')
    expect(highestTier([null])).toBeNull()
  })
})
