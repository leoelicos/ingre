import type { FC, MouseEvent } from 'react'

/** The id of the one main landmark the skip link targets (#131). */
export const MAIN_ID = 'main'

/** Moves focus to the main landmark; the next Tab then reaches its first control. */
export const focusMain = (doc: Document): void => {
  const main = doc.getElementById(MAIN_ID)
  if (main !== null) main.focus()
}

const onSkip = (e: MouseEvent<HTMLAnchorElement>): void => {
  e.preventDefault()
  focusMain(e.currentTarget.ownerDocument)
}

/** First focusable element on every page: hidden until focused, then shown with the shared focus-ring. */
export const SkipLink: FC = () => (
  <a
    href={`#${MAIN_ID}`}
    onClick={onSkip}
    className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:inline-flex focus:min-h-[44px] focus:items-center focus:rounded-control focus:bg-surface focus:px-4 focus:text-primary focus:shadow-card focus:focus-ring"
  >
    Skip to content
  </a>
)
