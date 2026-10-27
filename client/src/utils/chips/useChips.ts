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

/** The copies without this recipe (#192). */
export const withoutRecipe = (
  copies: readonly RecipeCopy[],
  recipeId: string
): RecipeCopy[] => copies.filter((copy) => copy.recipeId !== recipeId)

/** Puts a removed copy back, unless that recipe is already picked. */
export const restoring = (
  copies: readonly RecipeCopy[],
  copy: RecipeCopy
): RecipeCopy[] =>
  copies.some((existing) => existing.recipeId === copy.recipeId)
    ? [...copies]
    : [...copies, copy]

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
        updateCopies((previous) => withoutRecipe(previous, recipe.id))
        return
      }
      updateCopies((previous) => [...previous, newCopy(recipe.id)])
    },
    /** Removes a picked recipe and returns its copy, for Undo (#192). */
    dismissPicked: (recipeId: string): RecipeCopy | null => {
      const found = copies.find((copy) => copy.recipeId === recipeId) ?? null
      if (found === null) return null
      updateCopies((previous) => withoutRecipe(previous, recipeId))
      return found
    },
    restoreCopy: (copy: RecipeCopy): void => {
      updateCopies((previous) => restoring(previous, copy))
    },
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
