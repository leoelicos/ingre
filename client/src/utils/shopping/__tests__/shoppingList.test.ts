import { libIngredient } from '../../../test/fixtures'
import type {
  Amount,
  BaseUnit,
  LibraryRecipe,
  SoldOption,
  SoldType
} from '../../../types/library'
import { catalogue, library } from '../../library/recipeLibrary'
import { SHOP_SECTIONS, placeInShop } from '../sections'
import {
  buildShoppingList,
  chooseBuy,
  collectNeeds,
  forLabel,
  groupBy,
  mergeById,
  needLabel,
  shopLabel,
  splitByHave,
  toShopUnits,
  totalNeed,
  withLocations,
  partLabel
} from '../shoppingList'

const recipe = (
  name: string,
  ingredients: LibraryRecipe['ingredients'],
  portions = 1
): LibraryRecipe => ({
  id: name,
  name,
  portions,
  tags: [],
  ingredients,
  method: []
})

const onion = libIngredient({ approxGrams: 150 })
const mince = libIngredient({
  id: 'mince',
  name: 'beef mince',
  category: 'meat',
  pantry: 'Fridge',
  sold: [
    { type: 'pack', size: { amount: 500, unit: 'g' } },
    { type: 'pack', size: { amount: 1000, unit: 'g' } },
    { type: 'weighed', size: null }
  ]
})

describe('collectNeeds', () => {
  it('scales per-serve quantities by people and portions', () => {
    const needs = collectNeeds(
      [
        recipe('Dahl', [
          { ingredientId: 'onion', quantity: 0.5, measure: 'whole' }
        ]),
        recipe(
          'Curry',
          [{ ingredientId: 'onion', quantity: 2, measure: 'whole' }],
          4
        )
      ],
      2
    )
    expect(needs).toEqual([
      { ingredientId: 'onion', recipe: 'Dahl', quantity: 1, measure: 'whole' },
      { ingredientId: 'onion', recipe: 'Curry', quantity: 1, measure: 'whole' }
    ])
  })
})

describe('mergeById', () => {
  it('groups parts by ingredient in first-seen order', () => {
    const a = { ingredientId: 'a', recipe: 'X', quantity: 1, measure: 'g' }
    const b = { ingredientId: 'b', recipe: 'X', quantity: 1, measure: 'g' }
    const a2 = { ...a, recipe: 'Y' }
    expect(mergeById([a, b, a2])).toEqual([
      { ingredientId: 'a', parts: [a, a2] },
      { ingredientId: 'b', parts: [b] }
    ])
  })
})

describe('totalNeed', () => {
  it('sums parts in the first pack unit, converting measures', () => {
    expect(
      totalNeed(
        [
          { ingredientId: 'mince', recipe: 'A', quantity: 100, measure: 'g' },
          { ingredientId: 'mince', recipe: 'B', quantity: 1, measure: 'cup' }
        ],
        mince
      )
    ).toEqual({ need: { amount: 350, unit: 'g' }, convertible: true })
  })
  it('falls back to raw quantities when a part cannot convert', () => {
    const sheets = libIngredient({
      sold: [{ type: 'pack', size: { amount: 250, unit: 'g' } }]
    })
    const part = {
      ingredientId: 'x',
      recipe: 'R',
      quantity: 4,
      measure: 'whole'
    }
    expect(totalNeed([part, part], sheets)).toEqual({
      need: { amount: 8, unit: 'count' },
      convertible: false
    })
    const unknown = { ...part, measure: 'pinch' }
    expect(totalNeed([unknown], sheets).need.unit).toBe('count')
  })
  it('uses grams when only weighed', () => {
    const ginger = libIngredient({ sold: [{ type: 'weighed', size: null }] })
    expect(
      totalNeed(
        [{ ingredientId: 'g', recipe: 'R', quantity: 1, measure: 'tbsp' }],
        ginger
      ).need
    ).toEqual({ amount: 20, unit: 'g' })
  })
})

