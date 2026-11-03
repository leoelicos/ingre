import { renderHook, act } from '@testing-library/react'
import {
  AVOID_OPTIONS,
  DEFAULT_TMD,
  TMD_KEY,
  parseDiet,
  parseTmd,
  pick,
  toggleAvoid,
  useTmd,
  DIETS
} from '../tmd'

describe('parseDiet', () => {
  it('knows the four diets and nothing else', () => {
    expect(parseDiet('vegan')).toBe('vegan')
    expect(parseDiet('paleo')).toBeNull()
    expect(parseDiet(3)).toBeNull()
  })
})

describe('pick', () => {
  it('is the reported option when it is one of them, else the current', () => {
    expect(pick(DIETS, 'vegan', 'none')).toBe('vegan')
    expect(pick(DIETS, 'paleo', 'none')).toBe('none')
  })
})

describe('parseTmd', () => {
  it('reads a full record', () => {
    expect(
      parseTmd({ guidance: 'hand-held', diet: 'vegan', avoid: ['milk', 'egg'] })
    ).toEqual({ guidance: 'hand-held', diet: 'vegan', avoid: ['egg', 'milk'] })
  })
  it('falls back per field and drops unknown allergens', () => {
    expect(
      parseTmd({ guidance: 'x', diet: 7, avoid: ['milk', 'pizza'] })
    ).toEqual({ ...DEFAULT_TMD, avoid: ['milk'] })
    expect(parseTmd({ avoid: 'milk' })).toEqual(DEFAULT_TMD)
  })
  it('is null for anything that is not a record', () => {
    expect(parseTmd(null)).toBeNull()
    expect(parseTmd('x')).toBeNull()
  })
})

describe('toggleAvoid', () => {
  it('adds in list order and removes again', () => {
    expect(toggleAvoid(['milk'], 'egg')).toEqual(['egg', 'milk'])
    expect(toggleAvoid(['egg', 'milk'], 'egg')).toEqual(['milk'])
  })
  it('only knows the listed families', () => {
    expect(toggleAvoid([], 'pizza')).toEqual([])
    expect(AVOID_OPTIONS).toContain('gluten')
  })
})

describe('useTmd', () => {
  beforeEach(() => localStorage.clear())
  it('starts with the defaults and keeps what is saved', () => {
    const { result } = renderHook(() => useTmd())
    expect(result.current.answers).toEqual(DEFAULT_TMD)
    act(() =>
      result.current.save({ guidance: 'guided', diet: 'none', avoid: ['soy'] })
    )
    expect(result.current.answers.guidance).toBe('guided')
    expect(JSON.parse(localStorage.getItem(TMD_KEY) ?? 'null')).toEqual({
      guidance: 'guided',
      diet: 'none',
      avoid: ['soy']
    })
  })
})
