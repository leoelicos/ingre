import { readStored, writeStored } from '../storage'
import { parsePeople } from '../people'

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
  it('parses only 1, 2 or 3 (old Serves values, migrated to portions in #182)', () => {
    expect(parsePeople(3)).toBe(3)
    expect(parsePeople(4)).toBeNull()
    expect(parsePeople('2')).toBeNull()
  })
})
