/*
 * The chips (#179, #182): one per item, balancing every recipe copy that uses it and Extra.
 * Pure functions from the copies, extras, edits and layout.
 */
import type {
  Amount,
  BaseUnit,
  LibraryIngredient,
  LibraryRecipe
} from '../../types/library'
import type { CopyLine, RecipeCopy } from '../balance/copies'
import { isCustomisedIn } from '../balance/copies'
import type { ChipEdit, ChipLayout, Extra } from '../storage/shoppingState'
import type { ShopSection } from '../shopping/sections'
import { SHOP_SECTIONS, placeInShop } from '../shopping/sections'
import { FREE_TEXT_SECTION, groupBy } from '../shopping/shoppingList'
import { convert, itemUnit, toBase } from '../shopping/units'

/** A picked recipe's copy with what the chips need from it. */
export interface CopyEntry {
  readonly copy: RecipeCopy
  readonly recipe: LibraryRecipe
  /** the recipe's name, with "(2)" on a repeat */
  readonly label: string
  readonly lines: readonly CopyLine[]
}

/** One recipe's need for an item, in the recipe's own unit. */
export interface RecipeSource {
  readonly kind: 'recipe'
  readonly recipeId: string
  readonly label: string
  readonly quantity: number
  readonly measure: string
  readonly removed: boolean
  readonly customised: boolean
}

/** The item's Extra amount: a whole number in the chip's unit. */
export interface ExtraSource {
  readonly kind: 'extra'
  readonly quantity: number
}

export type Source = RecipeSource | ExtraSource

/** One chip: an item, its sources, its total, where it sits and whether it is crossed off. */
export interface Chip {
  /** catalogue id, or the free-text extra's id */
  readonly id: string
  readonly name: string
  readonly item: LibraryIngredient | null
  readonly unit: BaseUnit
  readonly sources: readonly Source[]
  readonly total: Amount
  /** the Extra amount, or null when the item is not in Extra */
  readonly extra: number | null
  /** the current category: the chip's colour */
  readonly section: ShopSection
  /** the group the chip sits in until the next sort */
  readonly group: ShopSection
  readonly crossed: boolean
  /** every recipe removed it and it is not in Extra (#182) */
  readonly greyed: boolean
  /** a recipe copy changed, added or removed it (#182) */
  readonly customised: boolean
}

/** Short category names (#179): "Dairy" reads better on a tab than the full section name. */
export const CATEGORY_LABELS: Readonly<Record<ShopSection, string>> = {
  'Fruit & Veg': 'Fruit & Veg',
  'Meat & Seafood': 'Meat & Seafood',
  'Dairy, Eggs & Fridge': 'Dairy',
  Deli: 'Deli',
  Bakery: 'Bakery',
  Pantry: 'Pantry',
  Frozen: 'Frozen',
  Other: 'Other'
}

export const categoryLabel = (section: ShopSection): string =>
  CATEGORY_LABELS[section]

/** A recipe's label, with "(2)", "(3)" when earlier recipes have the same name (#182). */
export const sourceLabel = (
  earlier: readonly string[],
  name: string
): string => {
  const seen = earlier.filter((n) => n === name).length
  return seen === 0 ? name : `${name} (${seen + 1})`
}

/** The id of the chip an extra belongs to: its catalogue id, or its own for free text. */
export const extraChipId = (extra: Pick<Extra, 'id' | 'ingredientId'>) =>
  extra.ingredientId ?? extra.id

/** One recipe source's amount in the chip's unit; the raw number when it can't convert. */
export const sourceAmount = (
  source: Pick<RecipeSource, 'quantity' | 'measure' | 'removed'>,
  item: LibraryIngredient | null,
  unit: BaseUnit
): number => {
  if (source.removed) return 0
  if (item === null) return source.quantity
  const base = toBase(source.quantity, source.measure, item)
  return base === null
    ? source.quantity
    : convert(base, unit, item) ?? source.quantity
}

