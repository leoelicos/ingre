import type { FC, ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'

/** Explore's state (#181), shared by the header search, the drawer and the page. */
export interface ExploreState {
  readonly query: string
  readonly setQuery: (query: string) => void
  /**
   * Explore is always on the page; this says whether it is expanded or collapsed to its
   * header row (or the drawer's strip). null until the page decides on load.
   */
  readonly expanded: boolean | null
  /** search focus, typing, the drawer's search button or the header row: expanded */
  readonly show: () => void
  /** Explore's X or the header row: collapsed, never removed */
  readonly collapse: () => void
  /** the search box should take focus once it is on screen (after a move or reopen) */
  readonly focusPending: boolean
  readonly requestFocus: () => void
  readonly focusTaken: () => void
  /** the ingredients being cooked with (#204): suggestions are built from these */
  readonly selected: ReadonlySet<string>
  readonly toggleSelected: (id: string) => void
}

/** The selection with an ingredient added, or taken out when it is already there. */
export const toggled = (
  selected: ReadonlySet<string>,
  id: string
): ReadonlySet<string> =>
  new Set(
    selected.has(id) ? [...selected].filter((x) => x !== id) : [...selected, id]
  )

const ExploreContext = createContext<ExploreState | null>(null)

export const useExploreState = (): ExploreState => {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<boolean | null>(null)
  const [focusPending, setFocusPending] = useState(false)
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  return {
    query,
    setQuery,
    expanded,
    show: () => setExpanded(true),
    collapse: () => setExpanded(false),
    focusPending,
    requestFocus: () => setFocusPending(true),
    focusTaken: () => setFocusPending(false),
    selected,
    toggleSelected: (id) => setSelected((current) => toggled(current, id))
  }
}

export const ExploreProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <ExploreContext.Provider value={useExploreState()}>
    {children}
  </ExploreContext.Provider>
)

export const useExplore = (): ExploreState => {
  const explore = useContext(ExploreContext)
  if (explore === null) throw new Error('useExplore needs an ExploreProvider')
  return explore
}
