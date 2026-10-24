import {
  NO_CHIP_FILTER,
  NO_RECIPE_FILTER,
  chipFilterOn,
  chipMatches,
  hiddenText,
  recipeFilterOn,
  recipeMatches,
  toggledIn
} from '../filters'
import type { Chip } from '../../chips/chips'
import type { ChipFilter, ChipStatus } from '../filters'

const chip: Pick<
  Chip,
  'section' | 'crossed' | 'customised' | 'extra' | 'greyed'
> = {
  section: 'Dairy, Eggs & Fridge',
  crossed: false,
  customised: false,
  extra: null,
  greyed: false
}

describe('Feature: Filters (#182)', () => {
  it('Scenario: Several values in one group match any of them', () => {
    const filter: ChipFilter = {
      sections: new Set(['Dairy, Eggs & Fridge', 'Meat & Seafood']),
      statuses: new Set()
    }
    expect(chipMatches(chip, filter)).toBe(true)
    expect(chipMatches({ ...chip, section: 'Pantry' }, filter)).toBe(false)
    expect(chipMatches(chip, NO_CHIP_FILTER)).toBe(true)
  })

  it('Scenario: Groups combine so all must match', () => {
    const filter: ChipFilter = {
      sections: new Set(['Dairy, Eggs & Fridge']),
      statuses: new Set(['crossed'])
    }
    expect(chipMatches(chip, filter)).toBe(false)
    expect(chipMatches({ ...chip, crossed: true }, filter)).toBe(true)
  })

  it('Scenario Outline: Ingredients by status', () => {
    const only = (status: ChipStatus): ChipFilter => ({
      sections: new Set(),
      statuses: new Set([status])
    })
    expect(chipMatches({ ...chip, customised: true }, only('customised'))).toBe(
      true
    )
    expect(chipMatches({ ...chip, extra: 1 }, only('extra'))).toBe(true)
    expect(chipMatches({ ...chip, greyed: true }, only('removed'))).toBe(true)
    expect(chipMatches(chip, only('removed'))).toBe(false)
  })

  it('Scenario: Several contains and excludes', () => {
    const ids = new Set(['butter', 'garlic'])
    expect(
      recipeMatches(ids, {
        contains: ['butter', 'garlic'],
        excludes: ['cream']
      })
    ).toBe(true)
    expect(recipeMatches(ids, { contains: ['cream'], excludes: [] })).toBe(
      false
    )
    expect(recipeMatches(ids, { contains: [], excludes: ['garlic'] })).toBe(
      false
    )
  })

  it('Scenario: Hidden count and Clear: knows when a filter is on', () => {
    expect(chipFilterOn(NO_CHIP_FILTER)).toBe(false)
    expect(
      chipFilterOn({ sections: new Set(), statuses: new Set(['crossed']) })
    ).toBe(true)
    expect(recipeFilterOn(NO_RECIPE_FILTER)).toBe(false)
    expect(recipeFilterOn({ ...NO_RECIPE_FILTER, savedOnly: true })).toBe(true)
    expect(recipeFilterOn({ ...NO_RECIPE_FILTER, excludes: ['x'] })).toBe(true)
    expect(hiddenText(3)).toBe('3 hidden by filter')
    expect([...toggledIn(new Set(['a']), 'b')]).toEqual(['a', 'b'])
    expect([...toggledIn(new Set(['a', 'b']), 'a')]).toEqual(['b'])
  })
})
