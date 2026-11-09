import type { LibraryIngredient, LibraryRecipe } from '../../../types/library'
import { itemById, recipeById } from '../../../test/library'
import { catalogue } from '../../library/recipeLibrary'
import type { AuditRow } from '../measurementAudit'
import { auditRows, perServeOf, shareOf, smallestPack } from '../auditRows'
import {
  AUDIT_COLUMNS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  nextSort,
  pageOf,
  sortRows
} from '../measurementAudit'

const item = (over: Partial<LibraryIngredient>): LibraryIngredient => ({
  id: 'thing',
  name: 'thing',
  category: 'baking',
  sold: [],
  pantry: 'Cupboard',
  allergens: [],
  ...over
})

const row = (over: Partial<AuditRow>): AuditRow => ({
  ingredientId: over.name ?? 'x',
  name: 'x',
  item: null,
  quantity: 1,
  measure: 'g',
  perServe: null,
  pack: null,
  share: null,
  ...over
})

describe('measurement audit rows', () => {
  const bolognese = recipeById('spaghetti-bolognese')
  const rows = auditRows(bolognese, catalogue)
  const byId = (id: string) => rows.find((r) => r.ingredientId === id)

  it('has one row per ingredient line, in the recipe order', () => {
    expect(rows.map((r) => r.ingredientId)).toEqual(
      bolognese.ingredients.map((line) => line.ingredientId)
    )
  })

  it('works out grams per serve, the smallest pack and the share of it', () => {
    expect(byId('spaghetti')).toMatchObject({
      quantity: 100,
      measure: 'g',
      perServe: { amount: 100, unit: 'g' },
      pack: { amount: 500, unit: 'g' },
      share: 0.2
    })
  })

  it('weighs counted items by their approximate weight, against a pack of one', () => {
    expect(byId('onion')).toMatchObject({
      perServe: { amount: 37.5, unit: 'g' },
      pack: { amount: 1, unit: 'count' },
      share: 0.25
    })
  })

  it('keeps an ingredient the catalogue does not have, with nothing worked out', () => {
    const recipe: LibraryRecipe = {
      ...bolognese,
      ingredients: [{ ingredientId: 'unicorn', quantity: 1, measure: 'g' }]
    }
    expect(auditRows(recipe, [])).toEqual([
      {
        ingredientId: 'unicorn',
        name: 'unicorn',
        item: null,
        quantity: 1,
        measure: 'g',
        perServe: null,
        pack: null,
        share: null
      }
    ])
  })

  it('reads columns in table order and pages of five by default', () => {
    expect(AUDIT_COLUMNS).toEqual([
      'name',
      'quantity',
      'unit',
      'perServe',
      'pack',
      'share'
    ])
    expect(PAGE_SIZES[0]).toBe(DEFAULT_PAGE_SIZE)
  })
})

describe('perServeOf', () => {
  it('is unknown for a measure the item has no weight for', () => {
    expect(perServeOf(1, 'pinch', itemById('salt'))).toBeNull()
  })

  it('is unknown for a counted item with no approximate weight', () => {
    expect(perServeOf(2, 'whole', item({}))).toBeNull()
  })

  it('keeps millilitres for spoons and liquids', () => {
    expect(perServeOf(1, 'tbsp', item({}))).toEqual({ amount: 20, unit: 'ml' })
  })

  it('uses the item’s own measure weights', () => {
    expect(perServeOf(2, 'clove', itemById('garlic'))).toEqual({
      amount: 12,
      unit: 'g'
    })
  })
})

describe('smallestPack', () => {
  it('is null for an item sold only loose, or no item', () => {
    expect(
      smallestPack(item({ sold: [{ type: 'weighed', size: null }] }))
    ).toBeNull()
    expect(smallestPack(null)).toBeNull()
  })

  it('takes the smallest size in the first sized option’s unit', () => {
    expect(
      smallestPack(
        item({
          sold: [
            { type: 'weighed', size: null },
            { type: 'pack', size: { amount: 1000, unit: 'g' } },
            { type: 'each', size: { amount: 1, unit: 'count' } },
            { type: 'pack', size: { amount: 250, unit: 'g' } }
          ]
        })
      )
    ).toEqual({ amount: 250, unit: 'g' })
  })
})

describe('shareOf', () => {
  it('is unknown when the amounts will not convert', () => {
    expect(
      shareOf({ amount: 50, unit: 'g' }, { amount: 1, unit: 'count' }, item({}))
    ).toBeNull()
  })

  it('is unknown when a side is missing', () => {
    const pack = { amount: 1, unit: 'g' } as const
    expect(shareOf(null, pack, item({}))).toBeNull()
    expect(shareOf(pack, null, item({}))).toBeNull()
    expect(shareOf(pack, pack, null)).toBeNull()
  })
})

