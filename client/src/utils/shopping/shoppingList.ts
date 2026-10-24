import { capitaliseFirst } from '../capitaliseFirst'
/* Pure shopping-list pipeline: collectNeeds -> mergeById -> toShopUnits -> groupBy / splitByHave. */
import type {
  Amount,
  HomeLocation,
  LibraryIngredient,
  LibraryRecipe,
  SoldOption
} from '../../types/library'
import type { Extra } from '../storage/shoppingState'
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
  | { kind: 'count'; count: number }

export interface ShopLine {
  ingredientId: string
  name: string
  section: ShopSection
  /** Pantry aisle shown as a quiet sub-heading; null elsewhere */
  subsection: string | null
  /** home location; null for free-text extras (shown under Other at home) */
  location: HomeLocation | null
  staple: boolean
  need: Amount
  buy: Buy
  recipes: string[]
  parts: NeedPart[]
  /** hand-added extras carry their stepper quantity; recipe lines have null */
  extraQuantity: number | null
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
          parts,
          extraQuantity: null
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

export const buildShoppingList = (
  recipes: readonly LibraryRecipe[],
  people: number,
  catalogue: readonly LibraryIngredient[]
): ShopLine[] =>
  toShopUnits(catalogue)(mergeById(collectNeeds(recipes, people)))

/** Display name: "Brown onion". */
export const displayName = ({ name }: Pick<ShopLine, 'name'>) =>
  capitaliseFirst(name)

/** What to put in the trolley: "2", "1 garlic bulb", "1 × 500 g", "1 bunch", "1 × carton of 6", "100 g". */
export const buyAmount = ({ buy }: Pick<ShopLine, 'buy'>): string => {
  if (buy.kind === 'weighed') return formatAmount(buy.amount)
  if (buy.kind === 'count') return `${buy.count}`
  const { option, count } = buy
  if (option.type === 'each')
    return option.label === undefined
      ? `${count}`
      : `${count} ${
          count === 1 ? option.label : option.plural ?? `${option.label}s`
        }`
  if (option.type === 'bunch')
    return `${count} ${count === 1 ? 'bunch' : 'bunches'}`
  const what =
    option.size.unit === 'count'
      ? option.label ?? `${option.type} of ${option.size.amount}`
      : option.label === undefined
      ? formatAmount(option.size)
      : `${formatAmount(option.size)} ${option.label}`
  return `${count} × ${what}`
}

/** Print line: "1 small piece ginger", or just "1 garlic bulb" when the amount names it. */
export const printLine = (line: Pick<ShopLine, 'buy' | 'name'>): string => {
  const amount = buyAmount(line)
  return amount.includes(line.name) ? amount : `${amount} ${line.name}`
}

const BIG_UNIT: Readonly<Record<'g' | 'ml', string>> = { g: 'kg', ml: 'L' }

/** Shopper-friendly weight/volume: <100 to 5, <1000 to 10, else kg/L to one decimal. */
export const roundMeasure = (amount: number, unit: 'g' | 'ml'): string => {
  const step = amount < 100 ? 5 : 10
  const rounded = Math.max(step, Math.round(amount / step) * step)
  return rounded >= 1000
    ? `${Math.round(amount / 100) / 10} ${BIG_UNIT[unit]}`
    : `${rounded} ${unit}`
}

/** Recipe measures counted in whole units, with their singular/plural nouns. */
const COUNT_NOUNS: Readonly<Record<string, readonly [string, string]>> = {
  whole: ['', ''],
  clove: ['clove', 'cloves'],
  stalk: ['stalk', 'stalks'],
  bunch: ['bunch', 'bunches']
}

/** True when buying `buy` is literally `count` of the thing (need adds nothing). */
const sameAsBuy = (buy: Buy, count: number, measure: string) =>
  buy.kind === 'packs' &&
  buy.option.size.unit === 'count' &&
  buy.count * buy.option.size.amount === count &&
  ((buy.option.type === 'each' && measure === 'whole') ||
    (buy.option.type === 'bunch' && measure === 'bunch'))

/**
 * "need 2 cloves", "need 3 stalks", "need 340 g", "need 1.2 kg"; null when the need says
 * nothing the buy amount doesn't (2 onions to buy 2 onions) or for hand-added extras.
 */
export const needLabel = ({
  need,
  parts,
  buy
}: Pick<ShopLine, 'need' | 'parts' | 'buy'>): string | null => {
  if (parts.length === 0) return null
  const measures = [...new Set(parts.map((p) => p.measure))]
  const measure = measures.length === 1 ? measures.join('') : ''
  const nouns = COUNT_NOUNS[measure]
  if (nouns !== undefined) {
    const count = Math.ceil(
      parts.reduce((sum, p) => sum + p.quantity, 0) - 1e-9
    )
    if (sameAsBuy(buy, count, measure)) return null
    const noun = count === 1 ? nouns[0] : nouns[1]
    return noun === '' ? `need ${count}` : `need ${count} ${noun}`
  }
  if (need.unit === 'count') {
    const count = Math.ceil(need.amount - 1e-9)
    return sameAsBuy(buy, count, 'whole') ? null : `need ${count}`
  }
  return `need ${roundMeasure(need.amount, need.unit)}`
}

/** "for butter chicken and dahl". */
export const forLabel = (recipeNames: readonly string[]): string => {
  const names = recipeNames.map((r) => splitTitle(r).title.toLowerCase())
  const last = names[names.length - 1]
  if (last === undefined) return ''
  return names.length === 1
    ? `for ${last}`
    : `for ${names.slice(0, -1).join(', ')} and ${last}`
}

const FRACTIONS: readonly (readonly [number, string])[] = [
  [0.25, '¼'],
  [0.5, '½'],
  [0.75, '¾']
]

/** 0.5 -> "½", 1.25 -> "1¼", 0.3 -> "0.3" (two decimals at most). */
export const fraction = (n: number): string => {
  const rounded = Math.round(n * 100) / 100
  const whole = Math.floor(rounded)
  const part = Math.round((rounded - whole) * 100) / 100
  const glyph = FRACTIONS.find(([value]) => value === part)?.[1]
  return glyph === undefined
    ? String(rounded)
    : whole === 0
    ? glyph
    : `${whole}${glyph}`
}

/** Irregular or -o/-i nouns used in the catalogue: singular -> plural. */
export const IRREGULAR_PLURALS: Readonly<Record<string, string>> = {
  leaf: 'leaves',
  chilli: 'chillies',
  potato: 'potatoes',
  tomato: 'tomatoes',
  egg: 'eggs'
}
const SINGULARS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(IRREGULAR_PLURALS).map(([one, many]) => [many, one])
)

