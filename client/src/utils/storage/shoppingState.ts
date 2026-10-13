import type { HomeLocation } from '../../types/library'
import { HOME_LOCATIONS } from '../library/parseLibrary'
import { useStored, useStoredSet } from './useStored'

export const HAVE_KEY = 'ingre.list.have'
export const BASKET_KEY = 'ingre.list.basket'
export const LOCATIONS_KEY = 'ingre.list.locations'
export const VIEW_KEY = 'ingre.list.view'

export type ListView = 'home' | 'shop'
export const LIST_VIEWS: readonly ListView[] = ['home', 'shop']

/** Ingredients ticked "at home" (default: staples). */
export const useHaveIds = (staples: ReadonlySet<string>) =>
  useStoredSet(HAVE_KEY, staples)

/** Ingredients ticked into the basket at the shop. */
export const useBasketIds = () => useStoredSet(BASKET_KEY, new Set())

export const parseView = (value: unknown): ListView | null =>
  LIST_VIEWS.find((v) => v === value) ?? null

export const useListView = (): [ListView, (view: ListView) => void] => {
  const [view, update] = useStored(VIEW_KEY, parseView, 'home')
  return [view, (next) => update(() => next)]
}

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
