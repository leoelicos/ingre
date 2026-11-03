import { useEffect, useState } from 'react'

/** How much shorter the visible area must be than the page before it counts as a keyboard. */
export const KEYBOARD_MIN_HEIGHT = 150

/** True when the on-screen keyboard is covering the page (#210: the FAB cluster gets out of the way). */
export const isKeyboardOpen = (layoutHeight: number, visibleHeight: number) =>
  layoutHeight - visibleHeight > KEYBOARD_MIN_HEIGHT

/** Follows the visual viewport: true while a keyboard is open; always false where it is unsupported. */
export const useKeyboardOpen = (): boolean => {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const update = () =>
      setOpen(isKeyboardOpen(window.innerHeight, viewport.height))
    viewport.addEventListener('resize', update)
    return () => viewport.removeEventListener('resize', update)
  }, [])
  return open
}
