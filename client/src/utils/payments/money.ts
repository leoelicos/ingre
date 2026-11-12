/*
 * Paddle + RevenueCat: prices in the customer's own format (3,99 € in Germany, ₹1,179.00
 * in India), from the browser's locale rather than the app's language, because the app
 * ships English and Japanese only. Amounts are in minor units, as Paddle sends them.
 */
const formatter = (locale: string, currency: string): Intl.NumberFormat => {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency })
  } catch {
    return new Intl.NumberFormat('en', { style: 'currency', currency })
  }
}

export const formatPrice = (
  minor: number,
  currency: string,
  locale: string
): string => formatter(locale, currency).format(minor / 100)

/** A tax rate such as "0.19" as a percentage in the customer's format: "19 %", "8.875%". */
export const formatRate = (rate: number, locale: string): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 3
    }).format(rate)
  } catch {
    return `${Math.round(rate * 100000) / 1000}%`
  }
}