/** The chip's total: every recipe need plus Extra, never rounded (#182). */
export const totalOf = (
  sources: readonly Source[],
  item: LibraryIngredient | null,
  unit: BaseUnit
): Amount => ({
  unit,
  amount: sources.reduce(
    (sum, source) =>
      sum +
      (source.kind === 'extra'
        ? source.quantity
        : sourceAmount(source, item, unit)),
    0
  )
})

const recipeSourcesFor = (
  id: string,
  entries: readonly CopyEntry[]
): RecipeSource[] =>
  entries.flatMap((entry) =>
    entry.lines
      .filter((line) => line.ingredientId === id)
      .map(
        (line): RecipeSource => ({
          kind: 'recipe',
          recipeId: entry.recipe.id,
          label: entry.label,
          quantity: line.quantity,
          measure: line.measure,
          removed: line.quantity === 0,
          customised: isCustomisedIn(entry.copy, id)
        })
      )
  )

/** An item on the list before edits and layout: what it is and where its amounts come from. */
export interface Balance {
  readonly id: string
  readonly name: string
  readonly item: LibraryIngredient | null
  readonly sources: readonly Source[]
  readonly extra: number | null
}

const extraSource = (quantity: number): ExtraSource => ({
  kind: 'extra',
  quantity
})

const itemFor = (
  items: readonly LibraryIngredient[],
  id: string
): LibraryIngredient | null => items.find((item) => item.id === id) ?? null

/**
 * Every item on the list (#182): recipe ingredients, staples included, in first-seen order, then
 * extras no recipe uses. Each lists its recipe sources and its Extra.
 */
export const buildBalances = (
  entries: readonly CopyEntry[],
  extras: readonly Extra[],
  items: readonly LibraryIngredient[]
): Balance[] => {
  const recipeIds = entries.flatMap((entry) =>
    entry.lines.map((line) => line.ingredientId)
  )
  const ids = [...new Set([...recipeIds, ...extras.map(extraChipId)])]
  return ids.map((id) => {
    const extra = extras.find((e) => extraChipId(e) === id) ?? null
    const item = itemFor(items, id)
    const recipeSources = recipeSourcesFor(id, entries)
    return {
      id,
      name: item?.name ?? extra?.name ?? id,
      item,
      extra: extra?.quantity ?? null,
      sources: [
        ...recipeSources,
        ...(extra === null ? [] : [extraSource(extra.quantity)])
      ]
    }
  })
}

const NO_EDIT: ChipEdit = { section: null }

export const editFor = (
  edits: Readonly<Record<string, ChipEdit>>,
  id: string
): ChipEdit => edits[id] ?? NO_EDIT

/** The item's own category, or Other for free text. */
export const startSection = (item: LibraryIngredient | null): ShopSection =>
  item === null ? FREE_TEXT_SECTION : placeInShop(item.category).section

/** A chip's id and current category, for placing it. */
export interface Placement {
  readonly id: string
  readonly section: ShopSection
}

/** New chips join the end of their category's group; chips already placed stay put. */
export const withPlacements = (
  layout: ChipLayout,
  placements: readonly Placement[]
): ChipLayout => {
  const fresh = placements.filter((p) => !layout.order.includes(p.id))
  return fresh.length === 0
    ? layout
    : {
        order: [...layout.order, ...fresh.map((p) => p.id)],
        placed: {
          ...layout.placed,
          ...Object.fromEntries(fresh.map((p) => [p.id, p.section]))
        }
      }
}

/** Sort: every chip moves into the group of its current category; order within groups is kept. */
export const sortLayout = (
  layout: ChipLayout,
  placements: readonly Placement[]
): ChipLayout => {
  const placed = withPlacements(layout, placements)
  return {
    order: placed.order,
    placed: {
      ...placed.placed,
      ...Object.fromEntries(placements.map((p) => [p.id, p.section]))
    }
  }
}

