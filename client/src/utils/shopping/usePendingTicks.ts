import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../useMediaQuery'

/** The timer functions the hook uses; injectable so tests and callers control time. */
export interface Timers {
  setTimeout: (run: () => void, ms: number) => number
  clearTimeout: (id: number) => void
}

export const browserTimers: Timers = {
  setTimeout: (run, ms) => window.setTimeout(run, ms),
  clearTimeout: (id) => window.clearTimeout(id)
}

/** Pause after the latest tick before pending rows move. */
export const TICK_DELAY_MS = 2000
/** Opacity fade as rows move (0 under prefers-reduced-motion). */
export const FADE_MS = 200
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export interface PendingOptions {
  delayMs: number
  fadeMs: number
  timers: Timers
}

const EMPTY: ReadonlySet<string> = new Set()

const without = (set: ReadonlySet<string>, id: string): ReadonlySet<string> =>
  new Set([...set].filter((x) => x !== id))

/**
 * Ticks that wait before moving. One shared clock restarts on every new tick; when it runs out
 * every pending id fades (fadeMs) and is committed together. Undo drops one id without touching
 * the clock or the others. Anything still pending is committed on unmount.
 */
export const usePendingTicks = (
  commit: (ids: readonly string[]) => void,
  { delayMs, fadeMs, timers }: PendingOptions
) => {
  const [pending, setPendingState] = useState<ReadonlySet<string>>(EMPTY)
  const [leaving, setLeaving] = useState<ReadonlySet<string>>(EMPTY)
  const pendingRef = useRef<ReadonlySet<string>>(EMPTY)
  const clock = useRef<number | null>(null)
  const fade = useRef<number | null>(null)
  const leavingRef = useRef<ReadonlySet<string>>(EMPTY)
  const commitRef = useRef(commit)
  commitRef.current = commit

  const setPending = (next: ReadonlySet<string>) => {
    pendingRef.current = next
    setPendingState(next)
  }

  const setFading = (next: ReadonlySet<string>) => {
    leavingRef.current = next
    setLeaving(next)
  }

  const finish = (ids: readonly string[]) => {
    fade.current = null
    commitRef.current(ids)
    setFading(EMPTY)
  }

  const expire = () => {
    clock.current = null
    const ids = [...pendingRef.current]
    if (ids.length === 0) return
    setPending(EMPTY)
    if (fadeMs <= 0) {
      finish(ids)
      return
    }
    setFading(new Set(ids))
    fade.current = timers.setTimeout(() => finish(ids), fadeMs)
  }

  const tick = (id: string) => {
    setPending(new Set([...pendingRef.current, id]))
    if (clock.current !== null) timers.clearTimeout(clock.current)
    clock.current = timers.setTimeout(expire, delayMs)
  }

  const undo = (id: string) => setPending(without(pendingRef.current, id))

  /** Hands back every tick not yet saved (waiting or fading) and drops it, so nothing saves later. */
  const takeUnsaved = (): readonly string[] => {
    const ids = [...pendingRef.current, ...leavingRef.current]
    if (clock.current !== null) timers.clearTimeout(clock.current)
    if (fade.current !== null) timers.clearTimeout(fade.current)
    clock.current = null
    fade.current = null
    setPending(EMPTY)
    setFading(EMPTY)
    return ids
  }

  useEffect(
    () => () => {
      if (clock.current !== null) timers.clearTimeout(clock.current)
      if (pendingRef.current.size > 0)
        commitRef.current([...pendingRef.current])
    },
    [timers]
  )

  return { pending, leaving, tick, undo, takeUnsaved }
}

/** Everything a group of rows needs to show ticks: checked, moved, pending, fading. */
export interface TickState {
  checkedIds: ReadonlySet<string>
  /** committed ticks (these rows have moved) */
  movedIds: ReadonlySet<string>
  pendingIds: ReadonlySet<string>
  leavingIds: ReadonlySet<string>
  /** e.g. "In basket"; shown with Undo while a row is pending */
  pendingLabel: string
  onToggle: (id: string) => void
  onUndo: (id: string) => void
  /** ticks not yet saved, dropped as they are handed back (see usePendingTicks) */
  takeUnsaved: () => readonly string[]
}

/** Ticks that apply at once (e.g. unticking in Already have). */
export const instantTicks = (
  checkedIds: ReadonlySet<string>,
  onToggle: (id: string) => void
): TickState => ({
  checkedIds,
  movedIds: checkedIds,
  pendingIds: EMPTY,
  leavingIds: EMPTY,
  pendingLabel: '',
  onToggle,
  onUndo: onToggle,
  takeUnsaved: () => []
})

/**
 * Delayed ticks over a committed set: new ticks wait (see usePendingTicks); unticking a moved
 * row is immediate and returns it to its place; ticking a pending row again is Undo.
 */
export const useDelayedTicks = (
  committed: ReadonlySet<string>,
  commit: (ids: readonly string[]) => void,
  untick: (id: string) => void,
  pendingLabel: string,
  timers: Timers = browserTimers
): TickState => {
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY)
  const { pending, leaving, tick, undo, takeUnsaved } = usePendingTicks(
    commit,
    {
      delayMs: TICK_DELAY_MS,
      fadeMs: reduced ? 0 : FADE_MS,
      timers
    }
  )
  return {
    checkedIds: new Set([...committed, ...pending, ...leaving]),
    movedIds: committed,
    pendingIds: pending,
    leavingIds: leaving,
    pendingLabel,
    onToggle: (id) =>
      committed.has(id) ? untick(id) : pending.has(id) ? undo(id) : tick(id),
    onUndo: undo,
    takeUnsaved
  }
}
