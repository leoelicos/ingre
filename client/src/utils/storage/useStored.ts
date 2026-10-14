import { useState } from 'react'
import type { Parse } from './storage'
import { readStored, writeStored } from './storage'

/** React state mirrored to localStorage under `key`. `encode` maps the value to JSON-safe data. */
export const useStored = <T>(
  key: string,
  parse: Parse<T>,
  fallback: T,
  encode: (value: T) => unknown = (value) => value
): [T, (update: (previous: T) => T) => void] => {
  const [value, setValue] = useState<T>(() => readStored(key, parse, fallback))
  const update = (fn: (previous: T) => T) =>
    setValue((previous) => {
      const next = fn(previous)
      writeStored(key, encode(next))
      return next
    })
  return [value, update]
}

export const parseStringSet = (value: unknown): Set<string> | null =>
  Array.isArray(value) && value.every((v) => typeof v === 'string')
    ? new Set(value)
    : null

/** Persisted set of ids with toggle, remove, add-all and replace. */
export const useStoredSet = (
  key: string,
  fallback: ReadonlySet<string>
): [
  ReadonlySet<string>,
  (id: string) => void,
  (id: string) => void,
  (ids: readonly string[]) => void,
  (ids: ReadonlySet<string>) => void
] => {
  const [ids, update] = useStored<ReadonlySet<string>>(
    key,
    parseStringSet,
    fallback,
    (set) => [...set]
  )
  const toggle = (id: string) =>
    update((previous) =>
      previous.has(id)
        ? new Set([...previous].filter((x) => x !== id))
        : new Set([...previous, id])
    )
  const remove = (id: string) =>
    update((previous) => new Set([...previous].filter((x) => x !== id)))
  const addAll = (more: readonly string[]) =>
    update((previous) => new Set([...previous, ...more]))
  const replaceAll = (next: ReadonlySet<string>) => update(() => next)
  return [ids, toggle, remove, addAll, replaceAll]
}