describe('chooseBuy', () => {
  it('picks the pack with least leftover, then fewer packs', () => {
    expect(chooseBuy({ amount: 400, unit: 'g' }, true, mince)).toEqual({
      kind: 'packs',
      option: mince.sold[0],
      count: 1
    })
    expect(chooseBuy({ amount: 900, unit: 'g' }, true, mince)).toEqual({
      kind: 'packs',
      option: mince.sold[1],
      count: 1
    })
  })
  it('rounds counted items up to whole units', () => {
    expect(chooseBuy({ amount: 1.2, unit: 'count' }, true, onion)).toEqual({
      kind: 'packs',
      option: onion.sold[0],
      count: 2
    })
  })
  it('weighs loose items to the next 50 g when nothing else is sold', () => {
    const ginger = libIngredient({ sold: [{ type: 'weighed', size: null }] })
    expect(chooseBuy({ amount: 60, unit: 'g' }, true, ginger)).toEqual({
      kind: 'weighed',
      amount: { amount: 100, unit: 'g' }
    })
    expect(chooseBuy({ amount: 2, unit: 'count' }, false, ginger)).toEqual({
      kind: 'weighed',
      amount: { amount: 2, unit: 'count' }
    })
  })
  it('buys one smallest pack when the need cannot be converted', () => {
    const paper = libIngredient({
      sold: [
        { type: 'pack', size: { amount: 375, unit: 'g' } },
        { type: 'pack', size: { amount: 250, unit: 'g' } }
      ]
    })
    expect(chooseBuy({ amount: 8, unit: 'count' }, false, paper)).toEqual({
      kind: 'packs',
      option: paper.sold[1],
      count: 1
    })
    expect(chooseBuy({ amount: 8, unit: 'count' }, true, paper)).toEqual({
      kind: 'packs',
      option: paper.sold[1],
      count: 1
    })
  })
})

describe('toShopUnits', () => {
  it('builds lines with section, location, staple flag and recipe names', () => {
    const salt = libIngredient({
      id: 'salt',
      name: 'salt',
      category: 'herbs & spices',
      staple: true,
      pantry: 'Spice rack',
      sold: [{ type: 'jar', size: { amount: 125, unit: 'g' } }]
    })
    const lines = toShopUnits([onion, salt])([
      {
        ingredientId: 'onion',
        parts: [
          { ingredientId: 'onion', recipe: 'A', quantity: 1, measure: 'whole' },
          { ingredientId: 'onion', recipe: 'A', quantity: 1, measure: 'whole' }
        ]
      },
      {
        ingredientId: 'salt',
        parts: [
          { ingredientId: 'salt', recipe: 'B', quantity: 1, measure: 'tsp' }
        ]
      },
      { ingredientId: 'ghost', parts: [] }
    ])
    expect(
      lines.map((l) => [
        l.ingredientId,
        l.section,
        l.subsection,
        l.location,
        l.staple,
        l.recipes
      ])
    ).toEqual([
      ['onion', 'Fruit & Veg', null, 'Cupboard', false, ['A']],
      ['salt', 'Pantry', 'Herbs & spices', 'Spice rack', true, ['B']]
    ])
  })
})

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

describe('splitByHave / withLocations', () => {
  const lines = buildShoppingList(
    [
      recipe('A', [
        { ingredientId: 'onion', quantity: 1, measure: 'whole' },
        { ingredientId: 'mince', quantity: 100, measure: 'g' }
      ])
    ],
    1,
    [onion, mince]
  )
  it('moves ticked ids to alreadyHave', () => {
    const { toBuy, alreadyHave } = splitByHave(lines, new Set(['onion']))
    expect(toBuy.map((l) => l.ingredientId)).toEqual(['mince'])
    expect(alreadyHave.map((l) => l.ingredientId)).toEqual(['onion'])
  })
  it('overrides home locations without mutating', () => {
    const moved = withLocations(lines, { onion: 'Bench' })
    expect(moved.map((l) => l.location)).toEqual(['Bench', 'Fridge'])
    expect(lines[0]?.location).toBe('Cupboard')
  })
})

