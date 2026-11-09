/*
 * The War room's history (t26u): what went on the list, newest first, kept on this device.
 * Pure functions here; the hook in useHistory keeps it in localStorage.
 */

export const HISTORY_KEY = 'ingre.warRoom.history'

/** Enough for a few weeks of shops; the oldest fall off. */
export const HISTORY_CAP = 200

export interface HistoryEntry {
  readonly id: string
  readonly itemId: string
  readonly quantity: number
  /** when it was added, ms since the epoch */
  readonly at: number
}

export interface Added {
  readonly itemId: string
  readonly quantity: number
}

const isEntry = (value: unknown): value is HistoryEntry => {
  if (typeof value !== 'object' || value === null) return false
  const { id, itemId, quantity, at } = value as Record<string, unknown>
  return (
    typeof id === 'string' &&
    typeof itemId === 'string' &&
    typeof quantity === 'number' &&
    quantity >= 1 &&
    typeof at === 'number'
  )
}

/** Stored history, with anything malformed left out; null when it is not a list at all. */
export const parseHistory = (value: unknown): HistoryEntry[] | null =>
  Array.isArray(value) ? value.filter(isEntry).slice(0, HISTORY_CAP) : null

let made = 0

/** A new entry's id: unique on this device. */
export const entryId = (at: number, itemId: string): string => {
  made += 1
  return `${at.toString(36)}-${made.toString(36)}-${itemId}`
}

/** Entries for what was just added, the first added at the bottom so the newest reads first. */
export const newEntries = (
  added: readonly Added[],
  at: number
): HistoryEntry[] =>
  [...added].reverse().map(({ itemId, quantity }) => ({
    id: entryId(at, itemId),
    itemId,
    quantity,
    at
  }))

/** New entries on top of the history, the oldest dropped past the cap. */
export const withEntries = (
  history: readonly HistoryEntry[],
  entries: readonly HistoryEntry[]
): HistoryEntry[] => [...entries, ...history].slice(0, HISTORY_CAP)

/** The history without these entries. */
export const withoutIds = (
  history: readonly HistoryEntry[],
  ids: ReadonlySet<string>
): HistoryEntry[] => history.filter(({ id }) => !ids.has(id))

/** The most recently added items, each once. */
export const recentItemIds = (
  history: readonly HistoryEntry[],
  limit: number
): string[] => [...new Set(history.map(({ itemId }) => itemId))].slice(0, limit)

/** Items added more than once, most often first (ties: the more recent first). */
export const frequentItemIds = (
  history: readonly HistoryEntry[],
  limit: number
): string[] => {
  const counts = new Map<string, number>()
  history.forEach(({ itemId }) =>
    counts.set(itemId, (counts.get(itemId) ?? 0) + 1)
  )
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([itemId]) => itemId)
    .slice(0, limit)
}

/** Midnight at the start of the day `at` falls in, on this device's clock. */
export const dayStart = (at: number): number => {
  const date = new Date(at)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export interface HistoryDay {
  /** midnight that starts the day */
  readonly day: number
  /** 0 today, 1 yesterday, ... */
  readonly daysAgo: number
  readonly entries: readonly HistoryEntry[]
}

/** Newest-first entries in days, newest day first. */
export const byDay = (
  history: readonly HistoryEntry[],
  now: number
): HistoryDay[] => {
  const today = dayStart(now)
  const days: { day: number; entries: HistoryEntry[] }[] = []
  history.forEach((entry) => {
    const day = dayStart(entry.at)
    const last = days[days.length - 1]
    if (last?.day === day) last.entries.push(entry)
    else days.push({ day, entries: [entry] })
  })
  return days.map(({ day, entries }) => ({
    day,
    daysAgo: Math.round((today - day) / 86_400_000),
    entries
  }))
}
