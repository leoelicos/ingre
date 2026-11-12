/*
 * Paddle + RevenueCat: which country to price for. The browser's location (only when the
 * visitor has already allowed it; the page never asks), else the region in the browser's
 * language (en-IN), else its time zone, else the US. The visitor can always pick another.
 */
export interface Coordinates {
  readonly latitude: number
  readonly longitude: number
}

/** Reference cities: a location within MAX_KM of one is in that city's country. */
const PLACES: readonly (readonly [string, number, number])[] = [
  ['US', 40.7128, -74.006],
  ['US', 34.0522, -118.2437],
  ['US', 41.8781, -87.6298],
  ['US', 29.7604, -95.3698],
  ['US', 25.7617, -80.1918],
  ['US', 47.6062, -122.3321],
  ['US', 39.7392, -104.9903],
  ['CA', 43.6532, -79.3832],
  ['CA', 45.5019, -73.5674],
  ['CA', 49.2827, -123.1207],
  ['CA', 51.0447, -114.0719],
  ['GB', 51.5074, -0.1278],
  ['GB', 53.4808, -2.2426],
  ['GB', 55.9533, -3.1883],
  ['DE', 52.52, 13.405],
  ['DE', 48.1351, 11.582],
  ['DE', 53.5511, 9.9937],
  ['FR', 48.8566, 2.3522],
  ['ES', 40.4168, -3.7038],
  ['IT', 41.9028, 12.4964],
  ['NL', 52.3676, 4.9041],
  ['IE', 53.3498, -6.2603],
  ['IN', 19.076, 72.8777],
  ['IN', 28.6139, 77.209],
  ['IN', 12.9716, 77.5946],
  ['IN', 22.5726, 88.3639],
  ['IN', 13.0827, 80.2707],
  ['AU', -33.8688, 151.2093],
  ['AU', -37.8136, 144.9631],
  ['AU', -27.4698, 153.0251],
  ['AU', -31.9505, 115.8605]
]

export const MAX_KM = 800

const EARTH_KM = 6371
const radians = (degrees: number): number => (degrees * Math.PI) / 180

/** Great-circle distance (haversine), in kilometres. */
export const distanceKm = (a: Coordinates, b: Coordinates): number => {
  const dLat = radians(b.latitude - a.latitude)
  const dLon = radians(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.latitude)) *
      Math.cos(radians(b.latitude)) *
      Math.sin(dLon / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h))
}

/** The country of the nearest reference city, or null when none is near. */
export const countryFromCoordinates = (where: Coordinates): string | null => {
  const nearest = PLACES.map(([country, latitude, longitude]) => ({
    country,
    km: distanceKm(where, { latitude, longitude })
  })).sort((a, b) => a.km - b.km)[0]
  return nearest !== undefined && nearest.km <= MAX_KM ? nearest.country : null
}

/** The region written in a locale (en-IN gives IN); null for "en" or nonsense. */
export const countryFromLocale = (locale: string): string | null => {
  try {
    return new Intl.Locale(locale).region ?? null
  } catch {
    return null
  }
}

const TIME_ZONES: Readonly<Record<string, string>> = {
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL',
  'Europe/Dublin': 'IE',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU'
}

export const countryFromTimeZone = (timeZone: string): string | null =>
  TIME_ZONES[timeZone] ?? null

export type CountrySource =
  | 'location'
  | 'locale'
  | 'timeZone'
  | 'default'
  | 'chosen'

export interface CustomerCountry {
  readonly country: string
  readonly source: CountrySource
}

/** The first guess, before (or without) the location. */
export const guessCountry = (
  locale: string,
  timeZone: string
): CustomerCountry => {
  const fromLocale = countryFromLocale(locale)
  if (fromLocale !== null) return { country: fromLocale, source: 'locale' }
  const fromZone = countryFromTimeZone(timeZone)
  if (fromZone !== null) return { country: fromZone, source: 'timeZone' }
  return { country: 'US', source: 'default' }
}

/** The parts of the browser this reads (a seam for tests). */
export interface BrowserPlace {
  readonly locale: string
  readonly timeZone: string
  readonly geolocation: Pick<Geolocation, 'getCurrentPosition'> | undefined
  readonly permissions: Pick<Permissions, 'query'> | undefined
}

export const browserPlace = (): BrowserPlace => ({
  locale: navigator.language,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  geolocation: navigator.geolocation,
  permissions: navigator.permissions
})

/** How long to wait for a position before keeping the guess. */
export const LOCATE_TIMEOUT_MS = 5000

/** The country at the browser's location when it is already allowed; null otherwise. */
export const locateCountry = async (
  place: BrowserPlace
): Promise<string | null> => {
  const { geolocation, permissions } = place
  if (geolocation === undefined || permissions === undefined) return null
  try {
    const status = await permissions.query({ name: 'geolocation' })
    if (status.state !== 'granted') return null
    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      geolocation.getCurrentPosition(resolve, reject, {
        timeout: LOCATE_TIMEOUT_MS,
        maximumAge: 60 * 60 * 1000
      })
    )
    return countryFromCoordinates(position.coords)
  } catch {
    return null
  }
}
