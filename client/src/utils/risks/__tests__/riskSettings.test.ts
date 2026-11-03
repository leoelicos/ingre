import { renderHook, act } from '@testing-library/react'
import {
  NO_SETTINGS,
  RISK_SETTINGS_KEY,
  amountOrNull,
  parseRiskSettings,
  useRiskSettings
} from '../riskSettings'

beforeEach(() => localStorage.clear())

describe('risk settings (#220)', () => {
  it('keeps a positive finite number and nothing else', () => {
    expect(amountOrNull(12.5)).toBe(12.5)
    for (const bad of [0, -3, NaN, Infinity, '5', null, undefined])
      expect(amountOrNull(bad)).toBeNull()
  })

  it('reads each limit on its own, and rejects what is not an object', () => {
    expect(parseRiskSettings({ budget: 40, fridge: 'lots' })).toEqual({
      budget: 40,
      fridge: null
    })
    expect(parseRiskSettings([])).toBeNull()
    expect(parseRiskSettings('x')).toBeNull()
  })

  it('starts unset, changes one limit at a time and stores it', () => {
    const { result } = renderHook(() => useRiskSettings())
    expect(result.current[0]).toEqual(NO_SETTINGS)
    act(() => result.current[1]({ budget: 30 }))
    act(() => result.current[1]({ fridge: 12 }))
    expect(result.current[0]).toEqual({ budget: 30, fridge: 12 })
    expect(JSON.parse(localStorage.getItem(RISK_SETTINGS_KEY) ?? '')).toEqual({
      budget: 30,
      fridge: 12
    })
  })

  it('reads the stored limits back', () => {
    localStorage.setItem(RISK_SETTINGS_KEY, '{"budget":9,"fridge":null}')
    const { result } = renderHook(() => useRiskSettings())
    expect(result.current[0]).toEqual({ budget: 9, fridge: null })
  })
})
