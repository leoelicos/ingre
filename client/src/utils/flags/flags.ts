import { readStored, writeStored } from '../storage/storage'

/**
 * Feature flags (#208): unfinished features stay off until someone opts in.
 * Everything is off by default. `?flags=tiers` turns a flag on for this device
 * and it stays on; `?flags=` (empty) turns every flag off again.
 */
export const FLAGS = ['tiers', 'seasonality', 'micropayments'] as const
export type Flag = (typeof FLAGS)[number]

export const FLAGS_KEY = 'ingre.flags'

const isFlag = (value: unknown): value is Flag =>
  FLAGS.some((flag) => flag === value)

/** The known flags in a stored list; null when it is not a list. */
export const parseFlags = (value: unknown): Flag[] | null =>
  Array.isArray(value) ? value.filter(isFlag) : null

/** The flags named in `?flags=a,b`; null when the query has none. */
export const flagsFromSearch = (search: string): Flag[] | null => {
  const named = new URLSearchParams(search).get('flags')
  return named === null ? null : named.split(',').filter(isFlag)
}

/** The flags this page runs with: the query if it names any, else what the device kept. */
export const resolveFlags = (
  search: string,
  storage: Storage = localStorage
): Flag[] => {
  const fromSearch = flagsFromSearch(search)
  if (fromSearch === null) return readStored(FLAGS_KEY, parseFlags, [], storage)
  writeStored(FLAGS_KEY, fromSearch, storage)
  return fromSearch
}

export const isEnabled = (flag: Flag, enabled: readonly Flag[]): boolean =>
  enabled.includes(flag)
