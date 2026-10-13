import { act, renderHook } from '@testing-library/react'
import { parseStringSet, useStored, useStoredSet } from '../useStored'
import {
  BASKET_KEY,
  HAVE_KEY,
  LOCATIONS_KEY,
  VIEW_KEY,
  parseLocations,
  parseView,
  useBasketIds,
  useHaveIds,
  useListView,
  useLocationOverrides
} from '../shoppingState'

const stored = (key: string): unknown =>
  JSON.parse(localStorage.getItem(key) ?? 'null')

describe('parsers', () => {
  it('parses string sets', () => {
    expect(parseStringSet(['a', 'b'])).toEqual(new Set(['a', 'b']))
    expect(parseStringSet(['a', 1])).toBeNull()
    expect(parseStringSet('a')).toBeNull()
  })
  it('parses views', () => {
    expect(parseView('shop')).toBe('shop')
    expect(parseView('x')).toBeNull()
  })
  it('keeps only valid location overrides', () => {
    expect(parseLocations({ a: 'Fridge', b: 'Pantry', c: 3 })).toEqual({
      a: 'Fridge'
    })
    expect(parseLocations(null)).toBeNull()
    expect(parseLocations(['Fridge'])).toBeNull()
    expect(parseLocations('Fridge')).toBeNull()
  })
})

describe('stored hooks', () => {
  beforeEach(() => localStorage.clear())

  it('useStored reads the fallback then persists updates', () => {
    const isNum = (v: unknown) => (typeof v === 'number' ? v : null)
    const { result } = renderHook(() => useStored('n', isNum, 1))
    expect(result.current[0]).toBe(1)
    act(() => result.current[1]((n) => n + 1))
    expect(result.current[0]).toBe(2)
    expect(stored('n')).toBe(2)
  })

  it('useStoredSet toggles ids in and out', () => {
    const { result } = renderHook(() => useStoredSet('s', new Set(['a'])))
    act(() => result.current[1]('b'))
    expect([...result.current[0]]).toEqual(['a', 'b'])
    act(() => result.current[1]('a'))
    expect(stored('s')).toEqual(['b'])
  })

  it('have ids default to staples; basket starts empty', () => {
    const have = renderHook(() => useHaveIds(new Set(['salt'])))
    expect(have.result.current[0].has('salt')).toBe(true)
    act(() => have.result.current[1]('salt'))
    expect(stored(HAVE_KEY)).toEqual([])
    const basket = renderHook(() => useBasketIds())
    expect(basket.result.current[0].size).toBe(0)
    act(() => basket.result.current[1]('onion'))
    expect(stored(BASKET_KEY)).toEqual(['onion'])
  })

  it('remembers the view and location overrides', () => {
    const view = renderHook(() => useListView())
    expect(view.result.current[0]).toBe('home')
    act(() => view.result.current[1]('shop'))
    expect(stored(VIEW_KEY)).toBe('shop')
    const locations = renderHook(() => useLocationOverrides())
    act(() => locations.result.current[1]('onion', 'Bench'))
    expect(locations.result.current[0]).toEqual({ onion: 'Bench' })
    expect(stored(LOCATIONS_KEY)).toEqual({ onion: 'Bench' })
  })
})
