import type { LibraryIngredient, LibraryRecipe } from '../../types/library'

/**
 * Seasonality (#218): which ingredients are in season in a month, for one region (Sydney in v1).
 * It is a hint only: recipes stay fully findable and are never hidden or reordered by it.
 */
export class SeasonDataError extends Error {
  override name = 'SeasonDataError'
}

export interface SeasonCalendar {
  readonly region: string
  readonly timeZone: string
  /** ingredient id → months in season (1 = January) */
  readonly ingredients: Readonly<Record<string, readonly number[]>>
}

export interface SeasonalRecipe {
  readonly recipe: LibraryRecipe
  /** the recipe's ingredients that are in season, in recipe order */
  readonly inSeason: readonly LibraryIngredient[]
}

type Rec = Record<string, unknown>

const isRecord = (value: unknown): value is Rec =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const fail = (path: string, what: string): never => {
  throw new SeasonDataError(`${path}: expected ${what}`)
}

const text = (value: unknown, path: string): string =>
  typeof value === 'string' && value.length > 0
    ? value
    : fail(path, 'a non-empty string')

const month = (value: unknown, path: string): number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 1 &&
  value <= 12
    ? value
    : fail(path, 'a month from 1 to 12')

const months = (value: unknown, path: string): number[] =>
  Array.isArray(value) && value.length > 0
    ? value.map((entry, i) => month(entry, `${path}[${i}]`))
    : fail(path, 'a non-empty list of months')

const ingredientMonths = (value: unknown): Record<string, number[]> =>
  isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).map(([id, list]) => [
          id,
          months(list, `ingredients.${id}`)
        ])
      )
    : fail('ingredients', 'an object of ingredient id to months')

export const parseSeasons = (raw: unknown): SeasonCalendar => {
  if (!isRecord(raw)) return fail('seasons', 'an object')
  return {
    region: text(raw['region'], 'region'),
    timeZone: text(raw['timeZone'], 'timeZone'),
    ingredients: ingredientMonths(raw['ingredients'])
  }
}

export const inSeason = (
  calendar: SeasonCalendar,
  ingredientId: string,
  monthNumber: number
): boolean => calendar.ingredients[ingredientId]?.includes(monthNumber) ?? false

/** The catalogue items in season this month, in catalogue order. */
export const seasonalIngredients = (
  calendar: SeasonCalendar,
  monthNumber: number,
  items: readonly LibraryIngredient[]
): LibraryIngredient[] =>
  items.filter((item) => inSeason(calendar, item.id, monthNumber))

/** The ingredients of a recipe that are in season this month. */
export const seasonsIn = (
  recipe: LibraryRecipe,
  calendar: SeasonCalendar,
  monthNumber: number,
  items: readonly LibraryIngredient[]
): LibraryIngredient[] => {
  const used = new Set(recipe.ingredients.map((line) => line.ingredientId))
  return seasonalIngredients(calendar, monthNumber, items).filter((item) =>
    used.has(item.id)
  )
}

/** Recipes with something in season, most seasonal first (library order breaks ties). */
export const seasonalRecipes = (
  recipes: readonly LibraryRecipe[],
  calendar: SeasonCalendar,
  monthNumber: number,
  items: readonly LibraryIngredient[]
): SeasonalRecipe[] =>
  recipes
    .map((recipe, index) => ({
      recipe,
      index,
      inSeason: seasonsIn(recipe, calendar, monthNumber, items)
    }))
    .filter((entry) => entry.inSeason.length > 0)
    .sort((a, b) => b.inSeason.length - a.inSeason.length || a.index - b.index)
    .map(({ recipe, inSeason: seasonal }) => ({ recipe, inSeason: seasonal }))

/** The month (1-12) it is in a time zone: Sydney's month, whatever the device's clock says. */
export const monthIn = (date: Date, timeZone: string): number =>
  Number(
    new Intl.DateTimeFormat('en-AU', { month: 'numeric', timeZone }).format(
      date
    )
  )
