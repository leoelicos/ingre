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

  it('opens, collapses, closes and passes focus on', () => {
    const { result } = renderHook(() => useExplore(), { wrapper })
    expect(result.current.open).toBeNull()
    act(() => result.current.toggleCollapsed())
    expect(result.current.collapsed).toBe(true)
    act(() => result.current.show())
    expect(result.current).toMatchObject({ open: true, collapsed: false })
    act(() => result.current.close())
    expect(result.current.open).toBe(false)
    act(() => result.current.requestFocus())
    expect(result.current.focusPending).toBe(true)
    act(() => result.current.focusTaken())
    expect(result.current.focusPending).toBe(false)
    act(() => result.current.setQuery('dahl'))
    expect(result.current.query).toBe('dahl')
  })
})
