/* Explicit profile settings (#224), kept on the device: they override what behaviour suggests. */
import type { IngredientClass } from './classes'
import { CLASSES } from './classes'
import type { Diet, Locks } from './locks'
import { DIETS } from './locks'
import { useStored } from '../storage/useStored'

export const SETTINGS_KEY = 'ingre.profile.settings'

export interface ProfileSettings extends Locks {
  readonly likes: readonly IngredientClass[]
  readonly dislikes: readonly IngredientClass[]
}

export const NO_SETTINGS: ProfileSettings = {
  likes: [],
  dislikes: [],
  allergens: [],
  diet: 'none'
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? { ...value }
    : null

const classesIn = (value: unknown): IngredientClass[] =>
  Array.isArray(value) ? CLASSES.filter((c) => value.includes(c)) : []

const namesIn = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string' && v !== '')
    : []

const dietIn = (value: unknown): Diet =>
  DIETS.find((diet) => diet === value) ?? 'none'

/** Stored settings; anything unreadable is dropped, so a bad entry never weakens a lock. */
export const parseSettings = (value: unknown): ProfileSettings | null => {
  const record = asRecord(value)
  return record === null
    ? null
    : {
        likes: classesIn(record['likes']),
        dislikes: classesIn(record['dislikes']),
        allergens: namesIn(record['allergens']),
        diet: dietIn(record['diet'])
      }
}

export const useProfileSettings = () =>
  useStored<ProfileSettings>(SETTINGS_KEY, parseSettings, NO_SETTINGS)
