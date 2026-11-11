import { act } from '@testing-library/react'

/*
 * A stand-in for IntersectionObserver (jsdom has none): tests say what each watched element
 * does, by its id, e.g. the Ingredients section reaching the top (#192: the FAB) or Recipes
 * scrolling out of view (Scroll to top).
 */

const ENTRY: Omit<IntersectionObserverEntry, 'target'> = {
  isIntersecting: false,
  boundingClientRect: new DOMRect(0, -500, 10, 10),
  intersectionRatio: 0,
  intersectionRect: new DOMRect(),
  rootBounds: null,
  time: 0
}

type Fire = (entry: Partial<IntersectionObserverEntry>) => void

const watched = new Map<string, Fire>()
/** The rootMargin each id was watched with. */
export const margins = new Map<string, string>()
/** The ids whose observers have disconnected. */
export const disconnected: string[] = []

class FakeObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin: string
  readonly scrollMargin = ''
  readonly thresholds = []
  private readonly ids: string[] = []
  constructor(
    private readonly callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
  ) {
    this.rootMargin = options.rootMargin ?? ''
  }
  observe(target: Element): void {
    this.ids.push(target.id)
    margins.set(target.id, this.rootMargin)
    watched.set(target.id, (entry) =>
      act(() => this.callback([{ ...ENTRY, target, ...entry }], this))
    )
  }
  unobserve(): void {}
  disconnect(): void {
    disconnected.push(...this.ids)
  }
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

const original = window.IntersectionObserver

/** Installs the stand-in; call before render. */
export const fakeObserver = (): void => {
  watched.clear()
  margins.clear()
  disconnected.length = 0
  window.IntersectionObserver = FakeObserver
}

/** Back to jsdom's default: no IntersectionObserver. */
export const resetObserver = (): void => {
  window.IntersectionObserver = original
}

/** Tells the observer of the element with this id what it sees now. */
export const fire = (
  id: string,
  entry: Partial<IntersectionObserverEntry>
): void => {
  const send = watched.get(id)
  if (send === undefined) throw new Error(`nothing watches #${id}`)
  send(entry)
}
