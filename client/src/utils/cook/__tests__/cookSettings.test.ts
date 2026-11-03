import { act, renderHook } from '@testing-library/react'
import {
  COOK_SETTINGS_KEY,
  NO_COOK_SETTINGS,
  parseCookSettings,
  useCookSettings
} from '../cookSettings'

/* #221: what the cook sets is kept on this device and read back safely. */

beforeEach(() => localStorage.clear())

describe('parseCookSettings', () => {
  it('reads a good value', () => {
    expect(
      parseCookSettings({
        day: '2026-11-05',
        avoid: ['milk'],
        kitchen: 'Sat 9am'
      })
    ).toEqual({ day: '2026-11-05', avoid: ['milk'], kitchen: 'Sat 9am' })
  })

  it('drops what it cannot use, field by field', () => {
    expect(
      parseCookSettings({
        day: '2026-02-30',
        avoid: ['milk', 4, 'milk'],
        kitchen: 3
      })
    ).toEqual({ day: null, avoid: ['milk'], kitchen: '' })
    expect(parseCookSettings({ avoid: 'milk' })).toEqual(NO_COOK_SETTINGS)
  })

  it('is null for anything that is not an object', () => {
    expect(parseCookSettings(null)).toBeNull()
    expect(parseCookSettings([])).toBeNull()
    expect(parseCookSettings('x')).toBeNull()
  })
})

describe('useCookSettings', () => {
  it('starts empty and keeps a change, one field at a time', () => {
    const { result } = renderHook(() => useCookSettings())
    expect(result.current[0]).toEqual(NO_COOK_SETTINGS)
    act(() => result.current[1]({ day: '2026-11-05' }))
    act(() => result.current[1]({ kitchen: 'Saturday 9am' }))
    expect(result.current[0]).toEqual({
      day: '2026-11-05',
      avoid: [],
      kitchen: 'Saturday 9am'
    })
    expect(
      JSON.parse(localStorage.getItem(COOK_SETTINGS_KEY) ?? 'null')
    ).toEqual(result.current[0])
  })

  it('reads what was kept before', () => {
    localStorage.setItem(
      COOK_SETTINGS_KEY,
      JSON.stringify({ day: '2026-11-07', avoid: ['soy'], kitchen: '' })
    )
    const { result } = renderHook(() => useCookSettings())
    expect(result.current[0].avoid).toEqual(['soy'])
  })
})
