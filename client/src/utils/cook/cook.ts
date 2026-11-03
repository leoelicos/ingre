/*
 * Precise execution (#221): a cook plan from the picked recipes. Timed steps found in the
 * method, prep that can be done days ahead, where to find special cuts and ingredients,
 * exact weights, and dated container labels. Pure rules; the prep, sourcing and keeping
 * times live in data/cook.json and are checked there.
 */
import cookData from '../../data/cook.json'
import type {
  Amount,
  LibraryIngredient,
  LibraryRecipe
} from '../../types/library'
import type { CopyLine } from '../balance/copies'
import type { CopyEntry } from '../chips/chips'
import { catalogue } from '../library/recipeLibrary'
import { convert, toBase } from '../shopping/units'

/* The data file */

export interface PrepStep {
  /** whole days before the cooking day */
  readonly daysBefore: number
  readonly task: string
}

export interface CookTable {
  readonly prepAhead: ReadonlyMap<string, readonly PrepStep[]>
  readonly sourcing: ReadonlyMap<string, string>
  readonly keep: {
    readonly fallback: number
    readonly recipes: ReadonlyMap<string, number>
    readonly components: ReadonlyMap<string, number>
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const failCook = (message: string): never => {
  throw new Error(`cook: ${message}`)
}

const recordAt = (data: unknown, key: string): Record<string, unknown> => {
  const found = isRecord(data) ? data[key] : null
  return isRecord(found) ? found : failCook(`expected a "${key}" object`)
}

const textOf = (value: unknown, where: string): string =>
  typeof value === 'string' && value.trim() !== ''
    ? value
    : failCook(`${where} needs text`)

const daysOf = (value: unknown, where: string): number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : failCook(`${where} needs a whole number of days above zero`)

const prepStepOf = (value: unknown, id: string): PrepStep => {
  const step = isRecord(value) ? value : failCook(`${id} needs steps`)
  return {
    daysBefore: daysOf(step['daysBefore'], `${id} daysBefore`),
    task: textOf(step['task'], `${id} task`)
  }
}

const prepListOf = (value: unknown, id: string): PrepStep[] =>
  Array.isArray(value)
    ? value.map((step) => prepStepOf(step, id))
    : failCook(`${id} needs a list of steps`)

const daysTable = (table: Record<string, unknown>): Map<string, number> =>
  new Map(Object.entries(table).map(([id, value]) => [id, daysOf(value, id)]))

/** Validates the bundled file, so a typo fails loudly and types need no casts. */
export const parseCook = (data: unknown): CookTable => {
  const keep = recordAt(data, 'keepDays')
  return {
    prepAhead: new Map(
      Object.entries(recordAt(data, 'prepAhead')).map(([id, steps]) => [
        id,
        prepListOf(steps, id)
      ])
    ),
    sourcing: new Map(
      Object.entries(recordAt(data, 'sourcing')).map(([id, tip]) => [
        id,
        textOf(tip, id)
      ])
    ),
    keep: {
      fallback: daysOf(keep['default'], 'keepDays default'),
      recipes: daysTable(recordAt(keep, 'recipes')),
      components: daysTable(recordAt(keep, 'components'))
    }
  }
}

export const COOK: CookTable = parseCook(cookData)

/* Timed steps */

/** A time found in a method step: its words as written, and its longest length in seconds. */
export interface Timer {
  readonly text: string
  readonly seconds: number
}

const UNIT_SECONDS: Readonly<Record<string, number>> = {
  second: 1,
  minute: 60,
  hour: 3600
}

/** "30 minutes", "2 to 3 minutes", "2-second". (A "1½ hours" is not matched: no recipe writes one.) */
const TIME =
  /\d+(?:\.\d+)?(?:\s*(?:to|-|–)\s*\d+(?:\.\d+)?)?[\s-]+(?:second|minute|hour)s?\b/gi

/** The unit word in a matched time, as seconds. */
const unitSeconds = (text: string): number =>
  Object.entries(UNIT_SECONDS).reduce(
    (found, [unit, seconds]) =>
      text.toLowerCase().includes(unit) ? seconds : found,
    1
  )

/** The numbers in a matched time; a range is read at its longest. */
const longest = (text: string): number =>
  Math.max(...[...text.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0])))

const timerOf = (text: string): Timer => ({
  text,
  seconds: longest(text) * unitSeconds(text)
})

/** Every time a method step mentions, in order. */
export const timersIn = (step: string): Timer[] =>
  [...step.matchAll(TIME)].map((m) => timerOf(m[0]))

/** A method step with at least one time in it. */
export interface TimedStep {
  /** 1-based, as the method reads */
  readonly number: number
  readonly text: string
  readonly timers: readonly Timer[]
}

export const timedSteps = (recipe: LibraryRecipe): TimedStep[] =>
  recipe.method.flatMap((text, index) => {
    const timers = timersIn(text)
    return timers.length === 0 ? [] : [{ number: index + 1, text, timers }]
  })

