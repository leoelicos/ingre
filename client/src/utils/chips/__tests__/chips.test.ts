import { libIngredient } from '../../../test/fixtures'
import { itemById, recipeById } from '../../../test/library'
import { newCopy, withAmount } from '../../balance/copies'
import { catalogue } from '../../library/recipeLibrary'
import { EMPTY_LAYOUT } from '../../storage/shoppingState'
import type { ChipEdit } from '../../storage/shoppingState'
import type { Chip, ChipState, Placement, Source } from '../chips'
import {
  buildBalances,
  buildChips,
  categoryLabel,
  editFor,
  extraChipId,
  groupChips,
  needsSort,
  placementsOf,
  recipeSources,
  rowChips,
  sortLayout,
  sourceAmount,
  sourceLabel,
  startSection,
  totalOf,
  usedInSummary,
  withPlacements
} from '../chips'
import { copyEntries } from '../useChips'

const NONE: ChipState = {
  edits: {},
  layout: EMPTY_LAYOUT,
  crossedIds: new Set()
}

const chipOf = (chips: readonly Chip[], id: string): Chip => {
  const found = chips.find((c) => c.id === id)
  if (found === undefined) throw new Error(`no chip ${id}`)
  return found
}

const butterExtra = {
  id: 'butter',
  name: 'butter',
  ingredientId: 'butter',
  quantity: 1
}
const candles = {
  id: 'free-candles',
  name: 'birthday candles',
  ingredientId: null,
  quantity: 2
}

