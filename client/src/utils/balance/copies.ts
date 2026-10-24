/*
 * Recipe copies (#182): one per picked recipe, with its own portions and the amounts that
 * differ from the library original. Amounts are stored per serve so edits scale with portions.
 */
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import type { CustomisationsInput, RecipeInput } from '../../types/payloads'
import { PLACEHOLDER_PICTURE } from '../library/recipeLibrary'
import { amountText, displayName, rounded } from '../shopping/shoppingList'
import { itemUnit, unitMeasure } from '../shopping/units'

export const DEFAULT_PORTIONS = 2
export const MIN_PORTIONS = 1
export const MAX_PORTIONS = 12

export interface RecipeCopy {
  readonly recipeId: string
  /** whole number from 1 to 12 */
  readonly portions: number
  /** per-serve amounts in recipe units that differ from the original; 0 is removed */
  readonly amounts: Readonly<Record<string, number>>
}

export const newCopy = (
  recipeId: string,
  portions: number = DEFAULT_PORTIONS
): RecipeCopy => ({ recipeId, portions, amounts: {} })

/** A whole number of portions from 1 to 12; anything unreadable is the default. */
export const clampPortions = (portions: number): number =>
  Number.isFinite(portions)
    ? Math.min(MAX_PORTIONS, Math.max(MIN_PORTIONS, Math.round(portions)))
    : DEFAULT_PORTIONS

/** One ingredient of a copy at its portions, in recipe units. */
export interface CopyLine {
  readonly ingredientId: string
  readonly name: string
  readonly item: LibraryIngredient | null
  /** 0 when removed */
  readonly quantity: number
  readonly measure: string
  /** the original amount at these portions, or null when the user added it */
  readonly original: number | null
}

const itemFor = (
  items: readonly LibraryIngredient[],
  id: string
): LibraryIngredient | null => items.find((item) => item.id === id) ?? null

const lineOf = (
  ingredientId: string,
  items: readonly LibraryIngredient[],
  amounts: { quantity: number; measure: string; original: number | null }
): CopyLine => {
  const item = itemFor(items, ingredientId)
  return {
    ingredientId,
    name: item?.name ?? ingredientId,
    item,
    ...amounts
  }
}

/** The measure an added ingredient is written in: its base unit ("g", "ml", "whole"). */
export const addedMeasure = (item: LibraryIngredient | null): string =>
  unitMeasure(itemUnit(item))

/** Every ingredient of the copy: the original ones (removed at 0), then the added ones. */
export const copyLines = (
  recipe: LibraryRecipe,
  copy: RecipeCopy,
  items: readonly LibraryIngredient[]
): CopyLine[] => {
  const originalIds = recipe.ingredients.map((ri) => ri.ingredientId)
  const originals = recipe.ingredients.map((ri) => {
    const perServe = ri.quantity / recipe.portions
    const amount = copy.amounts[ri.ingredientId] ?? perServe
    return lineOf(ri.ingredientId, items, {
      quantity: amount * copy.portions,
      measure: ri.measure,
      original: perServe * copy.portions
    })
  })
  const added = Object.entries(copy.amounts)
    .filter(([id]) => !originalIds.includes(id))
    .map(([id, amount]) =>
      lineOf(id, items, {
        quantity: amount * copy.portions,
        measure: addedMeasure(itemFor(items, id)),
        original: null
      })
    )
  return [...originals, ...added]
}

/** The ingredients the copy still uses (not removed). */
export const usedLines = (lines: readonly CopyLine[]): CopyLine[] =>
  lines.filter((line) => line.quantity > 0)

const sameAmount = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9

const withoutKey = (
  amounts: Readonly<Record<string, number>>,
  key: string
): Record<string, number> =>
  Object.fromEntries(Object.entries(amounts).filter(([id]) => id !== key))

/**
 * The copy with one ingredient set to `quantity` at its portions. The original amount clears
 * the edit, and 0 on an added ingredient takes it off again.
 */
