/*
 * Filters (#182): within a group any ticked value matches, and every group with something
 * ticked must match. Kept in React state only, so they reset on reload.
 */
import type { Chip } from '../chips/chips'
import type { ShopSection } from '../shopping/sections'

/** A chip status a filter can ask for. */
export type ChipStatus = 'crossed' | 'customised' | 'extra' | 'removed'

export const STATUS_LABELS: Readonly<Record<ChipStatus, string>> = {
  crossed: 'Crossed off',
  customised: 'Customised',
  extra: 'Extra',
  removed: 'Removed'
}

/** Ingredients offers every status; Extra only crossed off (#182). */
export const INGREDIENT_STATUSES: readonly ChipStatus[] = [
  'crossed',
  'customised',
  'extra',
  'removed'
]
export const EXTRA_STATUSES: readonly ChipStatus[] = ['crossed']

export interface ChipFilter {
  readonly sections: ReadonlySet<ShopSection>
  readonly statuses: ReadonlySet<ChipStatus>
}

export const NO_CHIP_FILTER: ChipFilter = {
  sections: new Set(),
  statuses: new Set()
}

const STATUS_TESTS: Readonly<
  Record<
    ChipStatus,
    (chip: Pick<Chip, 'crossed' | 'customised' | 'extra' | 'greyed'>) => boolean
  >
> = {
  crossed: (chip) => chip.crossed,
  customised: (chip) => chip.customised,
  extra: (chip) => chip.extra !== null,
  removed: (chip) => chip.greyed
}

/** Any of the ticked values in a group, or anything when none is ticked. */
const anyOf = <T>(ticked: ReadonlySet<T>, test: (value: T) => boolean) =>
  ticked.size === 0 || [...ticked].some(test)

export const chipMatches = (
  chip: Pick<Chip, 'section' | 'crossed' | 'customised' | 'extra' | 'greyed'>,
  filter: ChipFilter
): boolean =>
  anyOf(filter.sections, (section) => chip.section === section) &&
  anyOf(filter.statuses, (status) => STATUS_TESTS[status](chip))

export interface RecipeFilter {
  /** every one of these ingredients */
  readonly contains: readonly string[]
  /** none of these ingredients */
  readonly excludes: readonly string[]
  /** Explore only: hearted recipes */
  readonly savedOnly: boolean
}

export const NO_RECIPE_FILTER: RecipeFilter = {
  contains: [],
  excludes: [],
  savedOnly: false
}

/** A recipe by its ingredient ids (customised in Recipes, original in Explore). */
export const recipeMatches = (
  ingredientIds: ReadonlySet<string>,
  filter: Pick<RecipeFilter, 'contains' | 'excludes'>
): boolean =>
  filter.contains.every((id) => ingredientIds.has(id)) &&
  !filter.excludes.some((id) => ingredientIds.has(id))

/** True when the filter asks for anything. */
export const chipFilterOn = (filter: ChipFilter): boolean =>
  filter.sections.size + filter.statuses.size > 0

export const recipeFilterOn = (filter: RecipeFilter): boolean =>
  filter.contains.length + filter.excludes.length > 0 || filter.savedOnly

/** "3 hidden by filter" */
export const hiddenText = (n: number): string => `${n} hidden by filter`

/** A set with one value added, or removed when it is already there. */
export const toggledIn = <T>(set: ReadonlySet<T>, value: T): ReadonlySet<T> =>
  new Set(
    set.has(value) ? [...set].filter((v) => v !== value) : [...set, value]
  )
