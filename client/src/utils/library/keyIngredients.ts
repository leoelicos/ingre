import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import {
  EMPTY_CODE,
  resolveBadgeCode
} from '../../components/IngredientBadge/badgeCode'
import { capitaliseFirst } from '../capitaliseFirst'
import type { ShopSection } from '../shopping/sections'
import { placeInShop } from '../shopping/sections'
import { catalogue, library } from './recipeLibrary'

/** One defining ingredient, ready to draw: badge code and colour source, name and section. */
export interface KeyIngredient {
  readonly id: string
  /** Shown name, cased like the shopping lists ("Beef mince", "Lebanese cucumber"). */
  readonly name: string
  /** Badge code: the catalogue's (override or derived), or "?" for an item it doesn't know. */
  readonly code: string
  /** Catalogue aisle for the badge colour; UNKNOWN_CATEGORY (neutral) when not in the catalogue. */
  readonly category: string
  /** Shop section, shown as text so colour is never the only cue. */
  readonly section: ShopSection
}

/** Category for anything the catalogue doesn't know; its badge is neutral. */
export const UNKNOWN_CATEGORY = 'other'
/** Section label for anything the catalogue doesn't know. */
export const UNKNOWN_SECTION: ShopSection = 'Other'

/** A catalogue item as a key ingredient. */
export const knownIngredient = (item: LibraryIngredient): KeyIngredient => ({
  id: item.id,
  name: capitaliseFirst(item.name),
  code: resolveBadgeCode(item),
  category: item.category,
  section: placeInShop(item.category).section
})

/** "red-lentils" -> "red lentils": a readable name for an id the catalogue doesn't know. */
export const nameFromId = (id: string): string => id.replace(/-/g, ' ')

/** Not in the catalogue: a plain "?" badge in the neutral colour, never a generated code. */
export const unknownIngredient = (id: string): KeyIngredient => ({
  id,
  name: capitaliseFirst(nameFromId(id)),
  code: EMPTY_CODE,
  category: UNKNOWN_CATEGORY,
  section: UNKNOWN_SECTION
})

/** The key ingredient for an id, from the catalogue when it's there. */
export const keyIngredient = (
  id: string,
  items: readonly LibraryIngredient[] = catalogue
): KeyIngredient => {
  const item = items.find((i) => i.id === id)
  return item === undefined ? unknownIngredient(id) : knownIngredient(item)
}

/** A recipe's defining ingredients in their listed order; empty when it names none. */
export const keyIngredientsOf = (
  recipe: LibraryRecipe,
  items: readonly LibraryIngredient[] = catalogue
): KeyIngredient[] =>
  (recipe.keyIngredients ?? []).map((id) => keyIngredient(id, items))

/** Key ingredients for a card's library id; empty for recipes outside the library. */
export const keyIngredientsFor = (
  libraryId: string | undefined,
  recipes: readonly LibraryRecipe[] = library,
  items: readonly LibraryIngredient[] = catalogue
): KeyIngredient[] =>
  recipes
    .filter((r) => r.id === libraryId)
    .flatMap((r) => keyIngredientsOf(r, items))
