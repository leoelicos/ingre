/* The War room's history, kept in localStorage (t26u). */
import { useStored } from '../storage/useStored'
import type { Added, HistoryEntry } from './history'
import {
  HISTORY_KEY,
  newEntries,
  parseHistory,
  withEntries,
  withoutIds
} from './history'

export const useHistory = () => {
  const [entries, update] = useStored<readonly HistoryEntry[]>(
    HISTORY_KEY,
    parseHistory,
    []
  )
  return {
    entries,
    /** Logs what was just added and returns the new entries, so they can be undone. */
    add: (added: readonly Added[], at = Date.now()): HistoryEntry[] => {
      const fresh = newEntries(added, at)
      update((previous) => withEntries(previous, fresh))
      return fresh
    },
    remove: (ids: ReadonlySet<string>): void =>
      update((previous) => withoutIds(previous, ids)),
    clear: (): void => update(() => []),
    /** puts back a whole history, for Undo after Clear */
    restore: (entries: readonly HistoryEntry[]): void => update(() => entries)
  }
}
