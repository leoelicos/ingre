import { renderHook } from '@testing-library/react'
import {
  installViewport,
  removeViewport,
  setKeyboard
} from '../../../test/keyboard'
import {
  KEYBOARD_MIN_HEIGHT,
  keyboardOpen,
  useKeyboardOpen
} from '../useKeyboardOpen'

describe('the on-screen keyboard (#228)', () => {
  afterEach(() => {
    setKeyboard(false)
    removeViewport()
  })

  it('is the visible area being short of the page by more than the browser bars', () => {
    expect(keyboardOpen(800, 800)).toBe(false)
    expect(keyboardOpen(800, 800 - KEYBOARD_MIN_HEIGHT)).toBe(false)
    expect(keyboardOpen(800, 800 - KEYBOARD_MIN_HEIGHT - 1)).toBe(true)
    expect(keyboardOpen(800, 450)).toBe(true)
  })

  it('follows the visual viewport up and down', () => {
    installViewport()
    const { result, unmount } = renderHook(() => useKeyboardOpen())
    expect(result.current).toBe(false)
    setKeyboard(true)
    expect(result.current).toBe(true)
    setKeyboard(false)
    expect(result.current).toBe(false)
    unmount()
    setKeyboard(true)
    expect(result.current).toBe(false)
  })

  it('is false where the browser has no visual viewport', () => {
    removeViewport()
    expect(renderHook(() => useKeyboardOpen()).result.current).toBe(false)
  })
})
