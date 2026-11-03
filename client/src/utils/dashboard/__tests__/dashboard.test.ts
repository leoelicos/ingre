import type { Chip } from '../../chips/chips'
import { catalogue } from '../../library/recipeLibrary'
import {
  NO_MACROS,
  NUTRITION,
  WEIGHED_PRICE_GRAMS,
  addMacros,
  costOf,
  gramsOf,
  lineOf,
  onList,
  packsOf,
  parseNutrition,
  scaled,
  summarise
} from '../dashboard'
import { PRICES } from '../../suggest/suggest'

/* #232: the dashboard's arithmetic, on chips built by hand. */

const itemById = (id: string) => {
  const found = catalogue.find((item) => item.id === id)
  if (found === undefined) throw new Error(`no item ${id}`)
  return found
}

const chipOf = (
  id: string,
  amount: number,
  unit: 'g' | 'ml' | 'count',
  extra: Partial<Chip> = {}
): Chip => {
  const item = itemById(id)
  return {
    id,
    name: item.name,
    item,
    unit,
    sources: [],
    total: { amount, unit },
    extra: null,
    section: 'Pantry',
    group: 'Pantry',
    crossed: false,
    greyed: false,
    customised: false,
    ...extra
  }
}

const freeText = (): Chip => ({
  ...chipOf('salt', 1, 'count'),
  id: 'free-1',
  name: 'foil',
  item: null
})

describe('parseNutrition', () => {
  it('reads the bundled file: every item has a row', () => {
    expect(NUTRITION.get('olive-oil')).toEqual({
      kj: 3700,
      protein: 0,
      fat: 100,
      carbs: 0
    })
    catalogue.forEach((item) => expect(NUTRITION.has(item.id)).toBe(true))
  })

  it('fails loudly on bad data', () => {
    expect(() => parseNutrition(null)).toThrow('nutrition: expected an object')
    expect(() => parseNutrition({})).toThrow('"per100g" object')
    expect(() => parseNutrition({ per100g: { egg: 5 } })).toThrow(
      'egg needs an object'
    )
    expect(() =>
      parseNutrition({
        per100g: { egg: { kj: -1, protein: 1, fat: 1, carbs: 1 } }
      })
    ).toThrow('egg.kj needs a number of zero or more')
    expect(
      parseNutrition({
        per100g: { egg: { kj: 600, protein: 12, fat: 9, carbs: 0 } }
      }).get('egg')
    ).toEqual({ kj: 600, protein: 12, fat: 9, carbs: 0 })
  })
})

describe('amounts', () => {
  it('turns a chip total into grams, ml as grams, counts by weight', () => {
    expect(gramsOf(chipOf('plain-flour', 250, 'g'))).toBe(250)
    expect(gramsOf(chipOf('full-cream-milk', 300, 'ml'))).toBe(300)
    expect(gramsOf(chipOf('onion', 2, 'count'))).toBe(300)
    expect(gramsOf(chipOf('beef-mince', 500, 'g', { item: null }))).toBeNull()
    expect(gramsOf(chipOf('bacon', 2, 'count'))).toBeNull()
  })

  it('scales and adds macros', () => {
    const per100g = { kj: 1000, protein: 10, fat: 5, carbs: 50 }
    expect(scaled(per100g, 250)).toEqual({
      kj: 2500,
      protein: 25,
      fat: 12.5,
      carbs: 125
    })
    expect(addMacros(NO_MACROS, per100g)).toEqual(per100g)
  })
})

describe('packs and cost', () => {
  it('buys whole packs of the priced size, at least one', () => {
    expect(packsOf(chipOf('plain-flour', 250, 'g'))).toBe(1)
    expect(packsOf(chipOf('plain-flour', 1000, 'g'))).toBe(1)
    expect(packsOf(chipOf('plain-flour', 1001, 'g'))).toBe(2)
    expect(packsOf(chipOf('onion', 3, 'count'))).toBe(3)
    expect(packsOf(chipOf('egg', 7, 'count'))).toBe(2)
  })

  it('prices a weighed item per 500 g', () => {
    expect(WEIGHED_PRICE_GRAMS).toBe(500)
    expect(packsOf(chipOf('beef-rump', 1000, 'g'))).toBe(2)
    expect(costOf(chipOf('beef-rump', 250, 'g'), PRICES)).toBe(5.5)
  })

  it('is one pack when the amount cannot be compared', () => {
    expect(packsOf(chipOf('bacon', 2, 'count'))).toBe(1)
    expect(packsOf(chipOf('beef-rump', 2, 'count'))).toBe(1)
    expect(packsOf(freeText())).toBe(1)
  })

  it('costs a chip in dollars and cents, or null with no price', () => {
    expect(costOf(chipOf('onion', 3, 'count'), PRICES)).toBe(2.4)
    expect(costOf(chipOf('onion', 3, 'count'), new Map())).toBeNull()
  })
})

describe('lines and the summary', () => {
  it('a line has macros and cost, or nulls', () => {
    const line = lineOf(chipOf('plain-flour', 500, 'g'), NUTRITION, PRICES)
    expect(line.macros?.kj).toBe(7500)
    expect(line.cost).toBe(2)
    expect(lineOf(freeText(), NUTRITION, PRICES)).toMatchObject({
      macros: null,
      cost: null
    })
    expect(
      lineOf(chipOf('onion', 1, 'count'), new Map(), PRICES).macros
    ).toBeNull()
  })

  it('leaves out greyed chips', () => {
    const chips = [
      chipOf('salt', 5, 'g'),
      chipOf('onion', 0, 'count', { greyed: true })
    ]
    expect(onList(chips)).toHaveLength(1)
  })

  it('totals cost and macros, spreads cost over sections, names the gaps', () => {
    const chips = [
      chipOf('plain-flour', 500, 'g', { section: 'Pantry' }),
      chipOf('onion', 2, 'count', { section: 'Fruit & Veg' }),
      chipOf('carrot', 1, 'count', { section: 'Fruit & Veg' }),
      freeText()
    ]
    const dashboard = summarise(chips)
    expect(dashboard.items).toBe(4)
    expect(dashboard.cost).toBe(4.3)
    expect(dashboard.macros.kj).toBeCloseTo(7500 + 160 * 3 + 150 * 1.2, 5)
    expect(dashboard.noPrice).toEqual(['foil'])
    expect(dashboard.noMacros).toEqual(['foil'])
    expect(dashboard.spread).toEqual([
      { section: 'Fruit & Veg', items: 2, cost: 2.3, percent: 53 },
      { section: 'Pantry', items: 2, cost: 2, percent: 47 }
    ])
  })

  it('an empty list is zeros with no spread', () => {
    expect(summarise([])).toEqual({
      items: 0,
      macros: NO_MACROS,
      cost: 0,
      noMacros: [],
      noPrice: [],
      spread: []
    })
  })

  it('a list with nothing priced has no percentages', () => {
    const dashboard = summarise([freeText()])
    expect(dashboard.spread).toEqual([
      { section: 'Pantry', items: 1, cost: 0, percent: 0 }
    ])
  })
})
