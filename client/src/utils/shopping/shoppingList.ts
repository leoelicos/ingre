/* Pure shopping-list pipeline: collectNeeds -> mergeById -> toShopUnits -> groupBy / splitByHave. */
import type {
  Amount,
  HomeLocation,
  LibraryIngredient,
  LibraryRecipe,
  SoldOption
} from '../../types/library'
import type { ShopSection } from './sections'
import { placeInShop } from './sections'
import { splitTitle } from '../../components/Widgets/RecipeCard/recipeCardHelpers'
import { convert, formatAmount, toBase } from './units'

export interface NeedPart {
  ingredientId: string
  recipe: string
  quantity: number
  measure: string
}

export interface MergedNeed {
  ingredientId: string
  parts: NeedPart[]
}

type SizedOption = SoldOption & { size: Amount }

export type Buy =
  | { kind: 'packs'; option: SizedOption; count: number }
  | { kind: 'weighed'; amount: Amount }

export interface ShopLine {
  ingredientId: string
  name: string
  section: ShopSection
  /** Pantry aisle shown as a quiet sub-heading; null elsewhere */
  subsection: string | null
  location: HomeLocation
  staple: boolean
  need: Amount
  buy: Buy
  recipes: string[]
  parts: NeedPart[]
}

/** Scales every recipe ingredient to `people` serves. */
export const collectNeeds = (
  recipes: readonly LibraryRecipe[],
  people: number
): NeedPart[] =>
  recipes.flatMap((recipe) =>
    recipe.ingredients.map(({ ingredientId, quantity, measure }) => ({
      ingredientId,
      recipe: recipe.name,
      quantity: (quantity * people) / recipe.portions,
      measure
    }))
  )

/** Groups parts by ingredient, keeping first-seen order. */
export const mergeById = (parts: readonly NeedPart[]): MergedNeed[] =>
  [...new Set(parts.map((p) => p.ingredientId))].map((ingredientId) => ({
    ingredientId,
    parts: parts.filter((p) => p.ingredientId === ingredientId)
  }))

const isSized = (option: SoldOption): option is SizedOption =>
  option.size !== null

const WEIGHED_STEP_GRAMS = 50

/** Total need in one unit: the item's first pack unit when every part converts to it. */
export const totalNeed = (
  parts: readonly NeedPart[],
  item: LibraryIngredient
): { need: Amount; convertible: boolean } => {
  const unit = item.sold.find(isSized)?.size.unit ?? 'g'
  const amounts = parts.map((p) => toBase(p.quantity, p.measure, item))
  const inUnit = amounts.map((a) =>
    a === null ? null : convert(a, unit, item)
  )
  if (inUnit.every((n): n is number => n !== null))
    return {
      need: { amount: inUnit.reduce((sum, n) => sum + n, 0), unit },
      convertible: true
    }
  const fallbackUnit = amounts.find((a) => a !== null)?.unit ?? 'count'
  return {
    need: {
      amount: parts.reduce((sum, p) => sum + p.quantity, 0),
      unit: fallbackUnit
    },
    convertible: false
  }
}

/**
 * Smallest purchase covering the need: the pack size and count with the least
 * leftover (ties: fewer packs, then catalogue order). Loose weighed items are only
 * used when nothing else is sold. If the need can't be converted (e.g. rice paper
 * sheets vs gram packs), one smallest pack is bought.
 */
export const chooseBuy = (
  need: Amount,
  convertible: boolean,
  item: LibraryIngredient
): Buy => {
  const sized = item.sold.filter(isSized)
  const candidates = convertible
    ? sized.flatMap((option) => {
        const inOption = convert(need, option.size.unit, item)
        if (inOption === null) return []
        const count = Math.max(
          1,
          Math.ceil(inOption / option.size.amount - 1e-9)
        )
        // bought relative to need: unit-free, so options in g and count compare
        const bought = (count * option.size.amount) / Math.max(inOption, 1e-9)
        return [{ option, count, bought }]
      })
    : []
  const best = candidates.reduce<(typeof candidates)[number] | null>(
    (acc, c) =>
      acc === null ||
      c.bought < acc.bought - 1e-9 ||
      (Math.abs(c.bought - acc.bought) <= 1e-9 && c.count < acc.count)
        ? c
        : acc,
    null
  )
  if (best) return { kind: 'packs', option: best.option, count: best.count }
  const grams = convertible ? convert(need, 'g', item) : null
  if (item.sold.some((o) => o.type === 'weighed') && grams !== null)
    return {
      kind: 'weighed',
      amount: {
        amount: Math.ceil(grams / WEIGHED_STEP_GRAMS) * WEIGHED_STEP_GRAMS,
        unit: 'g'
      }
    }
  const smallest = [...sized].sort((a, b) => a.size.amount - b.size.amount)[0]
  return smallest
    ? { kind: 'packs', option: smallest, count: 1 }
    : { kind: 'weighed', amount: need }
}

