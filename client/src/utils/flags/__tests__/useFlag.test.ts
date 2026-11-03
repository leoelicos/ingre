import { renderHook } from '@testing-library/react'
import { FLAGS_KEY } from '../flags'
import { useFlag } from '../useFlag'

describe('useFlag', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  it('is off by default', () => {
    expect(renderHook(() => useFlag('tiers')).result.current).toBe(false)
  })

  it('is on with ?flags=tiers, and stays on without it', () => {
    window.history.pushState({}, '', '/?flags=tiers')
    expect(renderHook(() => useFlag('tiers')).result.current).toBe(true)
    expect(localStorage.getItem(FLAGS_KEY)).toBe('["tiers"]')
    window.history.pushState({}, '', '/upgrade')
    expect(renderHook(() => useFlag('tiers')).result.current).toBe(true)
  })
})
