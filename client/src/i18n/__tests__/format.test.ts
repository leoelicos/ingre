import type { CountUnit } from '../../types/library'
import {
  formatCount,
  formatCountUnit,
  formatFraction,
  formatItemCount,
  formatItemUnit,
  formatMass,
  formatMeasure,
  formatNumber,
  formatQuantity,
  formatRecipeCount,
  pluralCount,
  rounded,
  translate
} from '..'

const CLOVE: CountUnit = { one: 'clove', other: 'cloves' }
const TOMATO: CountUnit = { one: 'tomato', other: 'tomatoes' }
const HEAD: CountUnit = { one: 'head', other: 'heads' }

const english = new Intl.PluralRules('en')

describe('plural edge cases: 0, 1, 2, 0.5 and 1.5', () => {
  it('whole numbers and 1.5 follow the English plural rules (Intl.PluralRules)', () => {
    expect([0, 1, 2, 1.5].map((n) => english.select(n))).toEqual([
      'other',
      'one',
      'other',
      'other'
    ])
    expect([0, 1, 2, 1.5].map((n) => formatCountUnit(n, CLOVE))).toEqual([
      'cloves',
      'clove',
      'cloves',
      'cloves'
    ])
    expect([0, 1, 2, 1.5].map((n) => formatItemUnit(n))).toEqual([
      'items',
      'item',
      'items',
      'items'
    ])
  })

  it('0.5 reads singular, as the list always has (#182: up to 1 is singular)', () => {
    expect(english.select(0.5)).toBe('other')
    expect(pluralCount(0.5)).toBe(1)
    expect(formatCountUnit(0.5, CLOVE)).toBe('clove')
    expect(formatItemUnit(0.5)).toBe('item')
    expect(formatQuantity(0.5, 'whole', TOMATO)).toBe('½ tomato')
    expect(formatQuantity(0.5, 'clove')).toBe('½ clove')
  })

  it('the count a word is chosen by: (0, 1] counts as 1, else the rounded amount', () => {
    expect([0, 0.001, 0.25, 1, 1.004, 1.5, 2].map(pluralCount)).toEqual([
      0, 0, 1, 1, 1, 1.5, 2
    ])
  })

  it('reads the same as the list: "1 clove", "2 cloves", "1 head", "2 tomatoes", "item/items"', () => {
    expect(formatQuantity(1, 'clove')).toBe('1 clove')
    expect(formatQuantity(2, 'clove')).toBe('2 cloves')
    expect(formatQuantity(1, 'whole', HEAD)).toBe('1 head')
    expect(formatQuantity(2, 'whole', TOMATO)).toBe('2 tomatoes')
    expect(formatQuantity(1.5, 'whole', TOMATO)).toBe('1½ tomatoes')
    expect(formatCount(1, null)).toBe('1 item')
    expect(formatCount(3, null)).toBe('3 items')
    expect(formatCount(0, null)).toBe('0 items')
  })
})

describe('measures', () => {
  it('cups, cloves, stalks and bunches pluralise', () => {
    expect(
      ['cup', 'clove', 'stalk', 'bunch'].map((m) => formatMeasure(2, m))
    ).toEqual(['cups', 'cloves', 'stalks', 'bunches'])
    expect(
      ['cup', 'clove', 'stalk', 'bunch'].map((m) => formatMeasure(1, m))
    ).toEqual(['cup', 'clove', 'stalk', 'bunch'])
  })

  it('spoons, weights and volumes never do', () => {
    expect(
      ['tsp', 'tbsp', 'g', 'ml', 'g tin', 'ml tin', 'kg', 'L'].map((m) =>
        formatMeasure(2, m)
      )
    ).toEqual(['tsp', 'tbsp', 'g', 'ml', 'g tin', 'ml tin', 'kg', 'L'])
  })

  it('a measure the locale does not know is shown as written', () => {
    expect(formatMeasure(2, 'pinch')).toBe('pinch')
    expect(formatQuantity(2, 'pinch')).toBe('2 pinch')
  })

  it('weights and volumes are plain decimals; other measures use quarter glyphs', () => {
    expect(formatQuantity(37.5, 'g')).toBe('37.5 g')
    expect(formatQuantity(400, 'g tin')).toBe('400 g tin')
    expect(formatQuantity(0.5, 'tbsp')).toBe('½ tbsp')
    expect(formatQuantity(1.75, 'cup')).toBe('1¾ cups')
  })

  it('mass and volume switch to kg and L from 1000, abbreviated and never pluralised', () => {
    expect(formatMass(250, 'g')).toBe('250 g')
    expect(formatMass(1000, 'g')).toBe('1 kg')
    expect(formatMass(2500, 'g')).toBe('2.5 kg')
    expect(formatMass(1500, 'ml')).toBe('1.5 L')
    expect(formatMass(999.999, 'ml')).toBe('1000 ml')
  })
})

describe('numbers (Intl.NumberFormat)', () => {
  it('two decimals at most, no grouping, never "-0"', () => {
    expect(formatNumber(37.5)).toBe('37.5')
    expect(formatNumber(1 / 3)).toBe('0.33')
    expect(formatNumber(12500)).toBe('12500')
    expect(formatNumber(-0.001)).toBe('0')
    expect(rounded(2.345)).toBe(2.35)
  })

  it('quarters read as glyphs, other fractions as decimals', () => {
    expect([0.25, 0.5, 0.75, 1.25, 2, 0.3].map(formatFraction)).toEqual([
      '¼',
      '½',
      '¾',
      '1¼',
      '2',
      '0.3'
    ])
  })
})

describe('counted phrases', () => {
  it('recipes and items: 0, 1 and 2', () => {
    expect([0, 1, 2].map(formatRecipeCount)).toEqual([
      '0 recipes',
      '1 recipe',
      '2 recipes'
    ])
    expect([0, 1, 2].map(formatItemCount)).toEqual([
      '0 items',
      '1 item',
      '2 items'
    ])
  })

  it('messages fill in their values', () => {
    expect(translate('filter.hidden', { count: 3 })).toBe('3 hidden by filter')
    expect(translate('explore.noMatches', { query: 'kale' })).toBe(
      'No matches for ‘kale’'
    )
  })
})
