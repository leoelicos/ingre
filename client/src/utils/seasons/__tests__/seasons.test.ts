import seasonData from '../../../data/seasons.json'
import { catalogue, library } from '../../library/recipeLibrary'
import {
  SeasonDataError,
  inSeason,
  monthIn,
  parseSeasons,
  seasonalIngredients,
  seasonalRecipes,
  seasonsIn
} from '../seasons'

const calendar = parseSeasons({
  region: 'sydney',
  timeZone: 'Australia/Sydney',
  ingredients: { tomato: [11, 12, 1], apple: [3, 4] }
})

describe('seasonal calendar (#218)', () => {
  it('is Sydney, with months 1 to 12 per ingredient', () => {
    expect(calendar.region).toBe('sydney')
    expect(inSeason(calendar, 'tomato', 12)).toBe(true)
    expect(inSeason(calendar, 'tomato', 1)).toBe(true)
    expect(inSeason(calendar, 'tomato', 6)).toBe(false)
    expect(inSeason(calendar, 'unknown', 6)).toBe(false)
  })

  it('the bundled calendar parses and every ingredient is in the catalogue', () => {
    const bundled = parseSeasons(seasonData)
    const ids = new Set(catalogue.map((item) => item.id))
    expect(Object.keys(bundled.ingredients).length).toBeGreaterThan(10)
    for (const id of Object.keys(bundled.ingredients)) {
      expect(ids.has(id)).toBe(true)
    }
  })

  it('the bundled calendar has something in season every month, so the panel is never empty', () => {
    const bundled = parseSeasons(seasonData)
    for (let month = 1; month <= 12; month++) {
      expect(
        seasonalIngredients(bundled, month, catalogue).length
      ).toBeGreaterThan(0)
    }
  })

  it('seasonalIngredients lists catalogue items in season, in catalogue order', () => {
    expect(
      seasonalIngredients(calendar, 12, catalogue).map((i) => i.id)
    ).toEqual(['tomato'])
    expect(
      seasonalIngredients(calendar, 3, catalogue).map((i) => i.id)
    ).toEqual(['apple'])
    expect(seasonalIngredients(calendar, 7, catalogue)).toEqual([])
  })

  it('seasonalRecipes keeps recipes that use something in season, most seasonal first, without hiding the rest', () => {
    const ids = seasonalRecipes(library, calendar, 12, catalogue).map(
      (r) => r.recipe.id
    )
    expect(ids).toEqual(
      expect.arrayContaining(['greek-salad-haloumi', 'dahl', 'shaking-beef'])
    )
    expect(ids).not.toContain('egg-fried-rice')
    const first = seasonalRecipes(library, calendar, 12, catalogue)[0]
    expect(first?.recipe.id).toBe('greek-salad-haloumi')
    expect(first?.inSeason.map((i) => i.id)).toEqual(['tomato'])
    expect(seasonalRecipes(library, calendar, 7, catalogue)).toEqual([])
    // never reorders or hides the library itself
    expect(library.length).toBeGreaterThan(ids.length)
  })

  it('seasonsIn names the in-season ingredients of a recipe', () => {
    const dahl = library.find((r) => r.id === 'dahl')
    expect(
      dahl && seasonsIn(dahl, calendar, 12, catalogue).map((i) => i.id)
    ).toEqual(['tomato'])
  })

  it('monthIn reads the month in a time zone', () => {
    // 31 Oct 14:00 UTC is already 1 Nov in Sydney (UTC+11)
    const date = new Date('2026-10-31T14:00:00Z')
    expect(monthIn(date, 'Australia/Sydney')).toBe(11)
    expect(monthIn(date, 'UTC')).toBe(10)
  })

  it('rejects bad data loudly', () => {
    expect(() => parseSeasons(null)).toThrow(SeasonDataError)
    expect(() => parseSeasons({ region: 'sydney' })).toThrow(/timeZone/)
    expect(() =>
      parseSeasons({ region: 'sydney', timeZone: 'UTC', ingredients: [] })
    ).toThrow(/ingredients/)
    expect(() =>
      parseSeasons({
        region: 'sydney',
        timeZone: 'UTC',
        ingredients: { a: 'x' }
      })
    ).toThrow(/ingredients\.a/)
    expect(() =>
      parseSeasons({
        region: 'sydney',
        timeZone: 'UTC',
        ingredients: { a: [13] }
      })
    ).toThrow(/month/)
    expect(() =>
      parseSeasons({
        region: 'sydney',
        timeZone: 'UTC',
        ingredients: { a: [] }
      })
    ).toThrow(/ingredients\.a/)
  })
})
