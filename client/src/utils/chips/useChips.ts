import { useEffect } from 'react'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import type { RecipeCopy } from '../balance/copies'
import {
  copyLines,
  newCopy,
  resetCopy,
  withAmount,
  withPortions
} from '../balance/copies'
import { catalogue, library } from '../library/recipeLibrary'
import type { Extra } from '../storage/shoppingState'
import {
  useChipEdits,
  useChipLayout,
  useCopies,
  useCrossedIds,
  useExtras
} from '../storage/shoppingState'
import type { ShopSection } from '../shopping/sections'
import type { Chip, ChipState, CopyEntry } from './chips'
import {
  buildBalances,
  buildChips,
  extraChipId,
  groupChips,
  placementsOf,
  recipeSources,
  sortLayout,
  sourceLabel,
  withPlacements
} from './chips'

/** The picked copies with their recipes, labels and lines; unknown recipes are skipped. */
export const copyEntries = (
  copies: readonly RecipeCopy[],
  recipes: readonly LibraryRecipe[] = library,
  items: readonly LibraryIngredient[] = catalogue
): CopyEntry[] => {
  const known = copies.flatMap((copy) => {
    const recipe = recipes.find((r) => r.id === copy.recipeId)
    return recipe === undefined ? [] : [{ copy, recipe }]
  })
  const names = known.map(({ recipe }) => recipe.name)
  return known.map(({ copy, recipe }, i) => ({
    copy,
    recipe,
    label: sourceLabel(names.slice(0, i), recipe.name),
    lines: copyLines(recipe, copy, items)
  }))
}

/** A catalogue item as a new extra. */
export const catalogueExtra = (
  item: LibraryIngredient,
  quantity = 1
): Extra => ({
  id: item.id,
  name: item.name,
  ingredientId: item.id,
  quantity
})

/** The extras with this one added, unless the item is already there. */
export const addOnce = (extras: readonly Extra[], extra: Extra): Extra[] =>
  extras.some((e) => extraChipId(e) === extraChipId(extra))
    ? [...extras]
    : [...extras, extra]

const updateCopy = (
  copies: readonly RecipeCopy[],
  recipeId: string,
  change: (copy: RecipeCopy) => RecipeCopy
): RecipeCopy[] =>
  copies.map((copy) => (copy.recipeId === recipeId ? change(copy) : copy))

/** A copy taken off the list by a swipe, and where it was, so Undo can put it back (#192). */
export interface RemovedCopy {
  readonly copy: RecipeCopy
  readonly index: number
}

/** The copy of this recipe and its place, or null when it is not on the list. */
export const removedCopy = (
  copies: readonly RecipeCopy[],
  recipeId: string
): RemovedCopy | null => {
  const index = copies.findIndex((copy) => copy.recipeId === recipeId)
  const copy = copies[index]
  return copy === undefined ? null : { copy, index }
}

/** The copies with this one back at its old place; unchanged when it is there already. */
export const withCopyAt = (
  copies: readonly RecipeCopy[],
  removed: RemovedCopy
): RecipeCopy[] =>
  copies.some((copy) => copy.recipeId === removed.copy.recipeId)
    ? [...copies]
    : [
        ...copies.slice(0, removed.index),
        removed.copy,
        ...copies.slice(removed.index)
      ]

const recipeById = (id: string): LibraryRecipe | null =>
  library.find((recipe) => recipe.id === id) ?? null

/** True while a recipe still needs the chip, so taking it out of Extra keeps it. */
const neededByRecipes = (chip: Chip | undefined): boolean =>
  chip !== undefined && recipeSources(chip).some((source) => !source.removed)

/** All state for the single page (#179, #182): copies, chips, extras and order, kept on device. */
export const useChips = () => {
  const [copies, updateCopies] = useCopies()
  const [extras, updateExtras] = useExtras()
  const [crossedIds, toggleCrossed, uncross] = useCrossedIds()
  const [edits, updateEdits] = useChipEdits()
  const [storedLayout, updateLayout] = useChipLayout()
  const entries = copyEntries(copies)
  const balances = buildBalances(entries, extras, catalogue)
  const placements = placementsOf(balances, edits)
  const layout = withPlacements(storedLayout, placements)
  /* new chips are placed once and remembered, so later category edits never move them */
  const unplaced = layout.order.length - storedLayout.order.length
  useEffect(() => {
    if (unplaced === 0) return
    updateLayout((previous) => withPlacements(previous, placements))
  })
  const chipState: ChipState = { edits, layout, crossedIds }
  const chips = buildChips(balances, chipState)
  const extraChips = chips.filter((chip) => chip.extra !== null)
  const pickedIds = new Set(copies.map((copy) => copy.recipeId))
  const setAmount = (recipeId: string, id: string, quantity: number) => {
    const recipe = recipeById(recipeId)
    if (recipe === null) return
    updateCopies((previous) =>
      updateCopy(previous, recipeId, (copy) =>
        withAmount(copy, recipe, id, quantity)
      )
    )
  }
  return {
    entries,
    chipState,
    pickedIds,
    togglePicked: (recipe: LibraryRecipe): void => {
      if (pickedIds.has(recipe.id)) {
        updateCopies((previous) =>
          previous.filter((copy) => copy.recipeId !== recipe.id)
        )
        return
      }
      updateCopies((previous) => [...previous, newCopy(recipe.id)])
    },
    /** Takes a recipe off the list, edits and all, and says what Undo needs (#192). */
    removePicked: (recipeId: string): RemovedCopy | null => {
      const removed = removedCopy(copies, recipeId)
      updateCopies((previous) =>
        previous.filter((copy) => copy.recipeId !== recipeId)
      )
      return removed
    },
    /** Puts a removed copy back where it was (#192: Undo). */
    restore: (removed: RemovedCopy): void =>
      updateCopies((previous) => withCopyAt(previous, removed)),
    setAmount,
    setPortions: (recipeId: string, portions: number): void =>
      updateCopies((previous) =>
        updateCopy(previous, recipeId, (copy) => withPortions(copy, portions))
      ),
    refresh: (): void => updateCopies((previous) => previous.map(resetCopy)),
    chips,
    groups: groupChips(chips),
    extraChips,
    extraGroups: groupChips(extraChips),
    hasChip: (id: string): boolean => chips.some((chip) => chip.id === id),
    toggleCrossed,
    setCategory: (id: string, section: ShopSection): void => {
      updateLayout((previous) => withPlacements(previous, placements))
      updateEdits((previous) => ({ ...previous, [id]: { section } }))
    },
    sort: (): void =>
      updateLayout((previous) => sortLayout(previous, placements)),
    addExtra: (item: LibraryIngredient): void => {
      if (extraChips.some((chip) => chip.id === item.id)) return
      uncross(item.id)
      updateExtras((previous) => addOnce(previous, catalogueExtra(item)))
    },
    setExtra: (id: string, quantity: number): void =>
      updateExtras((previous) =>
        previous.map((extra) =>
          extraChipId(extra) === id ? { ...extra, quantity } : extra
        )
      ),
    removeExtra: (id: string): void => {
      if (!neededByRecipes(chips.find((chip) => chip.id === id))) uncross(id)
      updateExtras((previous) =>
        previous.filter((extra) => extraChipId(extra) !== id)
      )
    }
  }
}

export type ChipsState = ReturnType<typeof useChips>
