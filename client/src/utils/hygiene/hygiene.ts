/*
 * Food-safety notes (#213). Core hygiene is mandatory in every tier: these notes are never
 * switched off by the guidance dial, a flag or a setting, and cannot be dismissed. Tier extras
 * (gloves, labelling, HACCP packs) belong to the tiers work (#208), not here.
 */
import type { Chip } from '../chips/chips'

/** The four core notes, in the order they are shown. */
export const HYGIENE_KINDS = [
  'separate',
  'handwash',
  'storage',
  'capacity'
] as const
export type HygieneKind = (typeof HYGIENE_KINDS)[number]

/** Raw and needs care: raw meat, poultry and eggs (catalogue ids). */
export const RAW_IDS: readonly string[] = [
  'beef-mince',
  'beef-rump',
  'pork-mince',
  'pork-belly',
  'pork-loin-chop',
  'sausages',
  'bacon',
  'chicken-thigh',
  'chicken-breast',
  'egg'
]

/** Raw poultry: the hand-wash note. */
export const POULTRY_IDS: readonly string[] = [
  'chicken-thigh',
  'chicken-breast'
]

/** From this many chilled items a shop is "large" and the fridge needs checking. */
export const FRIDGE_LARGE = 12

/** What the notes need to know about one item. */
export interface HygieneSubject {
  readonly id: string
  readonly chilled: boolean
}

/** A chip as a subject: chilled when its catalogue item lives in the fridge. */
export const subjectOf = (chip: Pick<Chip, 'id' | 'item'>): HygieneSubject => ({
  id: chip.id,
  chilled: chip.item?.pantry === 'Fridge'
})

const anyIn = (
  subjects: readonly HygieneSubject[],
  ids: readonly string[]
): boolean => subjects.some((subject) => ids.includes(subject.id))

const chilledCount = (subjects: readonly HygieneSubject[]): number =>
  subjects.filter((subject) => subject.chilled).length

const APPLIES: Readonly<
  Record<HygieneKind, (subjects: readonly HygieneSubject[]) => boolean>
> = {
  separate: (subjects) => anyIn(subjects, RAW_IDS),
  handwash: (subjects) => anyIn(subjects, POULTRY_IDS),
  storage: (subjects) => chilledCount(subjects) > 0,
  capacity: (subjects) => chilledCount(subjects) >= FRIDGE_LARGE
}

/** The notes that apply to these items, in display order. */
export const hygieneNotes = (
  subjects: readonly HygieneSubject[]
): readonly HygieneKind[] =>
  HYGIENE_KINDS.filter((kind) => APPLIES[kind](subjects))
