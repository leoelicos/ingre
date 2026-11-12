import {
  MAX_KM,
  browserPlace,
  countryFromCoordinates,
  countryFromLocale,
  countryFromTimeZone,
  distanceKm,
  guessCountry,
  locateCountry
} from '../country'
import type { BrowserPlace } from '../country'

/* Paddle + RevenueCat: which country to price for. */

const NEW_YORK = { latitude: 40.7128, longitude: -74.006 }
const BERLIN = { latitude: 52.52, longitude: 13.405 }
const MUMBAI = { latitude: 19.076, longitude: 72.8777 }

describe('country from coordinates', () => {
  it('finds the nearest reference city', () => {
    expect(countryFromCoordinates(NEW_YORK)).toBe('US')
    expect(countryFromCoordinates(BERLIN)).toBe('DE')
    expect(countryFromCoordinates(MUMBAI)).toBe('IN')
    expect(countryFromCoordinates({ latitude: -33.9, longitude: 151.2 })).toBe(
      'AU'
    )
  })

  it('gives up far from every city', () => {
    // the middle of the Pacific
    expect(countryFromCoordinates({ latitude: 0, longitude: -150 })).toBeNull()
    expect(distanceKm(NEW_YORK, BERLIN)).toBeGreaterThan(MAX_KM)
    expect(Math.round(distanceKm(NEW_YORK, NEW_YORK))).toBe(0)
  })
})

describe('country from the browser', () => {
  it('reads the region in a locale', () => {
    expect(countryFromLocale('en-IN')).toBe('IN')
    expect(countryFromLocale('de-DE')).toBe('DE')
    expect(countryFromLocale('en')).toBeNull()
    expect(countryFromLocale('not a locale!')).toBeNull()
  })

  it('reads a time zone', () => {
    expect(countryFromTimeZone('Asia/Kolkata')).toBe('IN')
    expect(countryFromTimeZone('Mars/Olympus')).toBeNull()
  })

  it('guesses from the locale, then the time zone, then the US', () => {
    expect(guessCountry('de-DE', 'Asia/Kolkata')).toEqual({
      country: 'DE',
      source: 'locale'
    })
    expect(guessCountry('en', 'Europe/London')).toEqual({
      country: 'GB',
      source: 'timeZone'
    })
    expect(guessCountry('en', 'UTC')).toEqual({
      country: 'US',
      source: 'default'
    })
  })

  it('reads the real browser', () => {
    expect(browserPlace()).toMatchObject({
      locale: navigator.language,
      geolocation: navigator.geolocation,
      permissions: navigator.permissions
    })
  })
})

const place = (
  state: PermissionState,
  position: GeolocationPosition | Error
): BrowserPlace => ({
  locale: 'en',
  timeZone: 'UTC',
  permissions: {
    query: jest.fn(async () => ({ state } as PermissionStatus))
  },
  geolocation: {
    getCurrentPosition: jest.fn((resolve, reject) => {
      if (position instanceof Error)
        reject?.(position as unknown as GeolocationPositionError)
      else resolve(position)
    })
  }
})

const at = (coords: { latitude: number; longitude: number }) =>
  ({ coords } as GeolocationPosition)

describe('locateCountry', () => {
  it('uses the location only when already allowed', async () => {
    expect(await locateCountry(place('granted', at(MUMBAI)))).toBe('IN')
    const prompt = place('prompt', at(MUMBAI))
    expect(await locateCountry(prompt)).toBeNull()
    expect(prompt.geolocation?.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('keeps the guess when the browser has no location or it fails', async () => {
    expect(
      await locateCountry({
        locale: 'en',
        timeZone: 'UTC',
        geolocation: undefined,
        permissions: undefined
      })
    ).toBeNull()
    expect(
      await locateCountry({
        ...place('granted', at(MUMBAI)),
        permissions: undefined
      })
    ).toBeNull()
    expect(
      await locateCountry(place('granted', new Error('timeout')))
    ).toBeNull()
  })
})
