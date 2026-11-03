/*
 * The ingredient-first loop (#204): from the ingredients someone has selected, suggest the
 * recipes that use them, with what is still missing and roughly what that costs.
 */
import priceData from '../../data/prices.json'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import { catalogue, library } from '../library/recipeLibrary'

/** The page shows the few best (#206: proactive suggestions are 1–3). */
export const MAX_SUGGESTIONS = 3

/** One recipe that suits the selection. */
export interface Suggestion {
  readonly recipe: LibraryRecipe
  /** the selected ingredients the recipe uses */
  readonly have: readonly LibraryIngredient[]
  /** the rest of its ingredients, apart from pantry staples */
  readonly missing: readonly LibraryIngredient[]
  /** indicative cost in dollars of the missing ingredients (one pack of each) */
  readonly cost: number
}

/** Indicative dollars per ingredient id. */
export type Prices = ReadonlyMap<string, number>

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const priceOf = (value: unknown, id: string): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : failPrices(`${id} needs a price above zero`)

const failPrices = (message: string): never => {
  throw new Error(`prices: ${message}`)
}

/** Validates the bundled price file, so a typo fails loudly and types need no casts. */
export const parsePrices = (data: unknown): Prices => {
  if (!isRecord(data)) return failPrices('expected an object')
  const table = data['prices']
  if (!isRecord(table)) return failPrices('expected a "prices" object')
  return new Map(Object.entries(table).map(([id, v]) => [id, priceOf(v, id)]))
}

export const PRICES: Prices = parsePrices(priceData)

const byId = (items: readonly LibraryIngredient[]) =>
  new Map(items.map((item) => [item.id, item]))

/** Recipe ingredients that are in the catalogue, in recipe order. */
const used = (
  recipe: LibraryRecipe,
  known: ReadonlyMap<string, LibraryIngredient>
): LibraryIngredient[] =>
  recipe.ingredients.flatMap(({ ingredientId }) => {
    const item = known.get(ingredientId)
    return item === undefined ? [] : [item]
  })

const costOf = (
  missing: readonly LibraryIngredient[],
  prices: Prices
): number =>
  Math.round(
    missing.reduce((sum, item) => sum + (prices.get(item.id) ?? 0) * 100, 0)
  ) / 100

const suggestionFor = (
  recipe: LibraryRecipe,
  selected: ReadonlySet<string>,
  known: ReadonlyMap<string, LibraryIngredient>,
  prices: Prices
): Suggestion => {
  const items = used(recipe, known)
  const have = items.filter((item) => selected.has(item.id))
  const missing = items.filter(
    (item) => !selected.has(item.id) && item.staple !== true
  )
  return { recipe, have, missing, cost: costOf(missing, prices) }
}

/** Most selected ingredients used first, then fewest missing, then by name. */
const better = (a: Suggestion, b: Suggestion): number =>
  b.have.length - a.have.length ||
  a.missing.length - b.missing.length ||
  a.recipe.name.localeCompare(b.recipe.name)

/** Every recipe that uses at least one selected ingredient, best first. */
export const suggest = (
  selected: ReadonlySet<string>,
  recipes: readonly LibraryRecipe[],
  items: readonly LibraryIngredient[],
  prices: Prices
): Suggestion[] => {
  const known = byId(items)
  return recipes
    .map((recipe) => suggestionFor(recipe, selected, known, prices))
    .filter((suggestion) => suggestion.have.length > 0)
    .sort(better)
}

/** The suggestions the page shows. */
export const suggestionsFor = (
  selected: ReadonlySet<string>,
  recipes: readonly LibraryRecipe[],
  items: readonly LibraryIngredient[],
  prices: Prices
): Suggestion[] =>
  suggest(selected, recipes, items, prices).slice(0, MAX_SUGGESTIONS)

/** The suggestions from the bundled library, catalogue and prices. */
export const bundledSuggestions = (
  selected: ReadonlySet<string>
): Suggestion[] => suggestionsFor(selected, library, catalogue, PRICES)
