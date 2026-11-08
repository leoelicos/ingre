export interface CountryPin {
  id: string
  name: string
  location: [number, number] // [lat, lng]
  recipes?: number
}