const sized = (
  type: SoldType,
  amount: number,
  unit: BaseUnit,
  label?: string
): SoldOption & { size: Amount } =>
  label === undefined
    ? { type, size: { amount, unit } }
    : { type, size: { amount, unit }, label }

describe('labels', () => {
  const name = 'brown onion'
  const packs = (option: SoldOption & { size: Amount }, count: number) =>
    shopLabel({ name, buy: { kind: 'packs', option, count } })
  it('formats each, labelled each, bunch, packs, counted packs and weighed', () => {
    expect(packs(sized('each', 1, 'count'), 2)).toBe('Brown onion, 2')
    expect(packs(sized('each', 0.5, 'count', 'half'), 1)).toBe(
      'Brown onion, 1 × half'
    )
    expect(packs(sized('bunch', 1, 'count'), 1)).toBe('Brown onion, 1 bunch')
    expect(packs(sized('bunch', 1, 'count'), 2)).toBe('Brown onion, 2 bunches')
    expect(packs(sized('tin', 400, 'g'), 3)).toBe('Brown onion, 3 × 400 g tin')
    expect(packs(sized('pack', 400, 'g', 'block'), 1)).toBe(
      'Brown onion, 1 × 400 g block'
    )
    expect(packs(sized('carton', 6, 'count'), 1)).toBe(
      'Brown onion, 1 × carton of 6'
    )
    expect(packs(sized('pack', 3, 'count', '3-pack'), 1)).toBe(
      'Brown onion, 1 × 3-pack'
    )
    expect(
      shopLabel({
        name,
        buy: { kind: 'weighed', amount: { amount: 100, unit: 'g' } }
      })
    ).toBe('Brown onion, 100 g')
  })
  it('formats need and recipe lists', () => {
    expect(needLabel({ need: { amount: 1.5, unit: 'count' } })).toBe('need 1.5')
    expect(forLabel([])).toBe('')
    expect(forLabel(['Butter chicken'])).toBe('for butter chicken')
    expect(forLabel(['Butter chicken', 'Red lentil dahl'])).toBe(
      'for butter chicken and red lentil dahl'
    )
    expect(forLabel(['A', 'Shaking beef (bò lúc lắc)', 'C'])).toBe(
      'for a, shaking beef and c'
    )
  })
})

describe('real library', () => {
  it('prices every recipe for 2 people with a known section per line', () => {
    const lines = buildShoppingList(library, 2, catalogue)
    expect(lines.length).toBeGreaterThan(50)
    for (const line of lines) expect(SHOP_SECTIONS).toContain(line.section)
    const garlic = lines.find((l) => l.ingredientId === 'garlic')
    expect(garlic && shopLabel(garlic)).toMatch(/^Garlic, \d/)
    const paper = lines.find((l) => l.ingredientId === 'rice-paper')
    expect(paper && shopLabel(paper)).toBe('Rice paper sheets, 1 × 250 g pack')
  })
  it('maps every aisle into a section, Pantry aisles as subsections', () => {
    expect(placeInShop('meat')).toEqual({
      section: 'Meat & Seafood',
      subsection: null
    })
    expect(placeInShop('canned food')).toEqual({
      section: 'Pantry',
      subsection: 'Canned food'
    })
  })
})

describe('partLabel', () => {
  it('shows the recipe title and amount, dropping "whole"', () => {
    expect(
      partLabel({
        ingredientId: 'x',
        recipe: 'Shaking beef (bò lúc lắc)',
        quantity: 1.333333,
        measure: 'tbsp'
      })
    ).toBe('Shaking beef: 1.33 tbsp')
    expect(
      partLabel({
        ingredientId: 'x',
        recipe: 'Dahl',
        quantity: 2,
        measure: 'whole'
      })
    ).toBe('Dahl: 2')
  })
})
