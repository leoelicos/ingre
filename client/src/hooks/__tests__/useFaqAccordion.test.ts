import { useFaqAccordion } from '../useFaqAccordion'
import { renderHook, act } from '@testing-library/react'

describe('useFaqAccordion', () => {
  it('starts with nothing open', () => {
    const { result } = renderHook(() => useFaqAccordion())
    expect(result.current.openId).toBeNull()
    expect(result.current.isOpen('a')).toBe(false)
  })

  it('toggles an item open and closed', () => {
    const { result } = renderHook(() => useFaqAccordion())
    act(() => result.current.toggle('q1'))
    expect(result.current.isOpen('q1')).toBe(true)
    act(() => result.current.toggle('q1'))
    expect(result.current.isOpen('q1')).toBe(false)
  })

  it('closes previous when opening another', () => {
    const { result } = renderHook(() => useFaqAccordion())
    act(() => result.current.toggle('q1'))
    act(() => result.current.toggle('q2'))
    expect(result.current.isOpen('q1')).toBe(false)
    expect(result.current.isOpen('q2')).toBe(true)
  })
})
