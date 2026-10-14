import { act, renderHook } from '@testing-library/react'
import { useMediaQuery } from '../useMediaQuery'

class FakeList extends EventTarget implements MediaQueryList {
  matches = false
  media = '(x)'
  onchange = null
  addListener() {}
  removeListener() {}
}

describe('useMediaQuery', () => {
  const original = window.matchMedia
  afterEach(() => {
    window.matchMedia = original
  })

  it('is false without matchMedia', () => {
    expect(renderHook(() => useMediaQuery('(x)')).result.current).toBe(false)
  })

  it('follows change events and unsubscribes', () => {
    const list = new FakeList()
    window.matchMedia = () => list
    const { result, unmount } = renderHook(() => useMediaQuery('(x)'))
    expect(result.current).toBe(false)
    list.matches = true
    act(() => {
      list.dispatchEvent(new Event('change'))
    })
    expect(result.current).toBe(true)
    unmount()
    list.matches = false
    list.dispatchEvent(new Event('change'))
    expect(result.current).toBe(true)
  })
})
