import { useEffect, useRef, useState } from 'react'
import type { Timers } from './usePendingTicks'
import type { ListSnapshot } from './useShoppingList'
import { EMPTY_LIST } from './useShoppingList'

/** How long "List cleared · Undo" stays up. */
export const UNDO_MS = 10000

/** What a tap on Undo did: put the cleared list back, or nothing (already used or expired). */
export type UndoResult = 'restored' | 'nothing-to-undo'

/**
 * "Start a new list": one tap clears picks, ticks and extras and returns to Pick (no confirm);
 * Undo within UNDO_MS restores the exact previous state, once. The hook owns the snapshot, so a
 * second or stale Undo finds nothing to restore and can never bring back an older list.
 */
export const useStartNewList = (
  list: {
    snapshot: () => ListSnapshot
    restore: (snapshot: ListSnapshot) => void
  },
  timers: Timers
) => {
  const held = useRef<ListSnapshot | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const clock = useRef<number | null>(null)
  const hold = (snapshot: ListSnapshot | null) => {
    held.current = snapshot
    setCanUndo(snapshot !== null)
  }
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
    hold(before)
    stop()
    clock.current = timers.setTimeout(() => {
      clock.current = null
      hold(null)
    }, UNDO_MS)
  }

  const undo = (): UndoResult => {
    const snapshot = held.current
    if (snapshot === null) return 'nothing-to-undo'
    stop()
    hold(null)
    list.restore(snapshot)
    return 'restored'
  }

  return { canUndo, start, undo }
}