describe('Feature: Balance sheet (#182)', () => {
  const chicken = recipeById('butter-chicken')
  const dahl = recipeById('dahl')
  const both = copyEntries([newCopy(chicken.id), newCopy(dahl.id)])

  it('Scenario: Both sides balance: one chip per recipe ingredient (staples too) and extra', () => {
    const balances = buildBalances(both, [butterExtra, candles], catalogue)
    const ids = balances.map((b) => b.id)
    expect(ids).toContain('salt')
    expect(balances.find((b) => b.id === 'salt')?.sources).toEqual([
      expect.objectContaining({ kind: 'recipe', recipeId: 'dahl' })
    ])
    expect(ids).toContain('chicken-thigh')
    expect(ids).toContain('red-lentils')
    expect(ids.slice(-1)).toEqual(['free-candles'])
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('Scenario: A chip total comes from its sources, added, never rounded (F3)', () => {
    const chips = buildChips(
      buildBalances(both, [butterExtra], catalogue),
      NONE
    )
    const butter = chipOf(chips, 'butter')
    expect(butter.sources.map((s) => s.quantity)).toEqual([25, 15, 1])
    expect(butter.total).toEqual({ amount: 41, unit: 'g' })
    expect(butter.extra).toBe(1)
    expect(usedInSummary(butter)).toBe('in 2 recipes and Extra')
    expect(chipOf(chips, 'garlic').total.unit).toBe('count')
  })

  it('Scenario: No sources left leaves a greyed chip; a typed extra sits in Other', () => {
    const removed = copyEntries([
      withAmount(newCopy(chicken.id), chicken, 'butter', 0)
    ])
    const chips = buildChips(buildBalances(removed, [candles], catalogue), NONE)
    const butter = chipOf(chips, 'butter')
    expect(butter).toMatchObject({
      greyed: true,
      customised: true,
      total: { amount: 0, unit: 'g' }
    })
    expect(usedInSummary(butter)).toBe('removed from every recipe')
    const typed = chipOf(chips, 'free-candles')
    expect(typed).toMatchObject({
      name: 'birthday candles',
      item: null,
      section: 'Other',
      unit: 'count',
      greyed: false,
      total: { amount: 2, unit: 'count' }
    })
    expect(usedInSummary(typed)).toBe('in Extra')
    expect(usedInSummary(chipOf(chips, 'garlic'))).toBe('in 1 recipe')
  })

  it('names an unknown id by itself', () => {
    const balances = buildBalances(
      [],
      [{ id: 'x', name: 'x', ingredientId: 'mystery', quantity: 1 }],
      catalogue
    )
    expect(balances[0]?.name).toBe('x')
    expect(buildBalances(both, [], [])[0]?.name).toBe('chicken-thigh')
  })
})

describe('source amounts', () => {
  const butter = itemById('butter')
  it('converts to the chip unit, or keeps the raw number when it cannot', () => {
    const source = { quantity: 2, measure: 'tbsp', removed: false }
    expect(sourceAmount({ ...source, removed: true }, butter, 'g')).toBe(0)
    expect(sourceAmount(source, null, 'count')).toBe(2)
    expect(sourceAmount({ ...source, measure: 'pinch' }, butter, 'g')).toBe(2)
    expect(sourceAmount(source, libIngredient(), 'count')).toBe(2)
    const extra: Source = { kind: 'extra', quantity: 3 }
    expect(totalOf([extra], null, 'count')).toEqual({
      amount: 3,
      unit: 'count'
    })
  })

  it('labels repeated recipe names "(2)" (answer 21)', () => {
    expect(sourceLabel([], 'Dahl')).toBe('Dahl')
    expect(sourceLabel(['Dahl', 'Curry'], 'Dahl')).toBe('Dahl (2)')
    expect(extraChipId(candles)).toBe('free-candles')
    expect(extraChipId(butterExtra)).toBe('butter')
  })
})

describe('layout and sorting (#179)', () => {
  it('places new chips once, and sort moves them to their current category', () => {
    const placements: Placement[] = [
      { id: 'a', section: 'Deli' },
      { id: 'b', section: 'Pantry' }
    ]
    const placed = withPlacements(EMPTY_LAYOUT, placements)
    expect(withPlacements(placed, placements)).toBe(placed)
    const moved = sortLayout(placed, [{ id: 'a', section: 'Frozen' }])
    expect(moved.placed).toEqual({ a: 'Frozen', b: 'Pantry' })
    expect(editFor({}, 'a')).toEqual({ section: null })
    expect(startSection(null)).toBe('Other')
    expect(categoryLabel('Dairy, Eggs & Fridge')).toBe('Dairy')
  })

  it('a category edit changes the colour, not the group, until sorted', () => {
    const entries = copyEntries([newCopy('dahl')])
    const balances = buildBalances(entries, [], catalogue)
    const edits: Record<string, ChipEdit> = { butter: { section: 'Frozen' } }
    const layout = withPlacements(EMPTY_LAYOUT, placementsOf(balances, {}))
    const chips = buildChips(balances, { ...NONE, edits, layout })
    const butter = chipOf(chips, 'butter')
    expect(butter.section).toBe('Frozen')
    expect(butter.group).toBe('Dairy, Eggs & Fridge')
    expect(needsSort(butter)).toBe(true)
    const groups = groupChips(chips)
    expect(groups.map((g) => g.section)).not.toContain('Frozen')
    const sorted = sortLayout(layout, placementsOf(balances, edits))
    expect(
      groupChips(buildChips(balances, { ...NONE, edits, layout: sorted })).map(
        (g) => g.section
      )
    ).toContain('Frozen')
  })

  it('unplaced chips go last', () => {
    const balances = buildBalances(
      copyEntries([newCopy('dahl')]),
      [],
      catalogue
    )
    const chips = buildChips(balances, {
      ...NONE,
      layout: { order: ['butter'], placed: {} }
    })
    expect(chips[0]?.id).toBe('butter')
  })
})

describe('Feature: Recipe rows (#182)', () => {
  it('Scenario: Expanded row has chips for every ingredient, staples included; removed ones are greyed', () => {
    const dahl = recipeById('dahl')
    const [entry] = copyEntries([
      withAmount(newCopy('dahl'), dahl, 'butter', 0)
    ])
    if (entry === undefined) throw new Error('no entry')
    const chips = rowChips(entry, {
      ...NONE,
      crossedIds: new Set(['salt']),
      edits: { onion: { section: 'Pantry' } }
    })
    expect(chips).toHaveLength(dahl.ingredients.length)
    expect(chipOf(chips, 'salt').crossed).toBe(true)
    expect(chipOf(chips, 'butter')).toMatchObject({
      greyed: true,
      customised: true
    })
    expect(chipOf(chips, 'onion').section).toBe('Pantry')
    expect(recipeSources(chipOf(chips, 'onion'))[0]?.label).toBe(
      'Red lentil dahl'
    )
  })
})
