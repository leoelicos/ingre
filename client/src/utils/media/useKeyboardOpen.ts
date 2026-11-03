/* The on-screen keyboard (#228): while it is up, the fixed bars and buttons at the bottom get out of the way. */
import { useEffect, useState } from 'react'

/** A visible area this much shorter than the page's is the keyboard, not browser chrome (px). */
export const KEYBOARD_MIN_HEIGHT = 150

/** True when the visible height is short of the layout height by more than the browser's own bars. */
export const keyboardOpen = (
  layoutHeight: number,
  visibleHeight: number
): boolean => layoutHeight - visibleHeight > KEYBOARD_MIN_HEIGHT

/** True while the on-screen keyboard is up; follows the visual viewport. Never true without one. */
export const useKeyboardOpen = (): boolean => {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const update = () =>
      setOpen(keyboardOpen(window.innerHeight, viewport.height))
    update()
    viewport.addEventListener('resize', update)
    return () => viewport.removeEventListener('resize', update)
  }, [])
  return open
}
