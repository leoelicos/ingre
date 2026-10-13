/** Typed localStorage access. Bad, missing or unreadable values yield the fallback. */
export type Parse<T> = (value: unknown) => T | null

export const readStored = <T>(
  key: string,
  parse: Parse<T>,
  fallback: T,
  storage: Storage = localStorage
): T => {
  const raw = storage.getItem(key)
  if (raw === null) return fallback
  try {
    return parse(JSON.parse(raw)) ?? fallback
  } catch {
    return fallback
  }
}

export const writeStored = <T>(
  key: string,
  value: T,
  storage: Storage = localStorage
): void => {
  storage.setItem(key, JSON.stringify(value))
}