/** Ends in a plural -s (not -ss or -us, e.g. "glass", "hummus"). */
const looksPlural = (word: string) => /[^su]s$/.test(word)

/** Applies `fn` to the last word of a phrase ("red chilli" -> "red chillies"). */
const onLastWord = (phrase: string, fn: (word: string) => string): string => {
  const i = phrase.lastIndexOf(' ') + 1
  return phrase.slice(0, i) + fn(phrase.slice(i))
}

/** Plural, never doubled: egg -> eggs, eggs -> eggs, leaf -> leaves, bunch -> bunches. */
export const pluralise = (phrase: string): string =>
  onLastWord(
    phrase,
    (word) =>
      IRREGULAR_PLURALS[word] ??
      (SINGULARS[word] !== undefined || looksPlural(word)
        ? word
        : /(s|x|ch|sh)$/.test(word)
        ? `${word}es`
        : /[^aeiou]y$/.test(word)
        ? `${word.slice(0, -1)}ies`
        : `${word}s`)
  )

/** Singular for catalogue names given in the plural: eggs -> egg, tomatoes -> tomato. */
export const singularise = (phrase: string): string =>
  onLastWord(
    phrase,
    (word) => SINGULARS[word] ?? (looksPlural(word) ? word.slice(0, -1) : word)
  )

/** Measures that take a plural (spoons, g and ml never do). */
const COUNTED_MEASURES: readonly string[] = ['cup', 'clove', 'stalk', 'bunch']

/** "½ tbsp", "3 cloves", "½ brown onion", "2 brown onions". */
export const partAmount = (
  { quantity, measure }: Pick<NeedPart, 'quantity' | 'measure'>,
  name: string
): string => {
  const noun = measure === 'whole' ? name : measure
  const counted = measure === 'whole' || COUNTED_MEASURES.includes(measure)
  const named = !counted
    ? noun
    : quantity > 1
    ? pluralise(noun)
    : singularise(noun)
  return `${fraction(quantity)} ${named}`
}

