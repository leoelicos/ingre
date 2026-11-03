import type { FC, ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import type { Guidance } from '../guidance/guidance'
import { DEFAULT_GUIDANCE, parseGuidance } from '../guidance/guidance'
import { useStored } from '../storage/useStored'

/** Where the dial's position is kept on this device. */
export const GUIDANCE_KEY = 'ingre.explore.guidance'

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
  /** the dial (#206): how much Explore does unasked; Assisted until the user turns it */
  readonly guidance: Guidance
  readonly setGuidance: (mode: Guidance) => void
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
  const [guidance, updateGuidance] = useStored<Guidance>(
    GUIDANCE_KEY,
    parseGuidance,
    DEFAULT_GUIDANCE
  )
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
    toggleSelected: (id) => setSelected((current) => toggled(current, id)),
    guidance,
    setGuidance: (mode) => updateGuidance(() => mode)
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
