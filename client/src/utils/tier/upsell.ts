import { useEffect, useSyncExternalStore } from 'react'
import type { Parse } from '../storage/storage'
import { readStored, writeStored } from '../storage/storage'

/**
 * The upsell (#208): shown only after the first end-to-end (a picked recipe and every
 * chip crossed off), and only in the account menu and the Plans page. Never a modal,
 * banner or interstitial.
 */
export const FIRST_END_TO_END_KEY = 'ingre.tier.firstEndToEnd'
const CHANGED = 'ingre:first-end-to-end'

const parseDone: Parse<boolean> = (value) =>
  typeof value === 'boolean' ? value : null

interface ChipProgress {
  readonly crossed: boolean
  /** removed from every recipe: it can't be crossed off, so it doesn't count */
  readonly greyed: boolean
}

export const isEndToEnd = (
  chips: readonly ChipProgress[],
  pickedCount: number
): boolean => {
  const needed = chips.filter((chip) => !chip.greyed)
  return pickedCount > 0 && needed.length > 0 && needed.every((c) => c.crossed)
}

export const readFirstEndToEnd = (): boolean =>
  readStored(FIRST_END_TO_END_KEY, parseDone, false)

export const markFirstEndToEnd = (): void => {
  writeStored(FIRST_END_TO_END_KEY, true)
  window.dispatchEvent(new Event(CHANGED))
}

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener(CHANGED, onChange)
  return () => window.removeEventListener(CHANGED, onChange)
}

/** True once the first end-to-end is done; every component using it updates together. */
export const useFirstEndToEnd = (): boolean =>
  useSyncExternalStore(subscribe, readFirstEndToEnd, readFirstEndToEnd)

/** Remembers the first end-to-end as soon as it happens (only while the tiers flag is on). */
export const useMarkFirstEndToEnd = (
  enabled: boolean,
  chips: readonly ChipProgress[],
  pickedCount: number
): void => {
  const done = isEndToEnd(chips, pickedCount)
  useEffect(() => {
    if (enabled && done && !readFirstEndToEnd()) markFirstEndToEnd()
  }, [enabled, done])
}

export const showUpsell = ({
  flag,
  firstEndToEnd
}: {
  flag: boolean
  firstEndToEnd: boolean
}): boolean => flag && firstEndToEnd
