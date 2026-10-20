import { useEffect, useRef, useState } from 'react'
import type { Timers } from './usePendingTicks'
import type { ListSnapshot, UnsavedTicks } from './useShoppingList'
import { EMPTY_LIST, sameList, withUnsaved } from './useShoppingList'

/** How long "List cleared · Undo" stays up. */
export const UNDO_MS = 10000

/** What a tap on Undo did: put the cleared list back, or nothing (already used, expired or stale). */
export type UndoResult = 'restored' | 'nothing-to-undo'

/** True while the list is still exactly what "Start a new list" left: nothing picked, ticked, added or moved. */
export const stillCleared = (current: ListSnapshot): boolean =>
  sameList(current, EMPTY_LIST)

/**
 * "Start a new list": one tap clears picks, ticks (saved and still waiting on the tick clock),
 * extras and step, and returns to Pick (no confirm). Undo within UNDO_MS restores that exact
 * state, once. The countdown is paused while focus is inside the note (pause/resume). The snapshot is dropped as soon as the list changes (a pick, a tick, a new item or a
 * step change), so Undo can never put an old list over a newer one.
 */
export const useStartNewList = (
  list: {
    snapshot: () => ListSnapshot
    restore: (snapshot: ListSnapshot) => void
  },
  timers: Timers
) => {
  const held = useRef<ListSnapshot | null>(null)
  const [holding, setHolding] = useState(false)
  const clock = useRef<number | null>(null)
  const unchanged = stillCleared(list.snapshot())

  const hold = (snapshot: ListSnapshot | null): void => {
    held.current = snapshot
    setHolding(snapshot !== null)
  }
  const stop = (): void => {
    if (clock.current !== null) timers.clearTimeout(clock.current)
    clock.current = null
  }
  const forget = (): void => {
    stop()
    hold(null)
  }

  useEffect(() => {
    if (holding && !unchanged) forget()
  })
  useEffect(
    () => () => {
      if (clock.current !== null) timers.clearTimeout(clock.current)
    },
    [timers]
  )

  /** (Re)starts the full UNDO_MS countdown; when it runs out the snapshot is dropped. */
  const countDown = (): void => {
    stop()
    clock.current = timers.setTimeout(() => {
      clock.current = null
      hold(null)
    }, UNDO_MS)
  }

  const start = (unsaved: UnsavedTicks): void => {
    const before = withUnsaved(list.snapshot(), unsaved)
    list.restore(EMPTY_LIST)
    hold(before)
    countDown()
  }

  /** Focus is inside the note: the countdown stops, so a keyboard user is never timed out. */
  const pause = (): void => stop()

  /** Focus left the note: a fresh UNDO_MS countdown starts, if there is still something to undo. */
  const resume = (): void => {
    if (held.current !== null) countDown()
  }

  const undo = (): UndoResult => {
    const snapshot = held.current
    if (snapshot === null) return 'nothing-to-undo'
    forget()
    list.restore(snapshot)
    return 'restored'
  }

  return { canUndo: holding && unchanged, start, undo, pause, resume }
}
