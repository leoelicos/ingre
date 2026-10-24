import {
  DEFAULT_SPLIT,
  SPLITS,
  SPLIT_COLUMNS,
  SPLIT_LABELS,
  effectiveSplit,
  parseSplit,
  splitOptions
} from '../split'

describe('layout split (#181)', () => {
  it('reads only known splits from storage', () => {
    expect(SPLITS.map(parseSplit)).toEqual(SPLITS)
    expect(parseSplit('60/40')).toBeNull()
    expect(parseSplit(1)).toBeNull()
    expect(DEFAULT_SPLIT).toBe('50/50')
  })

  it('offers nothing below 576px, vertical and 50/50 to 992px, and all four above', () => {
    expect(splitOptions(false, false)).toEqual([])
    expect(splitOptions(true, false)).toEqual(['vertical', '50/50'])
    expect(splitOptions(true, true)).toEqual([
      'vertical',
      '50/50',
      '25/75',
      '75/25'
    ])
  })

  it('is vertical when narrow, and falls back to 50/50 below 992px for 25/75 and 75/25', () => {
    expect(effectiveSplit('25/75', false, false)).toBe('vertical')
    expect(effectiveSplit('25/75', true, false)).toBe('50/50')
    expect(effectiveSplit('75/25', true, false)).toBe('50/50')
    expect(effectiveSplit('vertical', true, false)).toBe('vertical')
    expect(effectiveSplit('25/75', true, true)).toBe('25/75')
  })

  it('25/75 gives Ingredients a quarter and Recipes three quarters, and says so', () => {
    expect(SPLIT_COLUMNS['25/75']).toBe(
      'grid-cols-[minmax(0,1fr)_minmax(0,3fr)]'
    )
    expect(SPLIT_LABELS['25/75']).toBe('Ingredients 25%, Recipes 75%')
    expect(SPLIT_COLUMNS.vertical).toBe('grid-cols-1')
  })
})
