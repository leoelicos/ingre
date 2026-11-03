import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { GUIDANCE_KEY, ExploreProvider, useExplore } from '../ExploreContext'

const wrapper = ({ children }: { children: ReactNode }) => (
  <ExploreProvider>{children}</ExploreProvider>
)

describe('Explore state (#181)', () => {
  it('needs a provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useExplore())).toThrow(
      'useExplore needs an ExploreProvider'
    )
  })

  it('expands, collapses and passes focus on', () => {
    const { result } = renderHook(() => useExplore(), { wrapper })
    expect(result.current.expanded).toBeNull()
    act(() => result.current.collapse())
    expect(result.current.expanded).toBe(false)
    act(() => result.current.show())
    expect(result.current.expanded).toBe(true)
    act(() => result.current.requestFocus())
    expect(result.current.focusPending).toBe(true)
    act(() => result.current.focusTaken())
    expect(result.current.focusPending).toBe(false)
    act(() => result.current.setQuery('dahl'))
    expect(result.current.query).toBe('dahl')
  })
})

describe('Selected ingredients (#204)', () => {
  it('toggles an ingredient in and out of the selection', () => {
    const { result } = renderHook(() => useExplore(), { wrapper })
    expect(result.current.selected.size).toBe(0)
    act(() => result.current.toggleSelected('apple'))
    act(() => result.current.toggleSelected('onion'))
    expect([...result.current.selected]).toEqual(['apple', 'onion'])
    act(() => result.current.toggleSelected('apple'))
    expect([...result.current.selected]).toEqual(['onion'])
  })
})

describe('The guidance dial (#206)', () => {
  beforeEach(() => localStorage.clear())

  it('is Assisted until the user turns it', () => {
    const { result } = renderHook(() => useExplore(), { wrapper })
    expect(result.current.guidance).toBe('assisted')
  })

  it('keeps the position on the device', () => {
    const first = renderHook(() => useExplore(), { wrapper })
    act(() => first.result.current.setGuidance('hand-held'))
    expect(first.result.current.guidance).toBe('hand-held')
    first.unmount()
    const second = renderHook(() => useExplore(), { wrapper })
    expect(second.result.current.guidance).toBe('hand-held')
  })

  it('ignores a stored value that is not a mode', () => {
    localStorage.setItem(GUIDANCE_KEY, JSON.stringify('hands-off'))
    const { result } = renderHook(() => useExplore(), { wrapper })
    expect(result.current.guidance).toBe('assisted')
  })
})