/* Prep ahead */

/** A task to do before the cooking day. */
export interface PrepItem {
  readonly recipe: LibraryRecipe
  readonly daysBefore: number
  readonly task: string
}

/** Prep for the picked recipes, earliest first, then by recipe name. */
export const prepPlan = (
  picked: readonly CopyEntry[],
  table: CookTable = COOK
): PrepItem[] =>
  picked
    .flatMap(({ recipe }) =>
      (table.prepAhead.get(recipe.id) ?? []).map((step) => ({
        recipe,
        ...step
      }))
    )
    .sort(
      (a, b) =>
        b.daysBefore - a.daysBefore ||
        a.recipe.name.localeCompare(b.recipe.name)
    )

/* Dates: plain "YYYY-MM-DD" strings, so no time zone can move a day */

const ISO = /^\d{4}-\d{2}-\d{2}$/

/** A real calendar day as "YYYY-MM-DD", or null. */
export const parseDay = (value: unknown): string | null => {
  if (typeof value !== 'string' || !ISO.test(value)) return null
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
    ? null
    : value
}

/** The day `days` after (or, when negative, before) `day`. */
export const addDays = (day: string, days: number): string => {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/* Where to look */

export interface Sourcing {
  readonly item: LibraryIngredient
  readonly tip: string
}

/** Ingredients on the list with a note on where to find or what to ask for. */
export const sourcingFor = (
  picked: readonly CopyEntry[],
  table: CookTable = COOK,
  items: readonly LibraryIngredient[] = catalogue
): Sourcing[] => {
  const ids = new Set(
    picked.flatMap(({ lines }) =>
      lines.filter((line) => line.quantity > 0).map((line) => line.ingredientId)
    )
  )
  return items.flatMap((item) => {
    const tip = table.sourcing.get(item.id)
    return ids.has(item.id) && tip !== undefined ? [{ item, tip }] : []
  })
}

/* Exact weights */

/** One ingredient of a copy at its portions, weighed or measured as precisely as its unit allows. */
export interface Weigh {
  readonly line: CopyLine
  /** grams or millilitres, or null when the unit can't be weighed (a bunch of coriander) */
  readonly amount: Amount | null
  /** true when the recipe already gives it in g or ml, false when this is an estimate */
  readonly exact: boolean
}

const MASS_MEASURES: ReadonlySet<string> = new Set([
  'g',
  'g tin',
  'ml',
  'ml tin'
])

/** A line in grams or millilitres. Counts and spoons are estimated from the catalogue. */
export const weightOf = (line: CopyLine): Amount | null => {
  const base =
    line.item === null ? null : toBase(line.quantity, line.measure, line.item)
  if (base === null || line.item === null) return null
  if (base.unit !== 'count') return base
  const grams = convert(base, 'g', line.item)
  return grams === null ? null : { amount: grams, unit: 'g' }
}

export const weighOut = (entry: CopyEntry): Weigh[] =>
  entry.lines
    .filter((line) => line.quantity > 0)
    .map((line) => ({
      line,
      amount: weightOf(line),
      exact: MASS_MEASURES.has(line.measure)
    }))

/* Container labels */

/** What goes on a container: what it is, and how long it keeps once cooked. */
export interface Label {
  /** the recipe's name on the list ("Dahl", "Dahl (2)") */
  readonly name: string
  /** the ingredient that sets a shorter time (rice, spaghetti), or null for the dish */
  readonly component: LibraryIngredient | null
  readonly days: number
}

const keepDaysFor = (recipe: LibraryRecipe, table: CookTable): number =>
  table.keep.recipes.get(recipe.id) ?? table.keep.fallback

/** A component of the recipe that keeps for less time than the dish does. */
const shorterKeepers = (
  recipe: LibraryRecipe,
  days: number,
  table: CookTable,
  items: readonly LibraryIngredient[]
): { item: LibraryIngredient; days: number }[] =>
  recipe.ingredients.flatMap(({ ingredientId }) => {
    const keeps = table.keep.components.get(ingredientId)
    const item = items.find((i) => i.id === ingredientId)
    return keeps !== undefined && keeps < days && item !== undefined
      ? [{ item, days: keeps }]
      : []
  })

/** One label for the dish, and one for each ingredient that keeps for less time. */
export const labelsFor = (
  picked: readonly CopyEntry[],
  table: CookTable = COOK,
  items: readonly LibraryIngredient[] = catalogue
): Label[] =>
  picked.flatMap(({ recipe, label }) => {
    const days = keepDaysFor(recipe, table)
    return [
      { name: label, component: null, days },
      ...shorterKeepers(recipe, days, table, items).map((keeper) => ({
        name: label,
        component: keeper.item,
        days: keeper.days
      }))
    ]
  })
