/*
 * Risk handling (#220): what could go wrong with this list, and what to do about it. Five
 * risks: the shop is out of an ingredient, the shop is unreachable, the budget is overrun,
 * the fridge is too full, the oven fails. Pure rules over the picked recipes; a few
 * judgement calls live in data/risks.json (substitutes) and are checked there.
 */
import riskData from '../../data/risks.json'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import type { CopyLine } from '../balance/copies'
import { catalogue, library } from '../library/recipeLibrary'
import { convert, toBase } from '../shopping/units'
import type { Prices } from '../suggest/suggest'
import { PRICES } from '../suggest/suggest'

/** Substitute advice per ingredient id; null when nothing else will do. */
export type Substitutes = ReadonlyMap<string, string | null>

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const failRisks = (message: string): never => {
  throw new Error(`risks: ${message}`)
}

const adviceOf = (value: unknown, id: string): string | null =>
  value === null
    ? null
    : typeof value === 'string' && value.trim() !== ''
    ? value
    : failRisks(`${id} needs advice text or null`)

/** Validates the bundled risks file, so a typo fails loudly and types need no casts. */
export const parseSubstitutes = (data: unknown): Substitutes => {
  if (!isRecord(data)) return failRisks('expected an object')
  const table = data['substitutes']
  if (!isRecord(table)) return failRisks('expected a "substitutes" object')
  return new Map(
    Object.entries(table).map(([id, value]) => [id, adviceOf(value, id)])
  )
}

export const SUBSTITUTES: Substitutes = parseSubstitutes(riskData)

/** A picked recipe with what it asks of the shop and the kitchen. */
export interface PickedRecipe {
  readonly recipe: LibraryRecipe
  readonly lines: readonly CopyLine[]
}

const byId = (items: readonly LibraryIngredient[]) =>
  new Map(items.map((item) => [item.id, item]))

/** The ingredients on the list, once each, in the order they first appear; recipes' removed lines are skipped. */
export const listItems = (
  picked: readonly PickedRecipe[],
  items: readonly LibraryIngredient[] = catalogue
): LibraryIngredient[] => {
  const known = byId(items)
  const ids = picked.flatMap(({ lines }) =>
    lines.filter((line) => line.quantity > 0).map((line) => line.ingredientId)
  )
  return [...new Set(ids)].flatMap((id) => {
    const item = known.get(id)
    return item === undefined ? [] : [item]
  })
}

/** What to buy: the list's ingredients apart from pantry staples. */
export const shopItems = (
  picked: readonly PickedRecipe[],
  items: readonly LibraryIngredient[] = catalogue
): LibraryIngredient[] =>
  listItems(picked, items).filter((item) => item.staple !== true)

/* 1. The shop is out of an ingredient */

/** An ingredient to buy that has advice for when it is out of stock. */
export interface SubstituteAdvice {
  readonly item: LibraryIngredient
  /** what to use instead; null when there is nothing good, so buy it first */
  readonly use: string | null
}

export const substitutesFor = (
  picked: readonly PickedRecipe[],
  table: Substitutes = SUBSTITUTES,
  items: readonly LibraryIngredient[] = catalogue
): SubstituteAdvice[] =>
  shopItems(picked, items).flatMap((item) => {
    const use = table.get(item.id)
    return use === undefined ? [] : [{ item, use }]
  })

/* 2. The shop is unreachable */

/** A recipe and how many of its shop ingredients are not in hand. */
export interface Coverage {
  readonly recipe: LibraryRecipe
  readonly missing: number
}

const missingFor = (
  recipe: LibraryRecipe,
  have: ReadonlySet<string>,
  known: ReadonlyMap<string, LibraryIngredient>
): number =>
  new Set(
    recipe.ingredients
      .map(({ ingredientId }) => ingredientId)
      .filter((id) => known.get(id)?.staple !== true && !have.has(id))
  ).size

/** What can still be cooked with `have` (ingredient ids crossed off): picked recipes, and the closest other one. */
export interface Access {
  /** picked recipes, fewest missing first */
  readonly picked: readonly Coverage[]
  /** a recipe not picked that needs the fewest more items; null when none is within reach */
  readonly alternative: Coverage | null
}

/** An alternative must be this close to cookable to be worth naming. */
export const ALTERNATIVE_MAX_MISSING = 3

const fewestMissing = (a: Coverage, b: Coverage): number =>
  a.missing - b.missing || a.recipe.name.localeCompare(b.recipe.name)

