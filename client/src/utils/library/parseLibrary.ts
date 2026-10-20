/* Runtime validation of the bundled JSON library, so data typos fail loudly and types need no casts. */
import type {
  Amount,
  BaseUnit,
  LibraryIngredient,
  LibraryRecipe,
  LibraryRecipeIngredient,
  HomeLocation,
  SoldOption,
  SoldType
} from '../../types/library'
import { AISLES, SHOP_SECTIONS } from '../shopping/sections'
import type { ShopSection } from '../shopping/sections'
import { BADGE_TONES } from '../../components/IngredientBadge/tones'
import type { BadgeTone } from '../../components/IngredientBadge/tones'

export const BASE_UNITS: readonly BaseUnit[] = ['g', 'ml', 'count']
export const SOLD_TYPES: readonly SoldType[] = [
  'each',
  'bunch',
  'weighed',
  'pack',
  'bag',
  'tin',
  'jar',
  'bottle',
  'carton',
  'tube',
  'tub',
  'grinder'
]
export const HOME_LOCATIONS: readonly HomeLocation[] = [
  'Fridge',
  'Cupboard',
  'Spice rack',
  'Bench'
]

export class LibraryDataError extends Error {
  override name = 'LibraryDataError'
}

type Rec = Record<string, unknown>
const isRecord = (v: unknown): v is Rec =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const failWith = (message: string): never => {
  throw new LibraryDataError(message)
}

const fail = (path: string, what: string): never =>
  failWith(`${path}: expected ${what}`)

const str = (v: unknown, path: string): string =>
  typeof v === 'string' && v.length > 0 ? v : fail(path, 'a non-empty string')

const num = (v: unknown, path: string): number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0
    ? v
    : fail(path, 'a positive number')

const rec = (v: unknown, path: string): Rec =>
  isRecord(v) ? v : fail(path, 'an object')

const arr = (v: unknown, path: string): unknown[] =>
  Array.isArray(v) ? v : fail(path, 'an array')

export const oneOf = <T extends string>(
  options: readonly T[],
  v: unknown,
  path: string
): T =>
  options.find((option) => option === v) ??
  fail(path, `one of ${options.join(', ')}`)

const parseAmount = (v: unknown, path: string): Amount => {
  const r = rec(v, path)
  return {
    amount: num(r['amount'], `${path}.amount`),
    unit: oneOf(BASE_UNITS, r['unit'], `${path}.unit`)
  }
}

const parseSold = (v: unknown, path: string): SoldOption => {
  const r = rec(v, path)
  const type = oneOf(SOLD_TYPES, r['type'], `${path}.type`)
  const size =
    r['size'] === null ? null : parseAmount(r['size'], `${path}.size`)
  if ((type === 'weighed') !== (size === null))
    fail(`${path}.size`, 'null exactly when weighed')
  const label = r['label']
  const plural = r['plural']
  return {
    type,
    size,
    ...(label === undefined ? {} : { label: str(label, `${path}.label`) }),
    ...(plural === undefined ? {} : { plural: str(plural, `${path}.plural`) })
  }
}

/** A badge code override: exactly three upper-case letters A-Z. */
export const BADGE_CODE_PATTERN = /^[A-Z]{3}$/

const parseBadgeCode = (v: unknown, path: string): string =>
  typeof v === 'string' && BADGE_CODE_PATTERN.test(v)
    ? v
    : fail(path, 'exactly 3 upper-case letters A-Z')

const parseMeasureGrams = (v: unknown, path: string): Record<string, number> =>
  Object.entries(rec(v, path)).reduce<Record<string, number>>(
    (acc, [measure, grams]) => ({
      ...acc,
      [measure]: num(grams, `${path}.${measure}`)
    }),
    {}
  )

export const parseIngredient = (
  v: unknown,
  path = 'ingredient'
): LibraryIngredient => {
  const r = rec(v, path)
  const sold = arr(r['sold'], `${path}.sold`).map((s, i) =>
    parseSold(s, `${path}.sold[${i}]`)
  )
  if (sold.length === 0) fail(`${path}.sold`, 'at least one option')
  return {
    id: str(r['id'], `${path}.id`),
    name: str(r['name'], `${path}.name`),
    category: oneOf(AISLES, r['category'], `${path}.category`),
    sold,
    pantry: oneOf(HOME_LOCATIONS, r['pantry'], `${path}.pantry`),
    allergens: arr(r['allergens'], `${path}.allergens`).map((a, i) =>
      str(a, `${path}.allergens[${i}]`)
    ),
    ...(r['staple'] === true ? { staple: true } : {}),
    ...(r['approxGrams'] === undefined
      ? {}
      : { approxGrams: num(r['approxGrams'], `${path}.approxGrams`) }),
    ...(r['measureGrams'] === undefined
      ? {}
      : {
          measureGrams: parseMeasureGrams(
            r['measureGrams'],
            `${path}.measureGrams`
          )
        }),
    ...(r['badgeCode'] === undefined
      ? {}
      : { badgeCode: parseBadgeCode(r['badgeCode'], `${path}.badgeCode`) })
  }
}

