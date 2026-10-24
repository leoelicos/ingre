import { act, renderHook } from '@testing-library/react'
import { parseStringSet, useStored, useStoredSet } from '../useStored'
import {
  CROSSED_KEY,
  EDITS_KEY,
  EMPTY_LAYOUT,
  EXTRAS_KEY,
  LAYOUT_KEY,
  COPIES_KEY,
  PICKED_KEY,
  legacyCopies,
  parseCopies,
  parseEdits,
  parseExtras,
  parseLayout,
  parseSection,
  useChipEdits,
  useChipLayout,
  useCrossedIds,
  useCopies,
  useExtras
} from '../shoppingState'
import { PEOPLE_KEY } from '../people'

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

  it('parses chip edits, keeping only known sections and dropping old quantity overrides (#182)', () => {
    expect(
      parseEdits({
        tomato: { quantity: 2, section: null },
        onion: { quantity: null, section: 'Pantry' },
        both: { quantity: 3, section: 'Deli' },
        empty: { quantity: 0, section: 'Garage' },
        notRecord: 'x'
      })
    ).toEqual({
      onion: { section: 'Pantry' },
      both: { section: 'Deli' }
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

describe('recipe copies (#182)', () => {
  beforeEach(() => localStorage.clear())

  it('parses copies: one per recipe, portions clamped, amounts of 0 or more', () => {
    expect(
      parseCopies([
        {
          recipeId: 'dahl',
          portions: 30,
          amounts: { butter: 0, x: -1, y: 'a' }
        },
        { recipeId: 'dahl', portions: 3, amounts: {} },
        { recipeId: 'curry', portions: 2.4 },
        { recipeId: 1, portions: 2 },
        { recipeId: 'x' },
        'nope'
      ])
    ).toEqual([
      { recipeId: 'dahl', portions: 12, amounts: { butter: 0 } },
      { recipeId: 'curry', portions: 2, amounts: {} }
    ])
    expect(parseCopies({})).toBeNull()
  })

  it('migrates old picks with the old Serves as portions, else 2', () => {
    expect(legacyCopies()).toEqual([])
    localStorage.setItem(PICKED_KEY, JSON.stringify(['dahl']))
    expect(legacyCopies()).toEqual([
      { recipeId: 'dahl', portions: 2, amounts: {} }
    ])
    localStorage.setItem(PEOPLE_KEY, '3')
    const { result } = renderHook(() => useCopies())
    expect(result.current[0]).toEqual([
      { recipeId: 'dahl', portions: 3, amounts: {} }
    ])
    act(() => result.current[1]((copies) => copies.slice(1)))
    expect(stored(COPIES_KEY)).toEqual([])
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

  it('remembers crossed off chips, extras, edits and the layout', () => {
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
        onion: { section: 'Pantry' }
      }))
    )
    expect(stored(EDITS_KEY)).toEqual({ onion: { section: 'Pantry' } })
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
