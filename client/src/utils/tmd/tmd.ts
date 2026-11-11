import type { Guidance } from '../guidance/guidance'
import { DEFAULT_GUIDANCE, parseGuidance } from '../guidance/guidance'
import { useStored } from '../storage/useStored'

/*
 * The three TMD questions (#211): how much help, any diet, anything avoided. Skippable, and
 * changeable later at /setup. Skipping keeps the defaults (Assisted, no diet, nothing avoided).
 */
export const TMD_KEY = 'ingre.tmd'

export const TMD_STEPS = ['guidance', 'diet', 'avoid'] as const
export type TmdStep = (typeof TMD_STEPS)[number]

export const DIETS = ['none', 'pescatarian', 'vegetarian', 'vegan'] as const
export type Diet = (typeof DIETS)[number]

/** FSANZ allergen families a person can say they avoid (gluten and tree nuts as families). */
export const AVOID_OPTIONS: readonly string[] = [
  'crustacean',
  'egg',
  'fish',
  'gluten',
  'lupin',
  'milk',
  'mollusc',
  'peanut',
  'sesame',
  'soy',
  'tree nut',
  'wheat'
]

export interface TmdAnswers {
  readonly guidance: Guidance
  readonly diet: Diet
  readonly avoid: readonly string[]
}

export const DEFAULT_TMD: TmdAnswers = {
  guidance: DEFAULT_GUIDANCE,
  diet: 'none',
  avoid: []
}

export const parseDiet = (value: unknown): Diet | null =>
  DIETS.find((diet) => diet === value) ?? null

/** The option a radio group reported, or the current one if it is none of them. */
export const pick = <T extends string>(
  options: readonly T[],
  next: string,
  current: T
): T => options.find((option) => option === next) ?? current

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/** The avoided families in a stored value; only known ones, once each. */
const parseAvoid = (value: unknown): readonly string[] =>
  Array.isArray(value)
    ? AVOID_OPTIONS.filter((option) => value.includes(option))
    : []

/** Stored answers; anything missing or unknown falls back to its default. */
export const parseTmd = (value: unknown): TmdAnswers | null =>
  isRecord(value)
    ? {
        guidance: parseGuidance(value['guidance']) ?? DEFAULT_TMD.guidance,
        diet: parseDiet(value['diet']) ?? DEFAULT_TMD.diet,
        avoid: parseAvoid(value['avoid'])
      }
    : null

/** The avoided families with this one added, or removed when it is there. */
export const toggleAvoid = (
  avoid: readonly string[],
  option: string
): readonly string[] =>
  avoid.includes(option)
    ? avoid.filter((item) => item !== option)
    : AVOID_OPTIONS.filter((item) => item === option || avoid.includes(item))

/** The saved answers, and a way to save new ones. */
export const useTmd = (): {
  readonly answers: TmdAnswers
  readonly save: (answers: TmdAnswers) => void
} => {
  const [answers, update] = useStored<TmdAnswers>(
    TMD_KEY,
    parseTmd,
    DEFAULT_TMD
  )
  return { answers, save: (next) => update(() => next) }
}
