import { act, renderHook } from '@testing-library/react'
import { FIRST_RUN_KEY, parseStage, useFirstRun } from '../firstRun'

describe('parseStage', () => {
  it('knows the three stages', () => {
    expect(parseStage('landing')).toBe('landing')
    expect(parseStage('tmd')).toBe('tmd')
    expect(parseStage('done')).toBe('done')
    expect(parseStage('later')).toBeNull()
  })
})

describe('useFirstRun', () => {
  beforeEach(() => localStorage.clear())
  it('starts at the landing, moves on and remembers where it got to', () => {
    const { result } = renderHook(() => useFirstRun())
    expect(result.current.stage).toBe('landing')
    act(() => result.current.goTo('tmd'))
    expect(result.current.stage).toBe('tmd')
    expect(localStorage.getItem(FIRST_RUN_KEY)).toBe('"tmd"')
    expect(renderHook(() => useFirstRun()).result.current.stage).toBe('tmd')
  })
})
