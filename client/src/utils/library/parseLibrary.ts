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
import { AISLES } from '../shopping/sections'

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

const fail = (path: string, what: string): never => {
  throw new LibraryDataError(`${path}: expected ${what}`)
}

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
  return label === undefined
    ? { type, size }
    : { type, size, label: str(label, `${path}.label`) }
}

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
        })
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

export const parseRecipe = (v: unknown, path = 'recipe'): LibraryRecipe => {
  const r = rec(v, path)
  const picture = r['picture_url']
  return {
    id: str(r['id'], `${path}.id`),
    name: str(r['name'], `${path}.name`),
    portions: num(r['portions'], `${path}.portions`),
    tags: arr(r['tags'], `${path}.tags`).map((t, i) =>
      str(t, `${path}.tags[${i}]`)
    ),
    ingredients: arr(r['ingredients'], `${path}.ingredients`).map((g, i) =>
      parseRecipeIngredient(g, `${path}.ingredients[${i}]`)
    ),
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

export const parseRecipes = (data: unknown): LibraryRecipe[] =>
  arr(rec(data, 'library')['recipes'], 'library.recipes').map((v, i) =>
    parseRecipe(v, `recipes[${i}]`)
  )