/** Where the chips for these items go, by their edited category. */
export const placementsOf = (
  balances: readonly Balance[],
  edits: Readonly<Record<string, ChipEdit>>
): Placement[] =>
  balances.map((balance) => ({
    id: balance.id,
    section: editFor(edits, balance.id).section ?? startSection(balance.item)
  }))

/** What the chips are built from. */
export interface ChipState {
  readonly edits: Readonly<Record<string, ChipEdit>>
  readonly layout: ChipLayout
  readonly crossedIds: ReadonlySet<string>
}

const isRecipe = (source: Source): source is RecipeSource =>
  source.kind === 'recipe'

/** The recipe sources of a chip. */
export const recipeSources = (
  chip: Pick<Chip, 'sources'>
): readonly RecipeSource[] => chip.sources.filter(isRecipe)

const toChip = (balance: Balance, state: ChipState): Chip => {
  const unit = itemUnit(balance.item)
  const section =
    editFor(state.edits, balance.id).section ?? startSection(balance.item)
  const recipes = recipeSources(balance)
  return {
    ...balance,
    unit,
    total: totalOf(balance.sources, balance.item, unit),
    section,
    group: state.layout.placed[balance.id] ?? section,
    crossed: state.crossedIds.has(balance.id),
    greyed: balance.extra === null && recipes.every((source) => source.removed),
    customised: recipes.some((source) => source.customised)
  }
}

const rankIn = (order: readonly string[], id: string): number => {
  const i = order.indexOf(id)
  return i === -1 ? order.length : i
}

/** Every chip, in first-seen order. */
export const buildChips = (
  balances: readonly Balance[],
  state: ChipState
): Chip[] =>
  balances
    .map((balance) => toChip(balance, state))
    .sort(
      (a, b) =>
        rankIn(state.layout.order, a.id) - rankIn(state.layout.order, b.id)
    )

/** One category heading and its chips. */
export interface ChipGroup {
  readonly section: ShopSection
  readonly chips: readonly Chip[]
}

/** Chips by the group they sit in, groups in shop order. */
export const groupChips = (chips: readonly Chip[]): ChipGroup[] =>
  groupBy(chips, (chip) => chip.group, SHOP_SECTIONS).map((group) => ({
    section: group.key,
    chips: group.items
  }))

/** True when a chip's category changed since the last sort, so Sort now is offered. */
export const needsSort = (chip: Pick<Chip, 'group' | 'section'>): boolean =>
  chip.group !== chip.section

/** "in 2 recipes", "in 1 recipe and Extra", "in Extra" or "removed from every recipe". */
export const usedInSummary = (
  chip: Pick<Chip, 'sources' | 'extra'>
): string => {
  const n = recipeSources(chip).filter((source) => !source.removed).length
  if (n === 0)
    return chip.extra === null ? 'removed from every recipe' : 'in Extra'
  const recipes = `in ${n} ${n === 1 ? 'recipe' : 'recipes'}`
  return chip.extra === null ? recipes : `${recipes} and Extra`
}

/**
 * A recipe row's chips (#182): every ingredient of the copy, staples included, at its
 * portions. Crossed off is the same state as everywhere else; a removed one is greyed at 0.
 */
export const rowChips = (entry: CopyEntry, state: ChipState): Chip[] =>
  entry.lines.map((line) => {
    const unit = itemUnit(line.item)
    const source: RecipeSource = {
      kind: 'recipe',
      recipeId: entry.recipe.id,
      label: entry.label,
      quantity: line.quantity,
      measure: line.measure,
      removed: line.quantity === 0,
      customised: isCustomisedIn(entry.copy, line.ingredientId)
    }
    const section =
      editFor(state.edits, line.ingredientId).section ?? startSection(line.item)
    return {
      id: line.ingredientId,
      name: line.name,
      item: line.item,
      unit,
      sources: [source],
      total: totalOf([source], line.item, unit),
      extra: null,
      section,
      group: section,
      crossed: state.crossedIds.has(line.ingredientId),
      greyed: source.removed,
      customised: source.customised
    }
  })
