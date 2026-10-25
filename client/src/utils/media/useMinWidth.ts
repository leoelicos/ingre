import { useSyncExternalStore } from 'react'

/** Side by side from here (#181): Ingredients and Recipes in two columns. */
export const SPLIT_MIN_WIDTH = 576
/** From here: 25/75 and 75/25. */
export const WIDE_MIN_WIDTH = 992
/**
 * From here: Explore is a drawer column on the right holding the search bar, and the
 * layout toggle also offers 33/33/33. 1328px is the 1282px layout width plus room around it.
 */
export const DRAWER_MIN_WIDTH = 1328

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