export const accessFor = (
  picked: readonly PickedRecipe[],
  have: ReadonlySet<string>,
  recipes: readonly LibraryRecipe[] = library,
  items: readonly LibraryIngredient[] = catalogue
): Access => {
  const known = byId(items)
  const coverage = (recipe: LibraryRecipe): Coverage => ({
    recipe,
    missing: missingFor(recipe, have, known)
  })
  const pickedIds = new Set(picked.map(({ recipe }) => recipe.id))
  const [alternative] = recipes
    .filter((recipe) => !pickedIds.has(recipe.id))
    .map(coverage)
    .filter(({ missing }) => missing <= ALTERNATIVE_MAX_MISSING)
    .sort(fewestMissing)
  return {
    picked: picked.map(({ recipe }) => coverage(recipe)).sort(fewestMissing),
    alternative: alternative ?? null
  }
}

/* 3. The budget is overrun */

/** Indicative dollars for one pack of each shop ingredient (no price counts as nothing). */
export const costOf = (
  picked: readonly PickedRecipe[],
  prices: Prices = PRICES,
  items: readonly LibraryIngredient[] = catalogue
): number =>
  Math.round(
    shopItems(picked, items).reduce(
      (sum, item) => sum + (prices.get(item.id) ?? 0) * 100,
      0
    )
  ) / 100

/** A picked recipe and what dropping it saves. */
export interface Drop {
  readonly recipe: LibraryRecipe
  readonly saving: number
}

/** The budget check: what the list costs against what was set, and the recipe whose removal helps most. */
export interface Budget {
  readonly cost: number
  readonly budget: number
  /** dollars over; 0 when within */
  readonly over: number
  /** when over budget, the picked recipe whose removal saves most; none otherwise */
  readonly drops: readonly Drop[]
}

const savingBy = (
  picked: readonly PickedRecipe[],
  without: PickedRecipe,
  prices: Prices,
  items: readonly LibraryIngredient[]
): number =>
  Math.round(
    (costOf(picked, prices, items) -
      costOf(
        picked.filter((p) => p !== without),
        prices,
        items
      )) *
      100
  ) / 100

export const budgetFor = (
  picked: readonly PickedRecipe[],
  budget: number,
  prices: Prices = PRICES,
  items: readonly LibraryIngredient[] = catalogue
): Budget => {
  const cost = costOf(picked, prices, items)
  const over = Math.max(0, Math.round((cost - budget) * 100) / 100)
  const [dearest] = picked
    .map(
      (p): Drop => ({
        recipe: p.recipe,
        saving: savingBy(picked, p, prices, items)
      })
    )
    .sort((a, b) => b.saving - a.saving)
  return {
    cost,
    budget,
    over,
    drops: over > 0 && dearest !== undefined ? [dearest] : []
  }
}

/* 4. The fridge is too full */

/** Litres of fridge space the list's chilled items take, at one gram to the millilitre. */
export const fridgeLitres = (
  picked: readonly PickedRecipe[],
  items: readonly LibraryIngredient[] = catalogue
): number => {
  const known = byId(items)
  const grams = picked
    .flatMap(({ lines }) => lines)
    .reduce((sum, line) => {
      const item = known.get(line.ingredientId)
      return item === undefined || item.pantry !== 'Fridge'
        ? sum
        : sum + gramsOf(line, item)
    }, 0)
  return Math.round(grams / 10) / 100
}

/** A line's weight in grams; 0 when its measure can't be weighed. */
export const gramsOf = (line: CopyLine, item: LibraryIngredient): number => {
  const base = toBase(line.quantity, line.measure, item)
  return base === null ? 0 : convert(base, 'g', item) ?? 0
}

/** The fridge check: the chilled load against the space set. */
export interface Fridge {
  readonly litres: number
  readonly capacity: number
  /** litres over; 0 when it fits */
  readonly over: number
}

export const fridgeFor = (
  picked: readonly PickedRecipe[],
  capacity: number,
  items: readonly LibraryIngredient[] = catalogue
): Fridge => {
  const litres = fridgeLitres(picked, items)
  return {
    litres,
    capacity,
    over: Math.max(0, Math.round((litres - capacity) * 100) / 100)
  }
}

/* 5. The oven fails */

const USES_OVEN = /\b(oven|bake|baked|baking|roast|roasted|roasting)\b/i

/** The picked recipes whose method needs the oven. */
export const ovenRecipes = (picked: readonly PickedRecipe[]): LibraryRecipe[] =>
  picked
    .map(({ recipe }) => recipe)
    .filter((recipe) => recipe.method.some((step) => USES_OVEN.test(step)))
