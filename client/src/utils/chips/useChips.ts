import { useEffect } from 'react'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import { catalogue, library } from '../library/recipeLibrary'
import { usePeople } from '../storage/people'
import type { ChipEdit, Extra } from '../storage/shoppingState'
import {
  useChipEdits,
  useChipLayout,
  useCrossedIds,
  useExtras,
  usePickedIds
} from '../storage/shoppingState'
import type { ShopSection } from '../shopping/sections'
import type { ShopLine } from '../shopping/shoppingList'
import {
  buildShoppingList,
  extraLines,
  withoutDuplicateExtras
} from '../shopping/shoppingList'
import type { Chip } from './chips'
import {
  buildChips,
  editFor,
  groupChips,
  placementsOf,
  sortLayout,
  withPlacements
} from './chips'

/**
 * The chips' lines: picked recipes' ingredients (staples are assumed at home) plus extras a
 * recipe doesn't already need, so each item is one chip.
 */
export const chipLines = (
  recipes: readonly LibraryRecipe[],
  people: number,
  extras: readonly Extra[],
  items: readonly LibraryIngredient[] = catalogue
): ShopLine[] => {
  const recipeLines = buildShoppingList(recipes, people, items).filter(
    (line) => !line.staple
  )
  return [
    ...recipeLines,
    ...withoutDuplicateExtras(recipeLines, extraLines(extras, items))
  ]
}

/** A catalogue item as a new extra. */
export const catalogueExtra = (item: LibraryIngredient): Extra => ({
  id: item.id,
  name: item.name,
  ingredientId: item.id,
  quantity: 1
})

/** The extras with this one added, unless it is already there. */
export const addOnce = (extras: readonly Extra[], extra: Extra): Extra[] =>
  extras.some((e) => e.id === extra.id) ? [...extras] : [...extras, extra]

/** The edits with one chip's edit changed. */
export const withEdit = (
  edits: Readonly<Record<string, ChipEdit>>,
  id: string,
  change: Partial<ChipEdit>
): Record<string, ChipEdit> => ({
  ...edits,
  [id]: { ...editFor(edits, id), ...change }
})

/** The edits without one chip's. */
export const withoutEdit = (
  edits: Readonly<Record<string, ChipEdit>>,
  id: string
): Record<string, ChipEdit> =>
  Object.fromEntries(Object.entries(edits).filter(([key]) => key !== id))

/** All state for the single page (#179): picks, chips, edits, extras and order, kept on device. */
export const useChips = () => {
  const [people, setPeople] = usePeople()
  const [pickedIds, togglePicked] = usePickedIds()
  const [extras, updateExtras] = useExtras()
  const [crossedIds, toggleCrossed, uncross] = useCrossedIds()
  const [edits, updateEdits] = useChipEdits()
  const [storedLayout, updateLayout] = useChipLayout()
  const recipes = library.filter((recipe) => pickedIds.has(recipe.id))
  const lines = chipLines(recipes, people, extras)
  const placements = placementsOf(lines, edits)
  const layout = withPlacements(storedLayout, placements)
  /* new chips are placed once and remembered, so later category edits never move them */
  const unplaced = layout.order.length - storedLayout.order.length
  useEffect(() => {
    if (unplaced === 0) return
    updateLayout((previous) => withPlacements(previous, placements))
  })
  const chips: Chip[] = buildChips({ lines, edits, layout, crossedIds })
  const chipIds = new Set(chips.map((chip) => chip.id))
  return {
    people,
    setPeople,
    recipes,
    pickedIds,
    togglePicked,
    chips,
    groups: groupChips(chips),
    hasChip: (id: string): boolean => chipIds.has(id),
    toggleCrossed,
    setQuantity: (id: string, quantity: number): void =>
      updateEdits((previous) => withEdit(previous, id, { quantity })),
    setCategory: (id: string, section: ShopSection): void => {
      updateLayout((previous) => withPlacements(previous, placements))
      updateEdits((previous) => withEdit(previous, id, { section }))
    },
    sort: (): void =>
      updateLayout((previous) => sortLayout(previous, placements)),
    addExtra: (item: LibraryIngredient): void => {
      uncross(item.id)
      updateEdits((previous) => withoutEdit(previous, item.id))
      updateExtras((previous) => addOnce(previous, catalogueExtra(item)))
    },
    removeExtra: (id: string): void => {
      uncross(id)
      updateEdits((previous) => withoutEdit(previous, id))
      updateExtras((previous) => previous.filter((extra) => extra.id !== id))
    }
  }
}

export type ChipsState = ReturnType<typeof useChips>
