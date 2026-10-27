/** Gesture and focus rules for the workspace (#192). Pure, so the thresholds are easy to test. */

export const DELETE_THRESHOLD = 96

export interface SwipeSample {
  readonly dx: number
  readonly dy: number
  /** How far the horizontal scroller moved during the gesture. */
  readonly scrollDelta: number
}

export type SwipeVerdict = 'pending' | 'scroll' | 'delete'

/**
 * A horizontal drag deletes a recipe card only once it clears the threshold and the
 * scroller itself did not move. A vertical drag, or one the row scrolled through, is a scroll.
 */
export const classifySwipe = (sample: SwipeSample): SwipeVerdict => {
  if (Math.abs(sample.scrollDelta) > 8) return 'scroll'
  if (Math.abs(sample.dy) > Math.abs(sample.dx)) return 'scroll'
  if (Math.abs(sample.dx) < DELETE_THRESHOLD) return 'pending'
  return 'delete'
}

/** A downward drag on the sheet handle closes it; a sideways drag does not. */
export const sheetShouldClose = (dy: number, dx: number): boolean =>
  dy > 72 && dy > Math.abs(dx) * 1.2

/** Holds the pointer on the handle so the drag still ends there. No-op when the browser can't. */
export const capturePointer = (el: HTMLElement, pointerId: number): void => {
  if (typeof el.setPointerCapture !== 'function') return
  try {
    el.setPointerCapture(pointerId)
  } catch {
    // jsdom has the method but no live pointer to capture
  }
}

/** The control that opened discovery, when focus is on one. */
export const openerFrom = (active: EventTarget | null): HTMLElement | null =>
  active instanceof HTMLElement ? active : null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]'

/** Focusable controls inside a dialog, in tab order. */
export const focusableIn = (root: ParentNode): HTMLElement[] =>
  [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => {
    if (el.hasAttribute('disabled')) return false
    if (el.getAttribute('tabindex') === '-1') return false
    if (el.closest('[hidden]') !== null) return false
    return true
  })

/** How far the recipe row's scroller has moved, or 0 when the row is not in one. */
export const rowScroll = (el: HTMLElement): number => {
  const parent = el.parentElement
  return parent === null ? 0 : parent.scrollLeft
}

/**
 * Where Tab should go inside a trap. null means the browser can move to the next control.
 * One control, or Tab off either end, stays inside.
 */
export const trapTarget = (
  items: readonly HTMLElement[],
  current: EventTarget | null,
  shift: boolean
): HTMLElement | null => {
  const first = items[0]
  if (first === undefined) return null
  let last = first
  for (const item of items) last = item
  if (items.length === 1) return first
  const index = items.indexOf(current instanceof HTMLElement ? current : first)
  if (index === -1) return first
  if (shift && index === 0) return last
  if (!shift && index === items.length - 1) return first
  return null
}

/** Tab from `current` inside `root`, or null when the browser should move focus itself. */
export const tabTarget = (
  root: ParentNode | null,
  current: EventTarget | null,
  shift: boolean
): HTMLElement | null => {
  if (root === null) return null
  return trapTarget(focusableIn(root), current, shift)
}

/** Focus the dialog's search field once it is open. */
export const focusFirstInput = (root: ParentNode | null): void => {
  if (root === null) return
  const search = root.querySelector('input')
  if (!(search instanceof HTMLElement)) return
  search.focus()
}

export type EscapeAction = 'ignore' | 'close'

/**
 * Escape closes discovery only when nothing inside it wants the key: a listbox, a search
 * that still has text, or the open plus.
 */
export const escapeAction = (
  root: ParentNode | null,
  active: EventTarget | null
): EscapeAction => {
  if (root === null) return 'ignore'
  if (document.querySelector('[role="listbox"]') !== null) return 'ignore'
  if (active instanceof HTMLInputElement && active.value !== '') return 'ignore'
  if (root.querySelector('#add-ingredient[aria-expanded="true"]') !== null) {
    return 'ignore'
  }
  return 'close'
}