/** "Butter chicken: ½ tbsp" / "Dahl: 2 brown onions". */
export const partLabel = (part: NeedPart, name: string): string =>
  `${splitTitle(part.recipe).title}: ${partAmount(part, name)}`

/** Recipe page: "uses ½ tbsp" (several uses joined with +). */
export const usesLabel = ({
  parts,
  name
}: Pick<ShopLine, 'parts' | 'name'>): string =>
  `uses ${parts.map((part) => partAmount(part, name)).join(' + ')}`

/** Short staple names, e.g. "oil, salt, pepper" (oils collapse to one). */
export const assumedNames = (lines: readonly { name: string }[]): string =>
  [
    ...new Set(
      lines.map(({ name }) =>
        name.endsWith(' oil')
          ? 'oil'
          : name.endsWith('pepper')
          ? 'pepper'
          : name.toLowerCase()
      )
    )
  ].join(', ')

/** Grams per stepper step for extras sold only loose by weight. */
export const EXTRA_WEIGHED_GRAMS = 500
/** Shop section for free-text extras (they have no home location). */
export const FREE_TEXT_SECTION: ShopSection = 'Other'

const EXTRA_PREFIX = 'extra:'

export const extraLineId = (extra: Pick<Extra, 'id'>) =>
  `${EXTRA_PREFIX}${extra.id}`

/** The catalogue id behind a line id: recipe lines use it as is, catalogue extras prefix it. */
export const catalogueIdOf = (lineId: string): string =>
  lineId.startsWith(EXTRA_PREFIX) ? lineId.slice(EXTRA_PREFIX.length) : lineId

/** Extras a picked recipe already needs are left out, so each item is on the list once (#162). */
export const withoutDuplicateExtras = (
  recipeLines: readonly ShopLine[],
  extras: readonly ShopLine[]
): ShopLine[] => {
  const needed = new Set(recipeLines.map((line) => line.ingredientId))
  return extras.filter((line) => !needed.has(catalogueIdOf(line.ingredientId)))
}

const extraBuy = (item: LibraryIngredient, quantity: number): Buy => {
  const option = item.sold.find(isSized)
  return option === undefined
    ? {
        kind: 'weighed',
        amount: { amount: quantity * EXTRA_WEIGHED_GRAMS, unit: 'g' }
      }
    : { kind: 'packs', option, count: quantity }
}

const boughtAmount = (buy: Buy): Amount => {
  if (buy.kind === 'packs')
    return {
      amount: buy.count * buy.option.size.amount,
      unit: buy.option.size.unit
    }
  return buy.kind === 'weighed'
    ? buy.amount
    : { amount: buy.count, unit: 'count' }
}

/** Where a typed staple lives at home (its shop section stays Pantry). */
export const STAPLE_EXTRA_LOCATION: HomeLocation = 'Cupboard'

/** Hand-added items: one pack (or 500 g loose) per step; free text goes to Other. */
export const extraLines = (
  extras: readonly Extra[],
  catalogue: readonly LibraryIngredient[]
): ShopLine[] =>
  extras.map((extra) => {
    const item = catalogue.find((i) => i.id === extra.ingredientId)
    // typed staples (salt, oil, pepper) are a plain count: stepper only, no pack size
    const staple = item?.staple === true
    const buy: Buy =
      item === undefined || staple
        ? { kind: 'count', count: extra.quantity }
        : extraBuy(item, extra.quantity)
    return {
      ingredientId: extraLineId(extra),
      name: item?.name ?? extra.name,
      ...(item === undefined
        ? { section: FREE_TEXT_SECTION, subsection: null }
        : placeInShop(item.category)),
      location: staple ? STAPLE_EXTRA_LOCATION : item?.pantry ?? null,
      staple: false,
      need: boughtAmount(buy),
      buy,
      recipes: [],
      parts: [],
      extraQuantity: extra.quantity
    }
  })

/** Second line under a row: "for butter chicken and dahl", or "extra". */
export const sourceLabel = (
  line: Pick<ShopLine, 'recipes' | 'extraQuantity'>
) => (line.extraQuantity === null ? forLabel(line.recipes) : 'extra')
