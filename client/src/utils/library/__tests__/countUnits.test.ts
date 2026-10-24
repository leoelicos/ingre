/*
 * Owner decision 2 (#182): counted items get a buying unit that makes sense, never a bare
 * number. Checks the whole catalogue and every recipe in it.
 */
import { newCopy } from '../../balance/copies'
import { buildBalances, buildChips } from '../../chips/chips'
import { copyEntries } from '../../chips/useChips'
import { EMPTY_LAYOUT } from '../../storage/shoppingState'
import { amountText } from '../../shopping/shoppingList'
import { formatAmount, itemUnit } from '../../shopping/units'
import { catalogue, library } from '../recipeLibrary'

/** A number, then a unit word: "2 cloves", "1 head", "½ tsp", "250 g". */
const HAS_UNIT = /^[\d½⅓⅔¼¾.]+ [a-zA-Z]/

const counted = catalogue.filter((item) => itemUnit(item) === 'count')

describe('Owner decision 2: counted items have a buying unit (#182)', () => {
  it('every counted item in the catalogue spells its unit out, singular and plural', () => {
    expect(counted.length).toBeGreaterThan(30)
    counted.forEach((item) => {
      expect([item.id, item.countUnit?.one]).toEqual([
        item.id,
        expect.stringMatching(/^[a-z ]+$/)
      ])
      expect([item.id, item.countUnit?.other]).toEqual([
        item.id,
        expect.stringMatching(/^[a-z ]+$/)
      ])
    })
  })

  it('only counted items have a count unit', () => {
    expect(
      catalogue
        .filter((item) => item.countUnit !== undefined)
        .every((item) => itemUnit(item) === 'count')
    ).toBe(true)
  })

  it('an item used in parts knows the part and how many make one', () => {
    const parted = catalogue.filter((item) => item.partMeasure !== undefined)
    expect(parted.map((item) => item.id)).toEqual(['garlic', 'spring-onion'])
    parted.forEach((item) => {
      expect(item.approxGrams).toBeGreaterThan(0)
      expect(item.measureGrams?.[item.partMeasure ?? '']).toBeGreaterThan(0)
    })
  })

  it('every chip of every recipe shows a number and a unit, in its total and its recipe amount', () => {
    const entries = copyEntries(library.map((recipe) => newCopy(recipe.id)))
    const chips = buildChips(buildBalances(entries, [], catalogue), {
      edits: {},
      layout: EMPTY_LAYOUT,
      crossedIds: new Set()
    })
    expect(chips.length).toBeGreaterThan(20)
    chips.forEach((chip) => {
      expect([chip.id, formatAmount(chip.total, chip.item)]).toEqual([
        chip.id,
        expect.stringMatching(HAS_UNIT)
      ])
    })
    entries
      .flatMap((entry) => entry.lines)
      .forEach((line) => {
        expect([
          line.ingredientId,
          amountText(line.quantity, line.measure, line.item)
        ]).toEqual([line.ingredientId, expect.stringMatching(HAS_UNIT)])
      })
  })

  it('every counted item in Extra reads in its own unit', () => {
    counted.forEach((item) => {
      const one = formatAmount({ amount: 1, unit: 'count' }, item)
      const two = formatAmount({ amount: 2, unit: 'count' }, item)
      expect([one, two]).toEqual([
        `1 ${item.countUnit?.one}`,
        `2 ${item.countUnit?.other}`
      ])
    })
  })
})