describe('sortRows', () => {
  const apple = row({
    name: 'apple',
    quantity: 3,
    measure: 'whole',
    perServe: { amount: 150, unit: 'g' },
    pack: { amount: 1, unit: 'count' },
    share: 1
  })
  const butter = row({
    name: 'butter',
    quantity: 10,
    measure: 'g',
    perServe: { amount: 10, unit: 'g' },
    pack: { amount: 250, unit: 'g' },
    share: 0.04
  })
  const cumin = row({ name: 'cumin', quantity: 0.5, measure: 'tsp' })
  const dill = row({ name: 'dill', quantity: 0.5, measure: 'tsp' })
  const rows = [dill, butter, cumin, apple]
  const names = (sorted: readonly AuditRow[]) => sorted.map((r) => r.name)

  it('sorts names A to Z and Z to A', () => {
    expect(
      names(sortRows(rows, { column: 'name', direction: 'ascending' }))
    ).toEqual(['apple', 'butter', 'cumin', 'dill'])
    expect(
      names(sortRows(rows, { column: 'name', direction: 'descending' }))
    ).toEqual(['dill', 'cumin', 'butter', 'apple'])
  })

  it('sorts numbers, with equal values falling back to the name', () => {
    expect(
      names(sortRows(rows, { column: 'quantity', direction: 'ascending' }))
    ).toEqual(['cumin', 'dill', 'apple', 'butter'])
    expect(
      names(sortRows(rows, { column: 'quantity', direction: 'descending' }))
    ).toEqual(['butter', 'apple', 'cumin', 'dill'])
  })

  it('sorts units by their measure', () => {
    expect(
      names(sortRows(rows, { column: 'unit', direction: 'ascending' }))
    ).toEqual(['butter', 'cumin', 'dill', 'apple'])
  })

  it('keeps unknown values last whichever way it sorts', () => {
    for (const column of ['perServe', 'pack', 'share'] as const) {
      expect(
        names(sortRows(rows, { column, direction: 'ascending' })).slice(2)
      ).toEqual(['cumin', 'dill'])
      expect(
        names(sortRows(rows, { column, direction: 'descending' })).slice(2)
      ).toEqual(['cumin', 'dill'])
    }
    expect(
      names(sortRows(rows, { column: 'perServe', direction: 'ascending' }))
    ).toEqual(['butter', 'apple', 'cumin', 'dill'])
    expect(
      names(sortRows(rows, { column: 'pack', direction: 'descending' }))
    ).toEqual(['butter', 'apple', 'cumin', 'dill'])
    expect(
      names(sortRows(rows, { column: 'share', direction: 'descending' }))
    ).toEqual(['apple', 'butter', 'cumin', 'dill'])
  })

  it('never changes the rows it is given', () => {
    sortRows(rows, { column: 'name', direction: 'ascending' })
    expect(names(rows)).toEqual(['dill', 'butter', 'cumin', 'apple'])
  })
})

describe('nextSort', () => {
  it('starts a column ascending, then flips it', () => {
    expect(nextSort(null, 'name')).toEqual({
      column: 'name',
      direction: 'ascending'
    })
    const asc = nextSort(null, 'share')
    const desc = nextSort(asc, 'share')
    expect(desc).toEqual({ column: 'share', direction: 'descending' })
    expect(nextSort(desc, 'share')).toEqual(asc)
    expect(nextSort(desc, 'name').direction).toBe('ascending')
  })
})

describe('pageOf', () => {
  const twelve = Array.from({ length: 12 }, (_, i) => i + 1)

  it('gives a page and where it sits', () => {
    expect(pageOf(twelve, 2, 5)).toEqual({
      rows: [6, 7, 8, 9, 10],
      page: 2,
      pageCount: 3,
      first: 6,
      last: 10,
      total: 12
    })
    expect(pageOf(twelve, 3, 5)).toMatchObject({ rows: [11, 12], last: 12 })
  })

  it('keeps the page inside the range', () => {
    expect(pageOf(twelve, 9, 5).page).toBe(3)
    expect(pageOf(twelve, 0, 5).page).toBe(1)
  })

  it('has one empty page when there is nothing', () => {
    expect(pageOf([], 1, 5)).toEqual({
      rows: [],
      page: 1,
      pageCount: 1,
      first: 0,
      last: 0,
      total: 0
    })
  })
})
