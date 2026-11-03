import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ExploreProvider, useExplore } from '../ExploreContext'

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
