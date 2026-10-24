import type { Buy, ShopLine } from '../../shopping/shoppingList'
import type { ChipLayout } from '../../storage/shoppingState'
import { EMPTY_LAYOUT } from '../../storage/shoppingState'
import type { Chip } from '../chips'
import {
  applyEdit,
  buildChips,
  categoryLabel,
  chipId,
  editFor,
  groupChips,
  needsSort,
  placementsOf,
  recipeCountText,
  rescaleBuy,
  sortLayout,
  startQuantity,
  withPlacements
} from '../chips'

const PACK: Buy = {
  kind: 'packs',
  option: { type: 'tin', size: { amount: 400, unit: 'g' } },
  count: 1
}

const line = (over: Partial<ShopLine> = {}): ShopLine => ({
  ingredientId: 'chickpeas',
  name: 'chickpeas',
  section: 'Pantry',
  subsection: null,
  location: 'Cupboard',
  staple: false,
  need: { amount: 400, unit: 'g' },
  buy: PACK,
  recipes: ['Curry'],
  parts: [],
  extraQuantity: null,
  ...over
})

describe('chip ids and labels', () => {
  it('uses the catalogue id for recipe lines and catalogue extras alike', () => {
    expect(chipId({ ingredientId: 'butter' })).toBe('butter')
    expect(chipId({ ingredientId: 'extra:butter' })).toBe('butter')
  })

  it('shortens Dairy, Eggs & Fridge to Dairy and keeps the rest', () => {
    expect(categoryLabel('Dairy, Eggs & Fridge')).toBe('Dairy')
    expect(categoryLabel('Fruit & Veg')).toBe('Fruit & Veg')
  })

  it('says how many recipes need a chip, or that it was added by hand', () => {
    expect(recipeCountText({ line: line({ recipes: [] }) })).toBe(
      'added by you'
    )
    expect(recipeCountText({ line: line() })).toBe('in 1 recipe')
    expect(recipeCountText({ line: line({ recipes: ['A', 'B'] }) })).toBe(
      'in 2 recipes'
    )
  })
})

describe('quantities', () => {
  it('starts at the pack or item count, the extra quantity, or 1 when weighed', () => {
    expect(startQuantity(line())).toBe(1)
    expect(startQuantity(line({ buy: { kind: 'count', count: 3 } }))).toBe(3)
    expect(
      startQuantity(
        line({ buy: { kind: 'weighed', amount: { amount: 450, unit: 'g' } } })
      )
    ).toBe(1)
    expect(startQuantity(line({ extraQuantity: 4 }))).toBe(4)
  })

  it('rescales packs and counts to the quantity, and weights in proportion', () => {
    expect(rescaleBuy(PACK, 1, 2)).toEqual({ ...PACK, count: 2 })
    expect(rescaleBuy({ kind: 'count', count: 3 }, 3, 5)).toEqual({
      kind: 'count',
      count: 5
    })
    expect(
      rescaleBuy({ kind: 'weighed', amount: { amount: 450, unit: 'g' } }, 1, 2)
    ).toEqual({ kind: 'weighed', amount: { amount: 900, unit: 'g' } })
  })

  it('applies an edit: category and quantity, or nothing', () => {
    expect(applyEdit(line(), { quantity: null, section: null })).toEqual(line())
    const edited = applyEdit(line(), { quantity: 2, section: 'Deli' })
    expect(edited.section).toBe('Deli')
    expect(edited.buy).toEqual({ ...PACK, count: 2 })
  })

  it('finds a chip edit, or none', () => {
    const edit = { quantity: 2, section: null }
    expect(editFor({ a: edit }, 'a')).toBe(edit)
    expect(editFor({}, 'a')).toEqual({ quantity: null, section: null })
  })
})

describe('layout', () => {
  it('places new chips at the end of their group, and leaves placed chips alone', () => {
    const placed = withPlacements(EMPTY_LAYOUT, [
      { id: 'a', section: 'Pantry' },
      { id: 'b', section: 'Deli' }
    ])
    expect(placed).toEqual({
      order: ['a', 'b'],
      placed: { a: 'Pantry', b: 'Deli' }
    })
    expect(withPlacements(placed, [{ id: 'a', section: 'Frozen' }])).toBe(
      placed
    )
  })

  it('sort moves every chip into the group of its current category', () => {
    const layout: ChipLayout = { order: ['a'], placed: { a: 'Pantry' } }
    expect(
      sortLayout(layout, [
        { id: 'a', section: 'Deli' },
        { id: 'b', section: 'Frozen' }
      ])
    ).toEqual({ order: ['a', 'b'], placed: { a: 'Deli', b: 'Frozen' } })
  })

  it('places chips by their edited category', () => {
    expect(
      placementsOf([line()], { chickpeas: { quantity: null, section: 'Deli' } })
    ).toEqual([{ id: 'chickpeas', section: 'Deli' }])
  })
})

describe('building and grouping chips', () => {
  const onion = line({
    ingredientId: 'onion',
    name: 'brown onion',
    section: 'Fruit & Veg'
  })
  const butter = line({
    ingredientId: 'extra:butter',
    name: 'butter',
    section: 'Dairy, Eggs & Fridge',
    recipes: [],
    extraQuantity: 1
  })

  it('keeps first-seen order, and puts unplaced chips last', () => {
    const chips = buildChips({
      lines: [onion, line(), butter],
      edits: {},
      layout: { order: ['butter', 'chickpeas'], placed: {} },
      crossedIds: new Set(['onion'])
    })
    expect(chips.map((chip) => chip.id)).toEqual([
      'butter',
      'chickpeas',
      'onion'
    ])
    const [first, , last] = chips
    expect(first).toMatchObject({ extra: true, crossed: false, quantity: 1 })
    expect(last).toMatchObject({
      extra: false,
      crossed: true,
      group: 'Fruit & Veg'
    })
  })

  it('a category edit changes the section but not the group until sorted', () => {
    const [chip] = buildChips({
      lines: [onion],
      edits: { onion: { quantity: 3, section: 'Dairy, Eggs & Fridge' } },
      layout: { order: ['onion'], placed: { onion: 'Fruit & Veg' } },
      crossedIds: new Set()
    })
    expect(chip).toMatchObject({
      section: 'Dairy, Eggs & Fridge',
      group: 'Fruit & Veg',
      quantity: 3
    })
    expect(chip !== undefined && needsSort(chip)).toBe(true)
  })

  it('groups chips in shop order, chips in their order within a group', () => {
    const chips = buildChips({
      lines: [butter, onion, line()],
      edits: {},
      layout: EMPTY_LAYOUT,
      crossedIds: new Set()
    })
    expect(
      groupChips(chips).map((group) => [
        group.section,
        group.chips.map((chip: Chip) => chip.id)
      ])
    ).toEqual([
      ['Fruit & Veg', ['onion']],
      ['Dairy, Eggs & Fridge', ['butter']],
      ['Pantry', ['chickpeas']]
    ])
  })
})
