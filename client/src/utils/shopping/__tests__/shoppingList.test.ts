import {
  FREE_TEXT_SECTION,
  GENERIC_COUNT_UNIT,
  amountText,
  countUnitOf,
  countWord,
  displayName,
  fraction,
  groupBy,
  measureWord,
  pluralise,
  rounded,
  singularise
} from '../shoppingList'

const ONION = { countUnit: { one: 'onion', other: 'onions' } }

describe('groupBy', () => {
  const items = [
    { k: 'b', v: 1 },
    { k: 'z', v: 2 },
    { k: 'a', v: 3 },
    { k: 'b', v: 4 },
    { k: 'y', v: 5 }
  ]
  it('orders by the given order, then unknown keys alphabetically', () => {
    expect(groupBy(items, (i) => i.k, ['b', 'a'])).toEqual([
      { key: 'b', items: [items[0], items[3]] },
      { key: 'a', items: [items[2]] },
      { key: 'y', items: [items[4]] },
      { key: 'z', items: [items[1]] }
    ])
  })
  it('is alphabetical without an order and omits empty groups', () => {
    expect(groupBy(items, (i) => i.k).map((g) => g.key)).toEqual([
      'a',
      'b',
      'y',
      'z'
    ])
    expect(groupBy([], (i: { k: string }) => i.k)).toEqual([])
  })
})

describe('fractions and plurals', () => {
  it('shows quarters as glyphs, other decimals as numbers', () => {
    expect(fraction(0.25)).toBe('¼')
    expect(fraction(0.5)).toBe('½')
    expect(fraction(0.75)).toBe('¾')
    expect(fraction(1.5)).toBe('1½')
    expect(fraction(2)).toBe('2')
    expect(fraction(0.3)).toBe('0.3')
  })
  it('pluralises English nouns', () => {
    expect(pluralise('egg')).toBe('eggs')
    expect(pluralise('eggs')).toBe('eggs')
    expect(pluralise('tomatoes')).toBe('tomatoes')
    expect(pluralise('tomato')).toBe('tomatoes')
    expect(pluralise('potato')).toBe('potatoes')
    expect(pluralise('clove')).toBe('cloves')
    expect(pluralise('curry leaf')).toBe('curry leaves')
    expect(pluralise('red chilli')).toBe('red chillies')
    expect(pluralise('rice paper sheets')).toBe('rice paper sheets')
    expect(pluralise('bunch')).toBe('bunches')
    expect(pluralise('berry')).toBe('berries')
    expect(pluralise('day')).toBe('days')
    expect(singularise('eggs')).toBe('egg')
    expect(singularise('tomatoes')).toBe('tomato')
    expect(singularise('rice paper sheets')).toBe('rice paper sheet')
    expect(singularise('hummus')).toBe('hummus')
    expect(singularise('lime')).toBe('lime')
  })
  it('rounds to two decimals', () => {
    expect(rounded(1 / 3)).toBe(0.33)
    expect(rounded(37.5)).toBe(37.5)
  })
})

describe('amounts in recipe units (#182)', () => {
  it('writes weights and volumes as decimals, others as fractions, whole items in their own unit', () => {
    expect(amountText(37.5, 'g')).toBe('37.5 g')
    expect(amountText(400, 'g tin')).toBe('400 g tin')
    expect(amountText(0.5, 'tbsp')).toBe('½ tbsp')
    expect(amountText(2, 'tbsp')).toBe('2 tbsp')
    expect(amountText(1.5, 'clove')).toBe('1½ cloves')
    expect(amountText(0.5, 'cup')).toBe('½ cup')
    expect(amountText(1, 'bunch')).toBe('1 bunch')
    expect(amountText(0, 'cup')).toBe('0 cups')
    expect(amountText(2, 'whole')).toBe('2 items')
    expect(amountText(1, 'whole', null)).toBe('1 item')
    expect(amountText(0.5, 'whole', ONION)).toBe('½ onion')
    expect(amountText(2, 'whole', ONION)).toBe('2 onions')
    expect(measureWord(3, 'stalk')).toBe('stalks')
    expect(measureWord(3, 'whole')).toBe('items')
    expect(measureWord(0, 'whole', ONION)).toBe('onions')
  })

  it('counted items spell their unit out, singular up to 1 (owner decision 2)', () => {
    expect(countUnitOf(null)).toEqual(GENERIC_COUNT_UNIT)
    expect(countUnitOf({})).toEqual({ one: 'item', other: 'items' })
    expect(countUnitOf(ONION)).toEqual(ONION.countUnit)
    expect(countWord(1, ONION)).toBe('onion')
    expect(countWord(1.5, ONION)).toBe('onions')
  })

  it('capitalises names; free text sits in Other', () => {
    expect(displayName({ name: 'brown onion' })).toBe('Brown onion')
    expect(FREE_TEXT_SECTION).toBe('Other')
  })
})
