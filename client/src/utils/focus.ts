/** Focus and scroll helpers for the single page (#179); ids keep components free of ref plumbing. */

/** Moves focus to the element with this id; nothing happens when it isn't on the page. */
export const focusById = (id: string): void => {
  document.getElementById(id)?.focus({ preventScroll: true })
}

/** True when the user asked the device for less motion. */
export const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Smooth scrolling, or an instant jump with reduced motion. */
export const scrollBehaviour = (): ScrollBehavior =>
  prefersReducedMotion() ? 'auto' : 'smooth'

/** Scrolls the element into view and focuses it (#179: an existing chip picked from the plus). */
export const revealById = (id: string): void => {
  const element = document.getElementById(id)
  element?.scrollIntoView({ block: 'nearest', behavior: scrollBehaviour() })
  element?.focus({ preventScroll: true })
}

/** Scrolls the element with this id to the top of the screen; nothing when it isn't there. */
export const scrollToStartOf = (id: string): void => {
  document
    .getElementById(id)
    ?.scrollIntoView({ block: 'start', behavior: scrollBehaviour() })
}

/** Focuses the checked radio inside the element with this id. */
export const focusCheckedIn = (id: string): void => {
  document
    .getElementById(id)
    ?.querySelector<HTMLElement>('input:checked')
    ?.focus()
}

/** Focuses the first of these ids that is on the page (#182: after a chip's box goes away). */
export const focusFirstOf = (ids: readonly string[]): void => {
  ids
    .map((id) => document.getElementById(id))
    .find((element) => element !== null)
    ?.focus({ preventScroll: true })
}
