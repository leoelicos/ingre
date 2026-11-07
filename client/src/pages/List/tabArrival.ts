/* Arriving from a tab (#227): Inventory and Cook land on their section, Explore on its search. */
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import type { ExploreState } from '../../utils/explore/ExploreContext'
import { focusById, scrollBehaviour, scrollToStartOf } from '../../utils/focus'

export interface Arrival {
  readonly sectionId: string
  readonly headingId: string
}

/** Where each section tab lands: the section's top, with its heading focused. */
export const ARRIVALS: Readonly<Record<string, Arrival>> = {
  '#inventory': { sectionId: 'ingredients', headingId: 'ingredients-heading' },
  '#cook': { sectionId: 'recipes', headingId: 'recipes-heading' }
}

/** Explore is search: the top of the page, expanded, with the search box taking focus. */
export const arriveAtExplore = (explore: ExploreState): void => {
  window.scrollTo({ top: 0, behavior: scrollBehaviour() })
  explore.show()
  explore.requestFocus()
}

export const arriveAt = (hash: string, explore: ExploreState): void => {
  if (hash === '#explore') arriveAtExplore(explore)
  Object.entries(ARRIVALS)
    .filter(([key]) => key === hash)
    .forEach(([, { sectionId, headingId }]) => {
      scrollToStartOf(sectionId)
      // Focus after the next paint so the heading is in the DOM
      requestAnimationFrame(() => focusById(headingId))
    })
}

/** Follows the tab pressed, each time it is pressed (the location's key changes), not on every render. */
export const useTabArrival = (explore: ExploreState): void => {
  const { hash, key } = useLocation()
  const latest = useRef(explore)
  latest.current = explore
  useEffect(() => arriveAt(hash, latest.current), [hash, key])
}
