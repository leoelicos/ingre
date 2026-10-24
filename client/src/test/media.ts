import { act } from '@testing-library/react'

/**
 * A stand-in for the browser's matchMedia that understands "(min-width: Npx)", so tests can
 * set and change the viewport width (#181). jsdom has no matchMedia of its own.
 */
let width = 0
const lists = new Set<FakeMediaQueryList>()

/** "(min-width: 576px)" is 576 */
const minWidth = (query: string): number => Number(query.replace(/\D/g, ''))

class FakeMediaQueryList extends EventTarget implements MediaQueryList {
  onchange = null
  constructor(readonly media: string) {
    super()
    lists.add(this)
  }
  get matches(): boolean {
    return width >= minWidth(this.media)
  }
  addListener(): void {}
  removeListener(): void {}
}

/** Sets the viewport width and tells every listener, as a resize would. */
export const setViewportWidth = (px: number): void => {
  width = px
  if (typeof window.matchMedia !== 'function')
    window.matchMedia = (query: string) => new FakeMediaQueryList(query)
  act(() => lists.forEach((list) => list.dispatchEvent(new Event('change'))))
}

/** Back to jsdom's default: no matchMedia at all. */
export const resetViewport = (): void => {
  lists.clear()
  Reflect.deleteProperty(window, 'matchMedia')
}
