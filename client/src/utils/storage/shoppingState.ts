import type { ShopSection } from '../shopping/sections'
import { SHOP_SECTIONS } from '../shopping/sections'
import { useStored, useStoredSet } from './useStored'

export const PICKED_KEY = 'ingre.list.picked'
export const EXTRAS_KEY = 'ingre.list.extras'
/** Chips crossed off on the single page (#179). */
export const CROSSED_KEY = 'ingre.chips.crossed'
/** Quantity and category edits per chip (#179). */
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

/** A chip's edits; null keeps what the recipes and catalogue say. */
export interface ChipEdit {
  quantity: number | null
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

/** Recipes picked for this shop (library ids). */
export const usePickedIds = () => useStoredSet(PICKED_KEY, new Set())

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
  const record = asRecord(value)
  if (record === null) return null
  const quantity = isPositiveWhole(record['quantity'])
    ? record['quantity']
    : null
  const section = parseSection(record['section'])
  return quantity === null && section === null ? null : { quantity, section }
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
