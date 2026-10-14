import { act, renderHook } from '@testing-library/react'
import { parseStringSet, useStored, useStoredSet } from '../useStored'
import {
  BASKET_KEY,
  HAVE_KEY,
  LOCATIONS_KEY,
  EXTRAS_KEY,
  PICKED_KEY,
  STEP_KEY,
  parseLocations,
  parseExtras,
  parseStep,
  useBasketIds,
  useHaveIds,
  useExtras,
  useFlowStep,
  useLocationOverrides,
  usePickedIds
} from '../shoppingState'

const stored = (key: string): unknown =>
  JSON.parse(localStorage.getItem(key) ?? 'null')

describe('parsers', () => {
  it('parses string sets', () => {
    expect(parseStringSet(['a', 'b'])).toEqual(new Set(['a', 'b']))
    expect(parseStringSet(['a', 1])).toBeNull()
    expect(parseStringSet('a')).toBeNull()
  })
  it('parses steps', () => {
    expect(parseStep('shop')).toBe('shop')
    expect(parseStep('x')).toBeNull()
  })
  it('parses extras, dropping malformed entries', () => {
    const milk = { id: 'milk', name: 'milk', ingredientId: 'milk', quantity: 2 }
    const free = { id: 'free-x', name: 'x', ingredientId: null, quantity: 1 }
    expect(
      parseExtras([
        milk,
        free,
        null,
        'x',
        { ...milk, id: 1 },
        { ...milk, name: 1 },
        { ...milk, ingredientId: 3 },
        { ...milk, quantity: '1' },
        { ...milk, quantity: 1.5 },
        { ...milk, quantity: 0 }
      ])
    ).toEqual([milk, free])
    expect(parseExtras({})).toBeNull()
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

  it('have ids and basket both start empty', () => {
    const have = renderHook(() => useHaveIds())
    expect(have.result.current[0].size).toBe(0)
    act(() => have.result.current[1]('salt'))
    expect(stored(HAVE_KEY)).toEqual(['salt'])
    const basket = renderHook(() => useBasketIds())
    expect(basket.result.current[0].size).toBe(0)
    act(() => basket.result.current[1]('onion'))
    expect(stored(BASKET_KEY)).toEqual(['onion'])
  })

  it('remembers the step, picks, extras and location overrides', () => {
    const step = renderHook(() => useFlowStep())
    expect(step.result.current[0]).toBe('pick')
    act(() => step.result.current[1]('shop'))
    expect(stored(STEP_KEY)).toBe('shop')
    const picked = renderHook(() => usePickedIds())
    act(() => picked.result.current[1]('dahl'))
    expect(stored(PICKED_KEY)).toEqual(['dahl'])
    act(() => picked.result.current[2]('dahl'))
    expect(stored(PICKED_KEY)).toEqual([])
    const extras = renderHook(() => useExtras())
    expect(extras.result.current[0]).toEqual([])
    act(() =>
      extras.result.current[1](() => [
        { id: 'x', name: 'x', ingredientId: null, quantity: 1 }
      ])
    )
    expect(stored(EXTRAS_KEY)).toHaveLength(1)
    const locations = renderHook(() => useLocationOverrides())
    act(() => locations.result.current[1]('onion', 'Bench'))
    expect(locations.result.current[0]).toEqual({ onion: 'Bench' })
    expect(stored(LOCATIONS_KEY)).toEqual({ onion: 'Bench' })
  })
})
