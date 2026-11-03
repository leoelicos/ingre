/*
 * Guest profiles (#209): the people at the table and the allergens each one has. Manager-level
 * and visual: the list and recipes flag what a guest cannot have (outline plus words); they never
 * change an amount or swap an ingredient on their own.
 */
import { translate } from '../../i18n'
import type { LibraryIngredient } from '../../types/library'
import { FSANZ_ALLERGENS } from '../library/fsanz'

export interface Guest {
  readonly id: string
  readonly name: string
  /** FSANZ allergen names as the catalogue writes them, in the catalogue's order */
  readonly allergens: readonly string[]
}

export const GUESTS_KEY = 'ingre.guests'

const inCatalogueOrder = (allergens: readonly string[]): string[] =>
  FSANZ_ALLERGENS.filter((allergen) => allergens.includes(allergen))

/** A new guest with no allergens yet; blank names are ignored. */
export const addGuest = (
  guests: readonly Guest[],
  name: string,
  id: string
): readonly Guest[] =>
  name.trim() === ''
    ? guests
    : [...guests, { id, name: name.trim(), allergens: [] }]

export const removeGuest = (
  guests: readonly Guest[],
  id: string
): readonly Guest[] => guests.filter((guest) => guest.id !== id)

/** Sets one guest's allergens (as ticked), kept in the catalogue's order. */
export const setAllergens = (
  guests: readonly Guest[],
  id: string,
  allergens: readonly string[]
): readonly Guest[] =>
  guests.map((guest) =>
    guest.id === id
      ? { ...guest, allergens: inCatalogueOrder(allergens) }
      : guest
  )

export interface Conflict {
  readonly guest: string
  readonly allergens: readonly string[]
}

/** The guests an ingredient (by its allergen tags) is not safe for, with the allergens that clash. */
export const conflictsOf = (
  tags: readonly string[],
  guests: readonly Guest[]
): Conflict[] => {
  const present = tags.map((tag) => tag.toLowerCase())
  return guests.flatMap((guest) => {
    const clash = guest.allergens.filter((allergen) =>
      present.includes(allergen)
    )
    return clash.length === 0 ? [] : [{ guest: guest.name, allergens: clash }]
  })
}

/** "Sam can't have: milk; Kai can't have: wheat", or nothing when there is no clash. */
export const conflictText = (conflicts: readonly Conflict[]): string =>
  conflicts
    .map(({ guest, allergens }) =>
      translate('guests.cant', { name: guest, allergens: allergens.join(', ') })
    )
    .join('; ')

/** Every allergen tag across the lines' ingredients; free text has none. */
export const linesAllergens = (
  lines: readonly {
    readonly item: Pick<LibraryIngredient, 'allergens'> | null
  }[]
): readonly string[] =>
  lines.flatMap(({ item }) => (item === null ? [] : item.allergens))

/** The ids of the lines whose ingredient clashes with any guest. */
export const flaggedIngredientIds = (
  lines: readonly {
    readonly ingredientId: string
    readonly item: Pick<LibraryIngredient, 'allergens'> | null
  }[],
  guests: readonly Guest[]
): ReadonlySet<string> =>
  new Set(
    lines
      .filter(
        ({ item }) =>
          item !== null && conflictsOf(item.allergens, guests).length > 0
      )
      .map(({ ingredientId }) => ingredientId)
  )

/** "Guests", or "Guests (2)" with two guests. */
export const guestsCaption = (guests: readonly Guest[]): string =>
  guests.length === 0
    ? translate('guests.button')
    : translate('guests.buttonCount', { count: guests.length })

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseGuest = (value: unknown): Guest | null =>
  isRecord(value) &&
  typeof value['id'] === 'string' &&
  typeof value['name'] === 'string' &&
  Array.isArray(value['allergens'])
    ? {
        id: value['id'],
        name: value['name'],
        allergens: inCatalogueOrder(
          value['allergens'].filter(
            (allergen): allergen is string => typeof allergen === 'string'
          )
        )
      }
    : null

/** Stored guests; null when the stored value is not a list of guests. */
export const parseGuests = (value: unknown): Guest[] | null => {
  if (!Array.isArray(value)) return null
  const guests = value.map(parseGuest)
  return guests.every((guest) => guest !== null) ? guests : null
}
