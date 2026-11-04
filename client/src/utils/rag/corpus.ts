/* The retrieval corpus (#225): a hand-curated profile per catalogue ingredient, in
   data/profiles.json. Free local search only; nothing here calls a model or embedding service. */
import data from '../../data/profiles.json'
import type { LibraryIngredient } from '../../types/library'
import { catalogue } from '../library/recipeLibrary'

export interface RawProfile {
  id: string
  classes: readonly string[]
  style: readonly string[]
  goesWith: readonly string[]
}

export interface Profile {
  id: string
  name: string
  /** Allergens from the catalogue, the hard locks' input. */
  allergens: readonly string[]
  classes: readonly string[]
  style: readonly string[]
  /** Classic partners, both ways: a pairing listed once is known on both profiles. */
  goesWith: readonly string[]
}

/** Everyone who pairs with this id, from its own list and from the lists that name it. */
const partnersOf = (id: string, raw: readonly RawProfile[]): string[] =>
  Array.from(
    new Set(
      raw.flatMap((profile) =>
        profile.id === id
          ? profile.goesWith
          : profile.goesWith.includes(id)
            ? [profile.id]
            : []
      )
    )
  ).sort()

/** One profile per catalogue ingredient; a catalogue ingredient with no curated profile is an error. */
export const buildProfiles = (
  raw: readonly RawProfile[],
  items: readonly LibraryIngredient[]
): Profile[] =>
  items.map((item) => {
    const own = raw.find((profile) => profile.id === item.id)
    if (own === undefined) throw new Error(`No profile for ${item.id}`)
    return {
      id: item.id,
      name: item.name,
      allergens: item.allergens.map((a) => a.toLowerCase()),
      classes: own.classes,
      style: own.style,
      goesWith: partnersOf(item.id, raw)
    }
  })

export const PROFILES: readonly Profile[] = buildProfiles(
  data.profiles,
  catalogue
)

/** Every allergen the catalogue knows, alphabetical: the choices for what to avoid. */
export const ALLERGENS: readonly string[] = Array.from(
  new Set(PROFILES.flatMap((profile) => profile.allergens))
).sort()
