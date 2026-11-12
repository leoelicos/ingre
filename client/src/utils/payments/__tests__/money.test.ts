import { formatPrice, formatRate } from '../money'

/* Paddle + RevenueCat: prices and tax rates in the customer's own format. */

describe('formatPrice', () => {
  it('formats minor units in the customer’s locale', () => {
    expect(formatPrice(400, 'USD', 'en-US')).toBe('$4.00')
    expect(formatPrice(399, 'EUR', 'de-DE')).toBe('3,99\u00a0€')
    expect(formatPrice(117900, 'INR', 'en-IN')).toBe('₹1,179.00')
  })

  it('falls back to English for a locale it can’t read', () => {
    expect(formatPrice(400, 'USD', 'not a locale!')).toBe('$4.00')
  })
})

describe('formatRate', () => {
  it('formats a rate as a percentage', () => {
    expect(formatRate(0.08875, 'en-US')).toBe('8.875%')
    expect(formatRate(0.19, 'de-DE')).toBe('19\u00a0%')
    expect(formatRate(0.18, 'not a locale!')).toBe('18%')
  })
})
