import { itemById } from '../../../test/library'
import {
  convert,
  countText,
  formatAmount,
  itemUnit,
  partsOf,
  toBase,
  unitMeasure
} from '../units'

describe('toBase', () => {
  it.each([
    [2, 'g', { amount: 2, unit: 'g' }],
    [100, 'g tin', { amount: 100, unit: 'g' }],
    [3, 'ml', { amount: 3, unit: 'ml' }],
    [67.5, 'ml tin', { amount: 67.5, unit: 'ml' }],
    [1, 'tsp', { amount: 5, unit: 'ml' }],
    [1, 'tbsp', { amount: 20, unit: 'ml' }],
    [0.5, 'cup', { amount: 125, unit: 'ml' }],
    [1.5, 'whole', { amount: 1.5, unit: 'count' }],
    [0.25, 'bunch', { amount: 0.25, unit: 'count' }]
  ])('%s %s', (quantity, measure, expected) => {
    expect(toBase(quantity, measure, {})).toEqual(expected)
  })
  it('uses item measureGrams for clove/stalk, else null', () => {
    expect(toBase(2, 'clove', { measureGrams: { clove: 6 } })).toEqual({
      amount: 12,
      unit: 'g'
    })
    expect(toBase(2, 'clove', {})).toBeNull()
  })
})

describe('convert', () => {
  it('keeps same units and treats g and ml as equal', () => {
    expect(convert({ amount: 5, unit: 'g' }, 'g', {})).toBe(5)
    expect(convert({ amount: 5, unit: 'ml' }, 'g', {})).toBe(5)
  })
  it('converts counts via approxGrams both ways', () => {
    expect(
      convert({ amount: 2, unit: 'count' }, 'g', { approxGrams: 150 })
    ).toBe(300)
    expect(
      convert({ amount: 300, unit: 'g' }, 'count', { approxGrams: 150 })
    ).toBe(2)
  })
  it('returns null without approxGrams', () => {
    expect(convert({ amount: 2, unit: 'count' }, 'g', {})).toBeNull()
  })
})

describe('formatAmount', () => {
  it('formats counts, small and large masses', () => {
    expect(formatAmount({ amount: 1.456, unit: 'count' })).toBe('1.46 items')
    expect(formatAmount({ amount: 250, unit: 'g' })).toBe('250 g')
    expect(formatAmount({ amount: 1000, unit: 'g' })).toBe('1 kg')
    expect(formatAmount({ amount: 1500, unit: 'ml' })).toBe('1.5 L')
  })
})

describe('item units (#182)', () => {
  it('totals in the first sized sold unit, grams when only weighed, count for free text', () => {
    expect(
      itemUnit({ sold: [{ type: 'carton', size: { amount: 1, unit: 'ml' } }] })
    ).toBe('ml')
    expect(itemUnit({ sold: [{ type: 'weighed', size: null }] })).toBe('g')
    expect(itemUnit(null)).toBe('count')
    expect(unitMeasure('count')).toBe('whole')
    expect(unitMeasure('g')).toBe('g')
  })
})

describe('counted totals (owner decision 2, #182)', () => {
  const garlic = itemById('garlic')
  const eggs = itemById('egg')
  const springOnion = itemById('spring-onion')

  it('read in the item unit, singular up to 1', () => {
    expect(countText(1, eggs)).toBe('1 egg')
    expect(countText(12, eggs)).toBe('12 eggs')
    expect(countText(0, eggs)).toBe('0 eggs')
    expect(countText(1.5, itemById('onion'))).toBe('1½ onions')
    expect(formatAmount({ amount: 2, unit: 'count' }, null)).toBe('2 items')
  })

  it('items used in parts read in parts until the total is whole', () => {
    expect(countText(0.3, garlic)).toBe('3 cloves')
    expect(countText(0.1, garlic)).toBe('1 clove')
    expect(countText(1.3, garlic)).toBe('13 cloves')
    expect(countText(1, garlic)).toBe('1 head')
    expect(countText(2, garlic)).toBe('2 heads')
    expect(countText(0.2, springOnion)).toBe('2 stalks')
    expect(countText(1, springOnion)).toBe('1 bunch')
  })

  it('has no parts without a part measure, an item weight and a part weight', () => {
    expect(partsOf(0.5, null)).toBeNull()
    expect(partsOf(0.5, eggs)).toBeNull()
    expect(partsOf(0.5, { partMeasure: 'clove', approxGrams: 60 })).toBeNull()
    expect(
      partsOf(0.5, { partMeasure: 'clove', measureGrams: { clove: 6 } })
    ).toBeNull()
    expect(
      partsOf(0.5, {
        partMeasure: 'clove',
        approxGrams: 60,
        measureGrams: { tbsp: 6 }
      })
    ).toBeNull()
    expect(partsOf(0.5, garlic)).toEqual({ quantity: 5, measure: 'clove' })
  })
})
