import { useEffect, useRef, useState } from 'react'
import type { Timers } from './usePendingTicks'
import type { ListSnapshot } from './useShoppingList'
import { EMPTY_LIST } from './useShoppingList'

/** How long "List cleared · Undo" stays up. */
export const UNDO_MS = 10000

/**
 * "Start a new list": one tap clears picks, ticks and extras and returns to Pick (no confirm);
 * Undo within UNDO_MS restores the exact previous state.
 */
export const useStartNewList = (
  list: {
    snapshot: () => ListSnapshot
    restore: (snapshot: ListSnapshot) => void
  },
  timers: Timers
) => {
  const [previous, setPrevious] = useState<ListSnapshot | null>(null)
  const clock = useRef<number | null>(null)
  const stop = () => {
    if (clock.current !== null) timers.clearTimeout(clock.current)
    clock.current = null
  }
  useEffect(
    () => () => {
      if (clock.current !== null) timers.clearTimeout(clock.current)
    },
    [timers]
  )

  const start = () => {
    const before = list.snapshot()
    list.restore(EMPTY_LIST)
    setPrevious(before)
    stop()
    clock.current = timers.setTimeout(() => {
      clock.current = null
      setPrevious(null)
    }, UNDO_MS)
  }

  const undo = (snapshot: ListSnapshot) => {
    stop()
    list.restore(snapshot)
    setPrevious(null)
  }

  return { previous, start, undo }
}
