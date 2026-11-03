/* #230: one recipe-ingredient line ("1 1/2 cups red lentils, rinsed") as a library ingredient. */
import type {
  LibraryIngredient,
  LibraryRecipeIngredient
} from '../../types/library'
import { ingredientMatches } from '../explore/exploreSearch'
import { normaliseTerm } from '../library/searchTerms'
import { toBase } from '../shopping/units'

interface Unit {
  readonly measure: string
  readonly factor: number
}

const UNITS: Readonly<Record<string, Unit>> = {
  g: { measure: 'g', factor: 1 },
  gram: { measure: 'g', factor: 1 },
  kg: { measure: 'g', factor: 1000 },
  kilogram: { measure: 'g', factor: 1000 },
  ml: { measure: 'ml', factor: 1 },
  millilitre: { measure: 'ml', factor: 1 },
  milliliter: { measure: 'ml', factor: 1 },
  l: { measure: 'ml', factor: 1000 },
  litre: { measure: 'ml', factor: 1000 },
  liter: { measure: 'ml', factor: 1000 },
  tsp: { measure: 'tsp', factor: 1 },
  teaspoon: { measure: 'tsp', factor: 1 },
  tbsp: { measure: 'tbsp', factor: 1 },
  tablespoon: { measure: 'tbsp', factor: 1 },
  cup: { measure: 'cup', factor: 1 },
  clove: { measure: 'clove', factor: 1 },
  bunch: { measure: 'bunch', factor: 1 },
  stalk: { measure: 'stalk', factor: 1 }
}

const FRACTIONS: Readonly<Record<string, number>> = {
  '½': 1 / 2,
  '¼': 1 / 4,
  '¾': 3 / 4,
  '⅓': 1 / 3,
  '⅔': 2 / 3
}

const SLASH = /^(\d+)\/(\d+)$/
const NUMBER = /^\d+(?:\.\d+)?$/
const AMOUNT =
  /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?\s*[½¼¾⅓⅔]|\d+(?:\.\d+)?|[½¼¾⅓⅔]|)\s*([\s\S]*)$/

/** "1/2" -> 0.5; anything that is not a fraction -> null. */
const slashFraction = (text: string): number | null => {
  const match = SLASH.exec(text)
  const bottom = Number(match?.[2])
  return match === null || bottom === 0 ? null : Number(match[1]) / bottom
}

/** "1½" -> 1.5; null for anything else. */
const mixedFraction = (text: string): number | null => {
  const fraction = FRACTIONS[text.slice(-1)]
  const lead = text.slice(0, -1)
  return fraction === undefined || !NUMBER.test(lead)
    ? null
    : Number(lead) + fraction
}

const single = (text: string): number | null =>
  NUMBER.test(text)
    ? Number(text)
    : slashFraction(text) ?? FRACTIONS[text] ?? mixedFraction(text)

/** "1 1/2", "1½", "0.5", "½", "2" as a number; null for anything else. */
export const parseNumber = (text: string): number | null => {
  const values = text.trim().split(/\s+/).map(single)
  const known = values.flatMap((value) => (value === null ? [] : [value]))
  return values.length <= 2 && known.length === values.length
    ? known.reduce((sum, value) => sum + value, 0)
    : null
}

const unitOf = (word: string): Unit | null =>
  UNITS[word.toLowerCase().replace(/\.$/, '').replace(/s$/, '')] ?? null

interface Split {
  readonly quantity: number
  readonly measure: string
  readonly name: string
}

/** The text after a unit word, without "of", a trailing note after "," or "(". */
const nameOf = (text: string): string =>
  text
    .replace(/[,(][\s\S]*$/, '')
    .replace(/^of\s+/i, '')
    .trim()

/** Quantity, unit and name of a line. No quantity means one; no known unit means whole items. */
export const splitLine = (line: string): Split => {
  const text = line.trim()
  const quantity = parseNumber(text.replace(AMOUNT, '$1')) ?? 1
  const rest = text.replace(AMOUNT, '$2')
  const unit = unitOf(rest.replace(/\s[\s\S]*$/, ''))
  return unit === null
    ? { quantity, measure: 'whole', name: nameOf(rest) }
    : {
        quantity: quantity * unit.factor,
        measure: unit.measure,
        name: nameOf(rest.replace(/^\S+\s*/, ''))
      }
}

const contains = (text: string, item: LibraryIngredient): boolean =>
  ` ${text} `.includes(` ${normaliseTerm(item.name)} `)

const bySize = (items: readonly LibraryIngredient[], sign: 1 | -1) =>
  [...items].sort((a, b) => sign * (a.name.length - b.name.length))[0] ?? null

/**
 * The catalogue item a name means, best first: the item of exactly that name ("tomatoes"); the
 * shortest item whose name has all its words ("crushed tomatoes" -> canned crushed tomatoes);
 * the longest item name inside it ("sea salt" -> salt).
 */
export const findItem = (
  name: string,
  catalogue: readonly LibraryIngredient[]
): LibraryIngredient | null => {
  if (name === '') return null
  const text = normaliseTerm(name)
  return (
    catalogue.find((item) => normaliseTerm(item.name) === text) ??
    bySize(
      catalogue.filter((item) => ingredientMatches(item, name)),
      1
    ) ??
    bySize(
      catalogue.filter((item) => contains(text, item)),
      -1
    )
  )
}

/** A measure the item cannot convert (a clove of something sold by weight) becomes whole items. */
const knownMeasure = (
  quantity: number,
  measure: string,
  item: LibraryIngredient
): string => (toBase(quantity, measure, item) === null ? 'whole' : measure)

/** The library ingredient for a line, or null when the catalogue has nothing like it. */
export const parseIngredientLine = (
  line: string,
  catalogue: readonly LibraryIngredient[]
): LibraryRecipeIngredient | null => {
  const { quantity, measure, name } = splitLine(line)
  const item = findItem(name, catalogue)
  return item === null
    ? null
    : {
        ingredientId: item.id,
        quantity,
        measure: knownMeasure(quantity, measure, item)
      }
}
