import type { FC, ReactNode } from 'react'

/**
 * Every open and close on the single page (#179): a short, snappy 0.2 s, and instant with
 * reduced motion. Shared so every expanding part moves the same way.
 */
export const MOTION =
  'duration-200 ease-out motion-reduce:duration-0 motion-reduce:transition-none'

/**
 * Height animates through grid rows (0fr to 1fr); `@starting-style` animates the first
 * open and `allow-discrete` keeps it shown while it closes. Closed is `hidden`, so it is out
 * of the tab order, the accessibility tree and the layout.
 */
export const collapseClass = (open: boolean): string =>
  [
    'transition-[grid-template-rows,display] [transition-behavior:allow-discrete]',
    MOTION,
    open
      ? 'grid grid-rows-[1fr] [@starting-style]:grid-rows-[0fr]'
      : 'grid-rows-[0fr]'
  ].join(' ')

/** The inner wrapper the grid row squeezes; it must have no padding of its own. */
export const COLLAPSE_INNER = 'min-h-0 overflow-hidden'

/** Room inside the clipped wrapper so focus rings (3px + 2px offset) are never cut off. */
export const COLLAPSE_ROOM = 'p-1.5'

/** Content that opens inline and pushes what is below it down. */
export const Collapse: FC<{
  id: string
  open: boolean
  className?: string
  children: ReactNode
}> = ({ id, open, className = '', children }) => (
  <div
    id={id}
    hidden={!open}
    data-collapse=""
    className={`${collapseClass(open)} ${className}`}
  >
    <div className={COLLAPSE_INNER}>
      <div className={COLLAPSE_ROOM}>{children}</div>
    </div>
  </div>
)

/** A chevron that turns when its part opens. Decorative: the button says expanded or collapsed. */
export const Chevron: FC<{ open: boolean }> = ({ open }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${MOTION} ${
      open ? 'rotate-180' : ''
    }`}
  >
    <path d="M5 7.5l5 5 5-5" />
  </svg>
)