/** Builds priced-up shop lines; ingredients missing from the catalogue are skipped. */
export const toShopUnits =
  (catalogue: readonly LibraryIngredient[]) =>
  (merged: readonly MergedNeed[]): ShopLine[] =>
    merged.flatMap(({ ingredientId, parts }) => {
      const item = catalogue.find((i) => i.id === ingredientId)
      if (!item) return []
      const { need, convertible } = totalNeed(parts, item)
      return [
        {
          ingredientId,
          name: item.name,
          ...placeInShop(item.category),
          location: item.pantry,
          staple: item.staple === true,
          need,
          buy: chooseBuy(need, convertible, item),
          recipes: [...new Set(parts.map((p) => p.recipe))],
          parts
        }
      ]
    })

/** Generic grouping: groups in `order`, then unknown keys alphabetically; item order kept. */
export const groupBy = <T, K extends string>(
  items: readonly T[],
  keyOf: (item: T) => K,
  order: readonly K[] = []
): { key: K; items: T[] }[] => {
  const keys = [...new Set(items.map(keyOf))]
  const rank = (k: K) => {
    const i = order.indexOf(k)
    return i === -1 ? order.length : i
  }
  return keys
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    .map((key) => ({ key, items: items.filter((i) => keyOf(i) === key) }))
}

/** Splits lines into those still to buy and those already at home. */
export const splitByHave = (
  lines: readonly ShopLine[],
  haveIds: ReadonlySet<string>
): { toBuy: ShopLine[]; alreadyHave: ShopLine[] } => ({
  toBuy: lines.filter((l) => !haveIds.has(l.ingredientId)),
  alreadyHave: lines.filter((l) => haveIds.has(l.ingredientId))
})

/** Applies the user's per-ingredient home-location choices. */
export const withLocations = (
  lines: readonly ShopLine[],
  overrides: Readonly<Record<string, HomeLocation>>
): ShopLine[] =>
  lines.map((line) => ({
    ...line,
    location: overrides[line.ingredientId] ?? line.location
  }))

export const buildShoppingList = (
  recipes: readonly LibraryRecipe[],
  people: number,
  catalogue: readonly LibraryIngredient[]
): ShopLine[] =>
  toShopUnits(catalogue)(mergeById(collectNeeds(recipes, people)))

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "Brown onion, 2" / "Crushed tomatoes, 1 × 400 g tin" / "Eggs, 1 × carton of 6". */
export const shopLabel = ({ name, buy }: Pick<ShopLine, 'name' | 'buy'>) => {
  const title = capitalise(name)
  if (buy.kind === 'weighed') return `${title}, ${formatAmount(buy.amount)}`
  const { option, count } = buy
  if (option.type === 'each')
    return option.label === undefined
      ? `${title}, ${count}`
      : `${title}, ${count} × ${option.label}`
  if (option.type === 'bunch')
    return `${title}, ${count} ${count === 1 ? 'bunch' : 'bunches'}`
  const what =
    option.size.unit === 'count'
      ? option.label ?? `${option.type} of ${option.size.amount}`
      : `${formatAmount(option.size)} ${option.label ?? option.type}`
  return `${title}, ${count} × ${what}`
}

export const needLabel = ({ need }: Pick<ShopLine, 'need'>) =>
  `need ${formatAmount(need)}`

/** "for butter chicken and dahl". */
export const forLabel = (recipeNames: readonly string[]): string => {
  const names = recipeNames.map((r) => splitTitle(r).title.toLowerCase())
  const last = names[names.length - 1]
  if (last === undefined) return ''
  return names.length === 1
    ? `for ${last}`
    : `for ${names.slice(0, -1).join(', ')} and ${last}`
}

const tidy = (n: number) => String(Math.round(n * 100) / 100)

/** "Butter chicken: 1.5 tbsp" / "Dahl: 2" (whole items show just the count). */
export const partLabel = ({ recipe, quantity, measure }: NeedPart): string =>
  `${splitTitle(recipe).title}: ${tidy(quantity)}${
    measure === 'whole' ? '' : ` ${measure}`
  }`
