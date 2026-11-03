import type { LibraryIngredient, LibraryRecipe } from '../../../types/library'
import { catalogue } from '../../library/recipeLibrary'
import {
  MAX_SUGGESTIONS,
  bundledSuggestions,
  PRICES,
  parsePrices,
  suggest,
  suggestionsFor
} from '../suggest'

/* Acceptance for #204: select ingredients, get suggestions with what is missing and the extra cost. */

const item = (id: string, staple = false): LibraryIngredient => ({
  id,
  name: id,
  category: 'fruit & veg',
  sold: [],
  pantry: 'Fridge',
  allergens: [],
  ...(staple ? { staple } : {})
})

const recipe = (id: string, ...ids: string[]): LibraryRecipe => ({
  id,
  name: id,
  portions: 1,
  ingredients: ids.map((ingredientId) => ({
    ingredientId,
    quantity: 1,
    measure: 'whole'
  })),
  method: []
})

const items = ['a', 'b', 'c', 'd'].map((id) => item(id)).concat(item('s', true))
const prices: ReadonlyMap<string, number> = new Map([
  ['a', 1],
  ['b', 2.5],
  ['c', 4],
  ['d', 8],
  ['s', 1]
])
const ids = (...list: string[]): ReadonlySet<string> => new Set(list)

describe('suggest: recipes that use what was selected (#204)', () => {
  it('suggests nothing until something is selected', () => {
    expect(suggest(ids(), [recipe('r', 'a')], items, prices)).toEqual([])
  })

  it('skips recipes that use none of the selection', () => {
    expect(suggest(ids('d'), [recipe('r', 'a', 'b')], items, prices)).toEqual(
      []
    )
  })

  it('lists what is missing and adds up its cost', () => {
    const [first] = suggest(
      ids('a'),
      [recipe('r', 'a', 'b', 'c')],
      items,
      prices
    )
    expect(first?.missing.map((m) => m.id)).toEqual(['b', 'c'])
    expect(first?.have.map((m) => m.id)).toEqual(['a'])
    expect(first?.cost).toBe(6.5)
  })

  it('never counts a pantry staple as missing', () => {
    const [first] = suggest(ids('a'), [recipe('r', 'a', 's')], items, prices)
    expect(first?.missing).toEqual([])
    expect(first?.cost).toBe(0)
  })

  it('counts an item with no price as free rather than failing', () => {
    const [first] = suggest(ids('a'), [recipe('r', 'a', 'b')], items, new Map())
    expect(first?.cost).toBe(0)
  })

  it('ignores a recipe ingredient that is not in the catalogue', () => {
    const [first] = suggest(ids('a'), [recipe('r', 'a', 'zzz')], items, prices)
    expect(first?.missing).toEqual([])
  })

  it('ranks by most ingredients you have, then fewest missing, then name', () => {
    const recipes = [
      recipe('z-one', 'a', 'b'),
      recipe('a-one', 'a', 'b'),
      recipe('both', 'a', 'b', 'c', 'd'),
      recipe('lean', 'a', 'b', 'c')
    ]
    expect(
      suggest(ids('a', 'b'), recipes, items, prices).map((s) => s.recipe.id)
    ).toEqual(['a-one', 'z-one', 'lean', 'both'])
  })
})

describe('suggestionsFor: the few the page shows', () => {
  it('shows at most three (#206: proactive 1–3)', () => {
    expect(MAX_SUGGESTIONS).toBe(3)
    const recipes = ['1', '2', '3', '4'].map((id) => recipe(id, 'a'))
    const shown = suggestionsFor(ids('a'), recipes, items, prices)
    expect(shown.map((s) => s.recipe.id)).toEqual(['1', '2', '3'])
  })

  it('works on the bundled library: apple and onion lead to pork chops, missing the chop and butter', () => {
    const [first] = bundledSuggestions(ids('apple', 'onion'))
    expect(first?.recipe.id).toBe('pork-chops-apple-onion')
    expect(first?.missing.map((m) => m.id)).toEqual([
      'pork-loin-chop',
      'butter'
    ])
    expect(first?.cost).toBe(14)
  })
})

describe('parsePrices: the bundled price file fails loudly when wrong', () => {
  it('has a price for every catalogue ingredient', () => {
    expect(catalogue.filter((i) => !PRICES.has(i.id))).toEqual([])
    expect(PRICES.size).toBe(catalogue.length)
  })

  it('reads a price table into a map', () => {
    expect(parsePrices({ prices: { a: 1.5 } }).get('a')).toBe(1.5)
  })

  it.each([
    ['not an object', 3],
    ['no prices', {}],
    ['prices not an object', { prices: [] }],
    ['a price that is not a number', { prices: { a: 'x' } }],
    ['a price of zero or less', { prices: { a: 0 } }],
    ['a price that is not finite', { prices: { a: Infinity } }]
  ])('rejects %s', (_name, data) => {
    expect(() => parsePrices(data)).toThrow('prices')
  })
})
