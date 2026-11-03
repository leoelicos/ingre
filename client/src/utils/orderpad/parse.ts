/*
 * Order-pad constraints (#233): the short phrases a cook says when ordering ("portion for 3",
 * "at most 1 kg carrots") read into plain data. Pure: no state, no catalogue.
 */
import type { BaseUnit } from '../../types/library'

export type Bound = 'atMost' | 'atLeast'

export type Constraint =
  | { readonly kind: 'portions'; readonly portions: number }
  | {
      readonly kind: 'bound'
      readonly bound: Bound
      readonly amount: number
      readonly unit: BaseUnit
      /** what the cook typed, e.g. "carrots" */
      readonly ingredient: string
    }

/** "portion for 3", "portions for 3", "for 3", "serves 3", "3 portions". One digit group each. */
const PORTIONS: readonly RegExp[] = [
  /^(?:(?:a |the )?(?:portions?|servings?) )?for (\d+)$/,
  /^serves (\d+)$/,
  /^(\d+) (?:portions?|servings?)$/
]

const BOUNDS: readonly { readonly bound: Bound; readonly words: string }[] = [
  { bound: 'atMost', words: 'at most|no more than|up to|maximum|max' },
  { bound: 'atLeast', words: 'at least|no less than|minimum|min' }
]

/** Unit words, each as the grams, millilitres or count they stand for. */
const UNITS: Readonly<Record<string, { unit: BaseUnit; scale: number }>> = {
  g: { unit: 'g', scale: 1 },
  gram: { unit: 'g', scale: 1 },
  grams: { unit: 'g', scale: 1 },
  kg: { unit: 'g', scale: 1000 },
  kilo: { unit: 'g', scale: 1000 },
  kilos: { unit: 'g', scale: 1000 },
  kilogram: { unit: 'g', scale: 1000 },
  kilograms: { unit: 'g', scale: 1000 },
  ml: { unit: 'ml', scale: 1 },
  millilitre: { unit: 'ml', scale: 1 },
  millilitres: { unit: 'ml', scale: 1 },
  l: { unit: 'ml', scale: 1000 },
  litre: { unit: 'ml', scale: 1000 },
  litres: { unit: 'ml', scale: 1000 }
}

/** After the bound words: a number, then the rest ("kg carrots", "red onions", "of flour"). */
const AMOUNT = /^(\d+(?:\.\d+)?)\s*(.+)$/

const portionsOf = (text: string): Constraint | null => {
  const digits = PORTIONS.map((pattern) => pattern.exec(text)?.[1]).find(
    (found) => found !== undefined
  )
  return digits === undefined
    ? null
    : { kind: 'portions', portions: Number(digits) }
}

/** "kg carrots" -> grams and "carrots"; "red onions" -> a count and "red onions". */
const unitAndIngredient = (
  rest: string
): { unit: BaseUnit; scale: number; ingredient: string } => {
  const [first = '', ...others] = rest.split(' ')
  const known = UNITS[first]
  const words = known === undefined ? [first, ...others] : others
  const ingredient = (words[0] === 'of' ? words.slice(1) : words).join(' ')
  return { unit: known?.unit ?? 'count', scale: known?.scale ?? 1, ingredient }
}

const boundOf = (text: string): Constraint | null => {
  const found = BOUNDS.map(({ bound, words }) => ({
    bound,
    rest: new RegExp(`^(?:${words}) (.+)$`).exec(text)?.[1]
  })).find((entry) => entry.rest !== undefined)
  const amount = AMOUNT.exec(found?.rest ?? '')
  if (found === undefined || amount === null) return null
  const { unit, scale, ingredient } = unitAndIngredient(amount[2] ?? '')
  return ingredient === ''
    ? null
    : {
        kind: 'bound',
        bound: found.bound,
        amount: Number(amount[1]) * scale,
        unit,
        ingredient
      }
}

/** The constraint a phrase says, or null when it is not one we know. */
export const parseConstraint = (text: string): Constraint | null => {
  const phrase = text.trim().toLowerCase().replace(/\s+/g, ' ')
  return portionsOf(phrase) ?? boundOf(phrase)
}
