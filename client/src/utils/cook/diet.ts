/*
 * Strict dietary separation (#221): given the allergens someone must avoid, which picked
 * recipes are safe, which are not and why, and the order and care that keeps them apart.
 */
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import type { CopyEntry } from '../chips/chips'
import { catalogue } from '../library/recipeLibrary'

/** Allergens, lowercased and alphabetical, across the picked recipes' ingredients (removed lines left out). */
export const allergensOnList = (
  picked: readonly CopyEntry[],
  items: readonly LibraryIngredient[] = catalogue
): string[] => {
  const ids = new Set(
    picked.flatMap(({ lines }) =>
      lines.filter((line) => line.quantity > 0).map((line) => line.ingredientId)
    )
  )
  const found = items
    .filter((item) => ids.has(item.id))
    .flatMap((item) => item.allergens.map((a) => a.toLowerCase()))
  return [...new Set(found)].sort()
}

/** A recipe and the avoided allergens it contains. */
export interface Hit {
  readonly recipe: LibraryRecipe
  readonly allergens: readonly string[]
}

/** The picked recipes split by whether they contain anything to avoid. */
export interface Separation {
  readonly safe: readonly LibraryRecipe[]
  readonly unsafe: readonly Hit[]
}

const hitsOf = (
  entry: CopyEntry,
  avoid: ReadonlySet<string>,
  items: readonly LibraryIngredient[]
): string[] =>
  allergensOnList([entry], items).filter((allergen) => avoid.has(allergen))

export const separate = (
  picked: readonly CopyEntry[],
  avoid: ReadonlySet<string>,
  items: readonly LibraryIngredient[] = catalogue
): Separation => {
  const checked = picked.map((entry) => ({
    recipe: entry.recipe,
    allergens: hitsOf(entry, avoid, items)
  }))
  return {
    safe: checked
      .filter(({ allergens }) => allergens.length === 0)
      .map(({ recipe }) => recipe),
    unsafe: checked.filter(({ allergens }) => allergens.length > 0)
  }
}

/** Separation needs care only when some dishes are safe and some are not. */
export const needsCare = ({ safe, unsafe }: Separation): boolean =>
  safe.length > 0 && unsafe.length > 0
