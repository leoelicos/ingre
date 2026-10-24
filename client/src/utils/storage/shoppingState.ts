import { useState } from 'react'
import type { RecipeCopy } from '../balance/copies'
import { DEFAULT_PORTIONS, clampPortions, newCopy } from '../balance/copies'
import type { ShopSection } from '../shopping/sections'
import { SHOP_SECTIONS } from '../shopping/sections'
import { PEOPLE_KEY, parsePeople } from './people'
import { readStored } from './storage'
import { parseStringSet, useStored, useStoredSet } from './useStored'

/** Recipes picked before #182; read once to migrate them into copies. */
export const PICKED_KEY = 'ingre.list.picked'
/** One copy per picked recipe, with its portions and customisations (#182). */
export const COPIES_KEY = 'ingre.list.copies'
export const EXTRAS_KEY = 'ingre.list.extras'
/** Chips crossed off on the single page (#179). */
export const CROSSED_KEY = 'ingre.chips.crossed'
/** Category edits per chip (#179); quantity overrides were dropped in #182. */
export const EDITS_KEY = 'ingre.chips.edits'
/** Chip order and the group each chip sits in until the next sort (#179). */
export const LAYOUT_KEY = 'ingre.chips.layout'

/** Something added by hand: a catalogue item or free text, with a quantity. */
export interface Extra {
  id: string
  name: string
  /** catalogue id, or null for free text */
  ingredientId: string | null
  quantity: number
}

/** A chip's category edit; null keeps the catalogue's. */
export interface ChipEdit {
  section: ShopSection | null
}

/**
 * Where chips sit (#179): `order` is first-seen order, `placed` the group each chip was put in.
 * Chips only move between groups when the user sorts.
 */
export interface ChipLayout {
  order: readonly string[]
  placed: Readonly<Record<string, ShopSection>>
}

export const EMPTY_LAYOUT: ChipLayout = { order: [], placed: {} }

/** Chips crossed off. */
export const useCrossedIds = () => useStoredSet(CROSSED_KEY, new Set())

const isPositiveWhole = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? { ...value }
    : null

const parseExtra = (value: unknown): Extra[] => {
  const record = asRecord(value)
  if (record === null) return []
  const { id, name, ingredientId, quantity } = record
  return typeof id === 'string' &&
    typeof name === 'string' &&
    (typeof ingredientId === 'string' || ingredientId === null) &&
    isPositiveWhole(quantity)
    ? [{ id, name, ingredientId, quantity }]
    : []
}

/** Stored extras; malformed entries are dropped. */
export const parseExtras = (value: unknown): Extra[] | null =>
  Array.isArray(value) ? value.flatMap(parseExtra) : null

export const useExtras = () => useStored<Extra[]>(EXTRAS_KEY, parseExtras, [])

/** A known shop section, or null. */
export const parseSection = (value: unknown): ShopSection | null =>
  SHOP_SECTIONS.find((section) => section === value) ?? null

const parseEdit = (value: unknown): ChipEdit | null => {
  const section = parseSection(asRecord(value)?.['section'])
  return section === null ? null : { section }
}

const entriesOf = (value: unknown): [string, unknown][] =>
  Object.entries(asRecord(value) ?? {})

/** Stored chip edits; malformed entries are dropped. */
export const parseEdits = (value: unknown): Record<string, ChipEdit> | null =>
  asRecord(value) === null
    ? null
    : Object.fromEntries(
        entriesOf(value).flatMap(([id, edit]) => {
          const parsed = parseEdit(edit)
          return parsed === null ? [] : [[id, parsed]]
        })
      )

export const useChipEdits = () =>
  useStored<Readonly<Record<string, ChipEdit>>>(EDITS_KEY, parseEdits, {})

const parsePlaced = (value: unknown): Record<string, ShopSection> =>
  Object.fromEntries(
    entriesOf(value).flatMap(([id, section]) => {
      const parsed = parseSection(section)
      return parsed === null ? [] : [[id, parsed]]
    })
  )

/** Stored chip layout; unknown sections and non-string ids are dropped. */
export const parseLayout = (value: unknown): ChipLayout | null => {
  const record = asRecord(value)
  if (record === null || !Array.isArray(record['order'])) return null
  const order = record['order'].filter(
    (id): id is string => typeof id === 'string'
  )
  return { order, placed: parsePlaced(record['placed']) }
}

export const useChipLayout = () =>
  useStored<ChipLayout>(LAYOUT_KEY, parseLayout, EMPTY_LAYOUT)

const isAmount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

const parseAmounts = (value: unknown): Record<string, number> =>
  Object.fromEntries(
    entriesOf(value).filter((entry): entry is [string, number] =>
      isAmount(entry[1])
    )
  )

const parseCopy = (value: unknown): RecipeCopy[] => {
  const record = asRecord(value)
  if (record === null) return []
  const { recipeId, portions } = record
  return typeof recipeId === 'string' && typeof portions === 'number'
    ? [
        {
          recipeId,
          portions: clampPortions(portions),
          amounts: parseAmounts(record['amounts'])
        }
      ]
    : []
}

/** Stored copies, one per recipe (#182); malformed entries and repeats are dropped. */
export const parseCopies = (value: unknown): RecipeCopy[] | null =>
  Array.isArray(value)
    ? value
        .flatMap(parseCopy)
        .filter(
          (copy, i, all) =>
            all.findIndex((c) => c.recipeId === copy.recipeId) === i
        )
    : null

/** Picks from before #182 as copies, with the old people setting as their portions. */
export const legacyCopies = (): RecipeCopy[] => {
  const picked = readStored(PICKED_KEY, parseStringSet, new Set<string>())
  const people = readStored(PEOPLE_KEY, parsePeople, null)
  return [...picked].map((id) => newCopy(id, people ?? DEFAULT_PORTIONS))
}

/** The picked recipes' copies, migrated from the old picks the first time. */
export const useCopies = () => {
  const [migrated] = useState(legacyCopies)
  return useStored<readonly RecipeCopy[]>(COPIES_KEY, parseCopies, migrated)
}
