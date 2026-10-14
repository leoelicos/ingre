import type { HomeLocation } from '../../types/library'
import { HOME_LOCATIONS } from '../library/parseLibrary'
import { useStored, useStoredSet } from './useStored'

export const HAVE_KEY = 'ingre.list.have'
export const BASKET_KEY = 'ingre.list.basket'
export const LOCATIONS_KEY = 'ingre.list.locations'
export const STEP_KEY = 'ingre.list.step'
export const PICKED_KEY = 'ingre.list.picked'
export const EXTRAS_KEY = 'ingre.list.extras'

/** The three steps of the shopping flow, in order. */
export type FlowStep = 'pick' | 'home' | 'shop'
export const FLOW_STEPS: readonly FlowStep[] = ['pick', 'home', 'shop']

/** Something added by hand: a catalogue item or free text, with a quantity. */
export interface Extra {
  id: string
  name: string
  /** catalogue id, or null for free text */
  ingredientId: string | null
  quantity: number
}

/** Ingredients ticked "at home" (default: staples). */
export const useHaveIds = (staples: ReadonlySet<string>) =>
  useStoredSet(HAVE_KEY, staples)

/** Ingredients ticked into the basket at the shop. */
export const useBasketIds = () => useStoredSet(BASKET_KEY, new Set())

/** Recipes picked for this shop (library ids). */
export const usePickedIds = () => useStoredSet(PICKED_KEY, new Set())

export const parseStep = (value: unknown): FlowStep | null =>
  FLOW_STEPS.find((v) => v === value) ?? null

/** Last-used step; the flow reopens there. */
export const useFlowStep = (): [FlowStep, (step: FlowStep) => void] => {
  const [step, update] = useStored(STEP_KEY, parseStep, 'pick')
  return [step, (next) => update(() => next)]
}

const parseExtra = (value: unknown): Extra[] => {
  if (typeof value !== 'object' || value === null) return []
  const record: Record<string, unknown> = { ...value }
  const { id, name, ingredientId, quantity } = record
  return typeof id === 'string' &&
    typeof name === 'string' &&
    (typeof ingredientId === 'string' || ingredientId === null) &&
    typeof quantity === 'number' &&
    Number.isInteger(quantity) &&
    quantity > 0
    ? [{ id, name, ingredientId, quantity }]
    : []
}

/** Stored extras; malformed entries are dropped. */
export const parseExtras = (value: unknown): Extra[] | null =>
  Array.isArray(value) ? value.flatMap(parseExtra) : null

export const useExtras = () => useStored<Extra[]>(EXTRAS_KEY, parseExtras, [])

export const parseLocations = (
  value: unknown
): Record<string, HomeLocation> | null => {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return null
  return Object.entries(value).reduce<Record<string, HomeLocation>>(
    (acc, [id, loc]) => {
      const location = HOME_LOCATIONS.find((l) => l === loc)
      return location === undefined ? acc : { ...acc, [id]: location }
    },
    {}
  )
}

/** Per-ingredient home-location overrides (ingredientId -> location). */
export const useLocationOverrides = (): [
  Readonly<Record<string, HomeLocation>>,
  (ingredientId: string, location: HomeLocation) => void
] => {
  const [overrides, update] = useStored(LOCATIONS_KEY, parseLocations, {})
  return [
    overrides,
    (id, location) => update((previous) => ({ ...previous, [id]: location }))
  ]
}
