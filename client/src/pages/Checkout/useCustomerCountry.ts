import { useEffect, useState } from 'react'
import type {
  BrowserPlace,
  CustomerCountry
} from '../../utils/payments/country'
import { guessCountry, locateCountry } from '../../utils/payments/country'

/**
 * Paddle + RevenueCat: the country to price for. Starts with the browser's language or
 * time zone, then the location if the visitor already allowed it; a country they pick
 * always wins.
 */
export const useCustomerCountry = (
  place: BrowserPlace
): readonly [CustomerCountry, (country: string) => void] => {
  const [country, setCountry] = useState<CustomerCountry>(() =>
    guessCountry(place.locale, place.timeZone)
  )
  useEffect(() => {
    let live = true
    void locateCountry(place).then((located) => {
      if (live && located !== null)
        setCountry((current) =>
          current.source === 'chosen'
            ? current
            : { country: located, source: 'location' }
        )
    })
    return () => {
      live = false
    }
  }, [place])
  const choose = (picked: string): void =>
    setCountry({ country: picked, source: 'chosen' })
  return [country, choose]
}