export const withAmount = (
  copy: RecipeCopy,
  recipe: LibraryRecipe,
  ingredientId: string,
  quantity: number
): RecipeCopy => {
  const perServe = Math.max(0, quantity) / copy.portions
  const original = recipe.ingredients.find(
    (ri) => ri.ingredientId === ingredientId
  )
  const unchanged =
    original === undefined
      ? perServe === 0
      : sameAmount(perServe, original.quantity / recipe.portions)
  return {
    ...copy,
    amounts: unchanged
      ? withoutKey(copy.amounts, ingredientId)
      : { ...copy.amounts, [ingredientId]: perServe }
  }
}

export const withPortions = (
  copy: RecipeCopy,
  portions: number
): RecipeCopy => ({
  ...copy,
  portions: clampPortions(portions)
})

/** Refresh (#182): back to the original at the default portions. */
export const resetCopy = (copy: RecipeCopy): RecipeCopy =>
  newCopy(copy.recipeId)

/** True when this ingredient differs from the original in the copy. */
export const isCustomisedIn = (
  copy: RecipeCopy,
  ingredientId: string
): boolean => copy.amounts[ingredientId] !== undefined

const twoDecimals = (n: number): number => rounded(n)

/** The copy's differences from the original, as saveRecipe takes them (#182). */
export const customisationsOf = (
  lines: readonly CopyLine[],
  copy: RecipeCopy
): CustomisationsInput => {
  const edited = lines.filter((line) => isCustomisedIn(copy, line.ingredientId))
  const result: CustomisationsInput = {
    added: edited.flatMap((line) =>
      line.original === null
        ? [{ ingredientId: line.ingredientId, to: twoDecimals(line.quantity) }]
        : []
    ),
    removed: edited.flatMap((line) =>
      line.original !== null && line.quantity === 0
        ? [
            {
              ingredientId: line.ingredientId,
              from: twoDecimals(line.original)
            }
          ]
        : []
    ),
    changed: edited.flatMap((line) =>
      line.original !== null && line.quantity > 0
        ? [
            {
              ingredientId: line.ingredientId,
              from: twoDecimals(line.original),
              to: twoDecimals(line.quantity)
            }
          ]
        : []
    )
  }
  return copy.portions === DEFAULT_PORTIONS
    ? result
    : {
        ...result,
        portions: { from: DEFAULT_PORTIONS, to: copy.portions }
      }
}

const bulletOf = (line: CopyLine): string => {
  const name = displayName(line)
  if (line.original === null)
    return `Added ${line.name} ${amountText(line.quantity, line.measure)}`
  if (line.quantity === 0) return `${name} removed`
  return `${name} ${amountText(line.original, line.measure)} → ${amountText(
    line.quantity,
    line.measure
  )}`
}

const RANK = (line: CopyLine): number =>
  line.original === null ? 0 : line.quantity === 0 ? 1 : 2

/**
 * The bullets under Customisations (#182), in recipe units: "Added red chilli 1",
 * "Butter removed", "Butter 25 g → 37.5 g", "Portions 2 → 4".
 */
export const customisationBullets = (
  lines: readonly CopyLine[],
  copy: RecipeCopy
): string[] => [
  ...lines
    .filter((line) => isCustomisedIn(copy, line.ingredientId))
    .sort((a, b) => RANK(a) - RANK(b))
    .map(bulletOf),
  ...(copy.portions === DEFAULT_PORTIONS
    ? []
    : [`Portions ${DEFAULT_PORTIONS} → ${copy.portions}`])
]

/** The saveRecipe input for a copy (#182): its ingredients with catalogue ids, and its differences. */
export const saveInput = (
  recipe: LibraryRecipe,
  copy: RecipeCopy,
  items: readonly LibraryIngredient[]
): RecipeInput => {
  const lines = copyLines(recipe, copy, items)
  return {
    name: recipe.name,
    portions: copy.portions,
    picture_url: recipe.picture_url ?? PLACEHOLDER_PICTURE,
    libraryId: recipe.id,
    ingredients: usedLines(lines).map((line) => ({
      name: line.name,
      quantity: twoDecimals(line.quantity),
      measure: line.measure,
      category: line.item?.category ?? 'other',
      ingredientId: line.ingredientId
    })),
    customisations: customisationsOf(lines, copy)
  }
}
