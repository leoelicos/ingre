import { useSyncExternalStore } from 'react'

/**
 * The one breakpoint (#192, antd `sm`): from here the page is desktop (Recipes and Ingredients
 * side by side, discovery in a centred modal); below it, mobile (stacked, a bottom sheet).
 * Keep in step with the `desk` screen in tailwind.config.js.
 */
export const DESKTOP_MIN_WIDTH = 576

export const minWidthQuery = (px: number): string => `(min-width: ${px}px)`

/** The media query list, or null where the browser has no matchMedia (then: narrowest). */
const mediaList = (query: string): MediaQueryList | null =>
  typeof window.matchMedia === 'function' ? window.matchMedia(query) : null

const subscribe = (query: string) => (onChange: () => void) => {
  const list = mediaList(query)
  list?.addEventListener('change', onChange)
  return () => list?.removeEventListener('change', onChange)
}

/** True while the viewport is at least `px` wide; follows resizes. Mobile first: false. */
export const useMinWidth = (px: number): boolean => {
  const query = minWidthQuery(px)
  return useSyncExternalStore(
    subscribe(query),
    () => mediaList(query)?.matches ?? false
  )
}