const parseRecipeIngredient = (
  v: unknown,
  path: string
): LibraryRecipeIngredient => {
  const r = rec(v, path)
  return {
    ingredientId: str(r['ingredientId'], `${path}.ingredientId`),
    quantity: num(r['quantity'], `${path}.quantity`),
    measure: str(r['measure'], `${path}.measure`)
  }
}

/** Most defining ingredients a recipe may name. */
export const MAX_KEY_INGREDIENTS = 3

/** One key ingredient: an id the recipe itself uses. */
const parseKeyIngredient = (
  v: unknown,
  usedIds: readonly string[],
  path: string
): string => {
  const id = str(v, path)
  return usedIds.includes(id)
    ? id
    : fail(path, 'an ingredientId of this recipe')
}

/** `keyIngredients`: 1 to MAX_KEY_INGREDIENTS distinct ids from the recipe's own ingredients. */
export const parseKeyIngredients = (
  v: unknown,
  usedIds: readonly string[],
  path: string
): string[] => {
  const ids = arr(v, path).map((id, i) =>
    parseKeyIngredient(id, usedIds, `${path}[${i}]`)
  )
  const distinct = new Set(ids).size === ids.length
  return ids.length > 0 && ids.length <= MAX_KEY_INGREDIENTS && distinct
    ? ids
    : fail(path, `1 to ${MAX_KEY_INGREDIENTS} different ingredient ids`)
}

export const parseRecipe = (v: unknown, path = 'recipe'): LibraryRecipe => {
  const r = rec(v, path)
  const picture = r['picture_url']
  const ingredients = arr(r['ingredients'], `${path}.ingredients`).map((g, i) =>
    parseRecipeIngredient(g, `${path}.ingredients[${i}]`)
  )
  const keys = r['keyIngredients']
  return {
    id: str(r['id'], `${path}.id`),
    name: str(r['name'], `${path}.name`),
    portions: num(r['portions'], `${path}.portions`),
    tags: arr(r['tags'], `${path}.tags`).map((t, i) =>
      str(t, `${path}.tags[${i}]`)
    ),
    ingredients,
    ...(keys === undefined
      ? {}
      : {
          keyIngredients: parseKeyIngredients(
            keys,
            ingredients.map((g) => g.ingredientId),
            `${path}.keyIngredients`
          )
        }),
    method: arr(r['method'], `${path}.method`).map((m, i) =>
      str(m, `${path}.method[${i}]`)
    ),
    ...(picture === undefined
      ? {}
      : { picture_url: str(picture, `${path}.picture_url`) })
  }
}

export const parseCatalogue = (data: unknown): LibraryIngredient[] =>
  arr(rec(data, 'catalogue')['ingredients'], 'catalogue.ingredients').map(
    (v, i) => parseIngredient(v, `ingredients[${i}]`)
  )

/** A JSON value as it appears in the data file, or "nothing" when the key is missing. */
const shown = (v: unknown): string =>
  v === undefined ? 'nothing' : JSON.stringify(v)

/** A sectionColours key must be a shop section, spelt and cased exactly. */
const checkSectionKey = (key: string, path: string): ShopSection =>
  SHOP_SECTIONS.find((section) => section === key) ??
  failWith(
    `${path}.${key}: ${shown(
      key
    )} is not a known section (expected one of ${SHOP_SECTIONS.join(', ')})`
  )

/** A section's colour must be a known badge tone; the error names the section and the bad value. */
const sectionTone = (map: Rec, section: ShopSection, path: string): BadgeTone =>
  BADGE_TONES.find((tone) => tone === map[section]) ??
  failWith(
    `${path}.${section}: ${shown(
      map[section]
    )} is not a known colour (expected one of ${BADGE_TONES.join(', ')})`
  )

/**
 * The section-to-colour map for ingredient badges. Every shop section needs a known tone,
 * and every key must be a shop section (unknown or miscased keys fail loudly).
 */
export const parseSectionColours = (
  data: unknown
): Readonly<Record<ShopSection, BadgeTone>> => {
  const path = 'catalogue.sectionColours'
  const map = rec(rec(data, 'catalogue')['sectionColours'], path)
  Object.keys(map).forEach((key) => checkSectionKey(key, path))
  const tone = (section: ShopSection): BadgeTone =>
    sectionTone(map, section, path)
  return {
    'Fruit & Veg': tone('Fruit & Veg'),
    'Meat & Seafood': tone('Meat & Seafood'),
    'Dairy, Eggs & Fridge': tone('Dairy, Eggs & Fridge'),
    Deli: tone('Deli'),
    Bakery: tone('Bakery'),
    Pantry: tone('Pantry'),
    Frozen: tone('Frozen'),
    Other: tone('Other')
  }
}

export const parseRecipes = (data: unknown): LibraryRecipe[] =>
  arr(rec(data, 'library')['recipes'], 'library.recipes').map((v, i) =>
    parseRecipe(v, `recipes[${i}]`)
  )
