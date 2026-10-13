import { act, renderHook } from '@testing-library/react'
import { readStored, writeStored } from '../storage'
import { DEFAULT_PEOPLE, PEOPLE_KEY, parsePeople, usePeople } from '../people'

const isNumber = (value: unknown): number | null =>
  typeof value === 'number' ? value : null

describe('readStored / writeStored', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips a value', () => {
    writeStored('k', 5)
    expect(readStored('k', isNumber, 0)).toBe(5)
  })
  it('falls back when missing, invalid JSON or the wrong shape', () => {
    expect(readStored('missing', isNumber, 7)).toBe(7)
    localStorage.setItem('bad', '{not json')
    expect(readStored('bad', isNumber, 7)).toBe(7)
    localStorage.setItem('shape', '"text"')
    expect(readStored('shape', isNumber, 7)).toBe(7)
  })
})

describe('people', () => {
  beforeEach(() => localStorage.clear())

  it('parses only 1, 2 or 3', () => {
    expect(parsePeople(3)).toBe(3)
    expect(parsePeople(4)).toBeNull()
    expect(parsePeople('2')).toBeNull()
  })

  it('defaults to 2, persists changes and restores them', () => {
    const first = renderHook(() => usePeople())
    expect(first.result.current[0]).toBe(DEFAULT_PEOPLE)
    act(() => first.result.current[1](3))
    expect(first.result.current[0]).toBe(3)
    expect(localStorage.getItem(PEOPLE_KEY)).toBe('3')
    const second = renderHook(() => usePeople())
    expect(second.result.current[0]).toBe(3)
  })
})
