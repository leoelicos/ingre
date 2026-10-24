import { act, renderHook } from '@testing-library/react'
import { parseStringSet, useStored, useStoredSet } from '../useStored'
import {
  CROSSED_KEY,
  EDITS_KEY,
  EMPTY_LAYOUT,
  EXTRAS_KEY,
  LAYOUT_KEY,
  PICKED_KEY,
  parseEdits,
  parseExtras,
  parseLayout,
  parseSection,
  useChipEdits,
  useChipLayout,
  useCrossedIds,
  useExtras,
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

  it('parses extras, dropping malformed entries', () => {
    const milk = { id: 'milk', name: 'milk', ingredientId: 'milk', quantity: 2 }
    const free = { id: 'free-x', name: 'x', ingredientId: null, quantity: 1 }
    expect(
      parseExtras([
        milk,
        free,
        null,
        'x',
        [],
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

  it('parses a shop section', () => {
    expect(parseSection('Deli')).toBe('Deli')
    expect(parseSection('Garage')).toBeNull()
    expect(parseSection(3)).toBeNull()
  })

  it('parses chip edits, keeping only whole quantities and known sections (#179)', () => {
    expect(
      parseEdits({
        tomato: { quantity: 2, section: null },
        onion: { quantity: null, section: 'Pantry' },
        both: { quantity: 3, section: 'Deli' },
        badQuantity: { quantity: 1.5, section: 'Deli' },
        empty: { quantity: 0, section: 'Garage' },
        notRecord: 'x'
      })
    ).toEqual({
      tomato: { quantity: 2, section: null },
      onion: { quantity: null, section: 'Pantry' },
      both: { quantity: 3, section: 'Deli' },
      badQuantity: { quantity: null, section: 'Deli' }
    })
    expect(parseEdits(null)).toBeNull()
    expect(parseEdits(['x'])).toBeNull()
  })

  it('parses the chip layout, dropping unknown ids and sections (#179)', () => {
    expect(
      parseLayout({
        order: ['a', 2, 'b'],
        placed: { a: 'Deli', b: 'Garage' }
      })
    ).toEqual({ order: ['a', 'b'], placed: { a: 'Deli' } })
    expect(parseLayout({ order: ['a'] })).toEqual({
      order: ['a'],
      placed: {}
    })
    expect(parseLayout({ order: 'a' })).toBeNull()
    expect(parseLayout(null)).toBeNull()
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

  it('useStoredSet toggles and removes ids', () => {
    const { result } = renderHook(() => useStoredSet('s', new Set(['a'])))
    act(() => result.current[1]('b'))
    expect([...result.current[0]]).toEqual(['a', 'b'])
    act(() => result.current[1]('a'))
    expect(stored('s')).toEqual(['b'])
    act(() => result.current[2]('b'))
    expect(stored('s')).toEqual([])
  })

  it('remembers picks, crossed off chips, extras, edits and the layout', () => {
    const picked = renderHook(() => usePickedIds())
    act(() => picked.result.current[1]('dahl'))
    expect(stored(PICKED_KEY)).toEqual(['dahl'])
    const crossed = renderHook(() => useCrossedIds())
    act(() => crossed.result.current[1]('onion'))
    expect(stored(CROSSED_KEY)).toEqual(['onion'])
    const extras = renderHook(() => useExtras())
    expect(extras.result.current[0]).toEqual([])
    act(() =>
      extras.result.current[1](() => [
        { id: 'x', name: 'x', ingredientId: null, quantity: 1 }
      ])
    )
    expect(stored(EXTRAS_KEY)).toHaveLength(1)
    const edits = renderHook(() => useChipEdits())
    expect(edits.result.current[0]).toEqual({})
    act(() =>
      edits.result.current[1](() => ({
        onion: { quantity: 2, section: null }
      }))
    )
    expect(stored(EDITS_KEY)).toEqual({ onion: { quantity: 2, section: null } })
    const layout = renderHook(() => useChipLayout())
    expect(layout.result.current[0]).toEqual(EMPTY_LAYOUT)
    act(() =>
      layout.result.current[1](() => ({
        order: ['onion'],
        placed: { onion: 'Fruit & Veg' }
      }))
    )
    expect(stored(LAYOUT_KEY)).toEqual({
      order: ['onion'],
      placed: { onion: 'Fruit & Veg' }
    })
  })
})
