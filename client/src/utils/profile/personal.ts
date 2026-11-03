/* The profile Explore ranks and filters by (#224): behaviour, then explicit settings, then locks. */
import { useState } from 'react'
import type { LibraryRecipe } from '../../types/library'
import type { Chip } from '../chips/chips'
import { library } from '../library/recipeLibrary'
import type { Locks } from './locks'
import { NO_LOCKS } from './locks'
import type { ProfileSettings } from './settings'
import { useProfileSettings } from './settings'
import type { Signal, Taste } from './taste'
import {
  NO_TASTE,
  SIGNAL_WEIGHTS,
  idSignals,
  observedWeights,
  recipeSignals
} from './taste'

export interface Personal {
  readonly taste: Taste
  readonly locks: Locks
}

export const NO_PERSONAL: Personal = { taste: NO_TASTE, locks: NO_LOCKS }

/** What the user has selected, bought and kept: picked recipes, extras, crossed-off chips, hearts. */
export interface Behaviour {
  readonly picked: readonly LibraryRecipe[]
  readonly extraIds: readonly string[]
  readonly crossedIds: readonly string[]
  readonly kept: readonly LibraryRecipe[]
}

export const signalsOf = (behaviour: Behaviour): Signal[] => [
  ...recipeSignals(behaviour.picked, SIGNAL_WEIGHTS.picked),
  ...idSignals(behaviour.extraIds, SIGNAL_WEIGHTS.extra),
  ...idSignals(behaviour.crossedIds, SIGNAL_WEIGHTS.bought),
  ...recipeSignals(behaviour.kept, SIGNAL_WEIGHTS.kept)
]

/** Observed weights from behaviour, with the explicit settings laid over them. */
export const personalOf = (
  behaviour: Behaviour,
  settings: ProfileSettings
): Personal => ({
  taste: {
    weights: observedWeights(signalsOf(behaviour)),
    likes: new Set(settings.likes),
    dislikes: new Set(settings.dislikes)
  },
  locks: { allergens: settings.allergens, diet: settings.diet }
})

/** The part of the list the profile reads: picked recipes and chips. */
export interface ListView {
  readonly entries: readonly { readonly recipe: LibraryRecipe }[]
  readonly chips: readonly Pick<Chip, 'id' | 'extra' | 'crossed'>[]
}

/** The library recipes with a heart. */
export const keptRecipes = (savedIds: ReadonlySet<string>): LibraryRecipe[] =>
  library.filter((recipe) => savedIds.has(recipe.id))

/** The behaviour a list and the hearted ids add up to. */
export const behaviourOf = (
  list: ListView,
  savedIds: ReadonlySet<string>
): Behaviour => ({
  picked: list.entries.map((entry) => entry.recipe),
  extraIds: list.chips.filter((chip) => chip.extra !== null).map((c) => c.id),
  crossedIds: list.chips.filter((chip) => chip.crossed).map((c) => c.id),
  kept: keptRecipes(savedIds)
})

/**
 * The profile for this page load. What is on the list is read once, so ticking a row never
 * reshuffles the rows under the user's finger; it counts from the next load. Hearts arrive
 * from the server after load, so they count as they come.
 */
export const usePersonal = (
  list: ListView,
  savedIds: ReadonlySet<string>
): Personal => {
  const [settings] = useProfileSettings()
  const [atLoad] = useState(() => behaviourOf(list, new Set()))
  return personalOf({ ...atLoad, kept: keptRecipes(savedIds) }, settings)
}
