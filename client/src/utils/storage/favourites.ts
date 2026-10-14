import { useState } from 'react'
import { readStored, writeStored } from './storage'
import { parseStringSet } from './useStored'

export const FAVOURITES_KEY = 'ingre.favourites'

/** Favourite recipe ids, read fresh from this device's storage. */
export const readFavourites = (): ReadonlySet<string> =>
  readStored(FAVOURITES_KEY, parseStringSet, new Set())

/**
 * One recipe's heart. Saved on this device only (no account). Each toggle re-reads storage
 * so hearts on many cards never overwrite each other.
 */
export const useFavourite = (id: string): [boolean, () => void] => {
  const [on, setOn] = useState(() => readFavourites().has(id))
  const toggle = () => {
    const current = readFavourites()
    const next = current.has(id)
      ? [...current].filter((x) => x !== id)
      : [...current, id]
    writeStored(FAVOURITES_KEY, next)
    setOn(next.includes(id))
  }
  return [on, toggle]
}
