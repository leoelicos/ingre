import type { Widths } from '../split'
import {
  DEFAULT_SPLIT,
  SPLITS,
  SPLIT_COLUMNS,
  SPLIT_LABELS,
  effectiveSplit,
  explorePlacement,
  parseSplit,
  splitOptions
} from '../split'

const NARROW: Widths = { split: false, drawer: false }
const SPLIT: Widths = { split: true, drawer: false }
const DRAWER: Widths = { split: true, drawer: true }

describe('layout split (#181)', () => {
  it('reads only known splits from storage', () => {
    expect(SPLITS.map(parseSplit)).toEqual(SPLITS)
    expect(parseSplit('60/40')).toBeNull()
    expect(parseSplit(1)).toBeNull()
    expect(DEFAULT_SPLIT).toBe('50/50')
  })

  it('offers nothing below 576px, vertical and 50/50 to 1328px, and all five in order from 1328px (#193)', () => {
    expect(splitOptions(NARROW)).toEqual([])
    expect(splitOptions(SPLIT)).toEqual(['vertical', '50/50'])
    expect(splitOptions(DRAWER)).toEqual([
      'vertical',
      '50/50',
      '25/75',
      '33/33/33',
      '75/25'
    ])
  })

  it('is vertical when narrow, and falls back to 50/50 where a split is not offered', () => {
    expect(effectiveSplit('25/75', NARROW)).toBe('vertical')
    expect(effectiveSplit('vertical', SPLIT)).toBe('vertical')
    expect(effectiveSplit('50/50', SPLIT)).toBe('50/50')
    expect(effectiveSplit('33/33/33', SPLIT)).toBe('50/50')
    expect(effectiveSplit('33/33/33', DRAWER)).toBe('33/33/33')
  })

  it('shows 25/75 and 75/25 as 50/50 below 1328px and as themselves from 1328px (#193)', () => {
    expect(effectiveSplit('25/75', SPLIT)).toBe('50/50')
    expect(effectiveSplit('75/25', SPLIT)).toBe('50/50')
    expect(effectiveSplit('25/75', DRAWER)).toBe('25/75')
    expect(effectiveSplit('75/25', DRAWER)).toBe('75/25')
  })

  it('places Explore inline below 1328px, then in the drawer, or the third column with 33/33/33', () => {
    expect(explorePlacement(false, '33/33/33')).toBe('inline')
    expect(explorePlacement(false, '50/50')).toBe('inline')
    expect(explorePlacement(true, '50/50')).toBe('drawer')
    expect(explorePlacement(true, '33/33/33')).toBe('column')
  })

  it('25/75 gives Ingredients a quarter and Recipes three quarters, and says so', () => {
    expect(SPLIT_COLUMNS['25/75']).toBe(
      'grid-cols-[minmax(0,1fr)_minmax(0,3fr)]'
    )
    expect(SPLIT_LABELS['25/75']).toBe('Ingredients 25%, Recipes 75%')
    expect(SPLIT_COLUMNS.vertical).toBe('grid-cols-1')
  })

  it('33/33/33 gives Ingredients, Recipes and Explore a third each, and says so', () => {
    expect(SPLIT_COLUMNS['33/33/33']).toBe(
      'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'
    )
    expect(SPLIT_LABELS['33/33/33']).toBe(
      'Ingredients 33%, Recipes 33%, Explore 33%'
    )
  })
})
