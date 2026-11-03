import { useEffect, useRef } from 'react'
import { track } from './events'

/** How long the text must sit still before it counts as a search. */
export const SEARCH_SETTLE_MS = 800

/** The text as logged: trimmed, one space between words. */
export const searchedText = (query: string): string =>
  query.trim().replace(/\s+/g, ' ')

/** Blank text is not a search, and the same text is not logged twice in a row. */
export const isNewSearch = (text: string, previous: string): boolean =>
  text !== '' && text !== previous

/**
 * Logs ingredient_searched (#222) once the Explore text settles: not per keystroke, not for
 * blank text, and not again for the same text until it changes.
 */
export const useSearchedEvent = (
  query: string,
  matches: { readonly ingredients: number; readonly recipes: number }
): void => {
  const previous = useRef('')
  const latest = useRef(matches)
  latest.current = matches
  useEffect(() => {
    const text = searchedText(query)
    const timer = setTimeout(() => {
      if (isNewSearch(text, previous.current))
        track('ingredient_searched', { query: text, ...latest.current })
      previous.current = text
    }, SEARCH_SETTLE_MS)
    return () => clearTimeout(timer)
  }, [query])
}
