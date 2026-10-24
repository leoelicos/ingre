/* The single page's chips (#179): pure functions from the list lines, edits and layout. */
import type { ChipEdit, ChipLayout } from '../storage/shoppingState'
import type { ShopSection } from '../shopping/sections'
import { SHOP_SECTIONS } from '../shopping/sections'
import type { Buy, ShopLine } from '../shopping/shoppingList'
import { catalogueIdOf, groupBy } from '../shopping/shoppingList'

/** One chip: a list line with its edits applied, where it sits and whether it is crossed off. */
export interface Chip {
  /** catalogue id, or the free-text extra's id */
  readonly id: string
  /** the line with the edited category and quantity */
  readonly line: ShopLine
  /** the number in the Quantity field */
  readonly quantity: number
  /** the current category: the chip's colour */
  readonly section: ShopSection
  /** the group the chip sits in until the next sort */
  readonly group: ShopSection
  readonly crossed: boolean
  /** hand-added, so it can be removed */
  readonly extra: boolean
}

/** The chip id for a list line: the same for a recipe line and an extra of the same item. */
export const chipId = (line: Pick<ShopLine, 'ingredientId'>): string =>
  catalogueIdOf(line.ingredientId)

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

/** The quantity a line starts with: its pack or item count, or 1 for a loose weighed amount. */
export const startQuantity = (
  line: Pick<ShopLine, 'buy' | 'extraQuantity'>
): number =>
  line.extraQuantity ?? (line.buy.kind === 'weighed' ? 1 : line.buy.count)

/** The buy scaled from one quantity to another: packs and counts are the quantity itself. */
export const rescaleBuy = (buy: Buy, from: number, to: number): Buy =>
  buy.kind === 'weighed'
    ? {
        kind: 'weighed',
        amount: { ...buy.amount, amount: (buy.amount.amount * to) / from }
      }
    : { ...buy, count: to }

const NO_EDIT: ChipEdit = { quantity: null, section: null }

export const editFor = (
  edits: Readonly<Record<string, ChipEdit>>,
  id: string
): ChipEdit => edits[id] ?? NO_EDIT

/** The line with the chip's edits: its category and its quantity. */
export const applyEdit = (line: ShopLine, edit: ChipEdit): ShopLine => ({
  ...line,
  section: edit.section ?? line.section,
  buy:
    edit.quantity === null
      ? line.buy
      : rescaleBuy(line.buy, startQuantity(line), edit.quantity)
})

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

/** Where the chips for these lines go, by their edited category. */
export const placementsOf = (
  lines: readonly ShopLine[],
  edits: Readonly<Record<string, ChipEdit>>
): Placement[] =>
  lines.map((line) => ({
    id: chipId(line),
    section: applyEdit(line, editFor(edits, chipId(line))).section
  }))

/** What the chips are built from. */
export interface ChipSource {
  readonly lines: readonly ShopLine[]
  readonly edits: Readonly<Record<string, ChipEdit>>
  readonly layout: ChipLayout
  readonly crossedIds: ReadonlySet<string>
}

const toChip = (line: ShopLine, source: ChipSource): Chip => {
  const id = chipId(line)
  const edit = editFor(source.edits, id)
  const edited = applyEdit(line, edit)
  return {
    id,
    line: edited,
    quantity: edit.quantity ?? startQuantity(line),
    section: edited.section,
    group: source.layout.placed[id] ?? edited.section,
    crossed: source.crossedIds.has(id),
    extra: line.extraQuantity !== null
  }
}

const rankIn = (order: readonly string[], id: string): number => {
  const i = order.indexOf(id)
  return i === -1 ? order.length : i
}

/** Every chip, in first-seen order. */
export const buildChips = (source: ChipSource): Chip[] =>
  source.lines
    .map((line) => toChip(line, source))
    .sort(
      (a, b) =>
        rankIn(source.layout.order, a.id) - rankIn(source.layout.order, b.id)
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

/** "in 2 recipes", "in 1 recipe", or "added by you" for an extra. */
export const recipeCountText = (chip: Pick<Chip, 'line'>): string => {
  const n = chip.line.recipes.length
  if (n === 0) return 'added by you'
  return `in ${n} ${n === 1 ? 'recipe' : 'recipes'}`
}
