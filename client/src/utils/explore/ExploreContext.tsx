import type { FC, ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'

/** Explore's state (#181), shared by the header search, the drawer and the page. */
export interface ExploreState {
  readonly query: string
  readonly setQuery: (query: string) => void
  /** null until the page decides on load (open when nothing is selected) */
  readonly open: boolean | null
  readonly collapsed: boolean
  /** search focus, typing or the drawer's search button: open and expanded */
  readonly show: () => void
  /** only Explore's X closes it */
  readonly close: () => void
  readonly toggleCollapsed: () => void
  /** the search box should take focus once it is on screen (after a move or reopen) */
  readonly focusPending: boolean
  readonly requestFocus: () => void
  readonly focusTaken: () => void
}

const ExploreContext = createContext<ExploreState | null>(null)

export const useExploreState = (): ExploreState => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<boolean | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [focusPending, setFocusPending] = useState(false)
  return {
    query,
    setQuery,
    open,
    collapsed,
    show: () => {
      setOpen(true)
      setCollapsed(false)
    },
    close: () => setOpen(false),
    toggleCollapsed: () => setCollapsed(!collapsed),
    focusPending,
    requestFocus: () => setFocusPending(true),
    focusTaken: () => setFocusPending(false)
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
