/*
 * Order-pad constraints (#233): what a constraint does to one ticket (a recipe copy). Pure:
 * it says what to change; the page makes the change.
 */
import type { CopyLine } from '../balance/copies'
import { clampPortions, usedLines } from '../balance/copies'
import { normaliseTerm } from '../library/searchTerms'
import { convert, toBase } from '../shopping/units'
import type { Constraint } from './parse'

export type Outcome =
  | { readonly kind: 'portions'; readonly portions: number }
  /** the ingredient moves to `quantity`, in the recipe's own measure */
  | {
      readonly kind: 'set'
      readonly ingredientId: string
      readonly name: string
      readonly quantity: number
      readonly measure: string
    }
  | { readonly kind: 'within'; readonly name: string }
  | { readonly kind: 'missing'; readonly ingredient: string }
  | { readonly kind: 'unit'; readonly name: string }
  | { readonly kind: 'range' }

const named = (line: CopyLine, wanted: string): boolean =>
  wanted.split(' ').every((word) => normaliseTerm(line.name).includes(word))

/** The ticket's ingredient a phrase names: the exact name first, then the shortest name holding every word. */
export const lineNamed = (
  lines: readonly CopyLine[],
  ingredient: string
): CopyLine | null => {
  const wanted = normaliseTerm(ingredient)
  const holding = usedLines(lines).filter((line) => named(line, wanted))
  return (
    holding.find((line) => normaliseTerm(line.name) === wanted) ??
    [...holding].sort((a, b) => a.name.length - b.name.length)[0] ??
    null
  )
}

const bounded = (
  line: CopyLine,
  constraint: Extract<Constraint, { kind: 'bound' }>
): Outcome => {
  const { item } = line
  const have = item === null ? null : toBase(line.quantity, line.measure, item)
  const limit =
    have === null || item === null
      ? null
      : convert(
          { amount: constraint.amount, unit: constraint.unit },
          have.unit,
          item
        )
  if (have === null || limit === null) return { kind: 'unit', name: line.name }
  const fine =
    constraint.bound === 'atMost' ? have.amount <= limit : have.amount >= limit
  return fine
    ? { kind: 'within', name: line.name }
    : {
        kind: 'set',
        ingredientId: line.ingredientId,
        name: line.name,
        quantity:
          Math.round(((line.quantity * limit) / have.amount) * 100) / 100,
        measure: line.measure
      }
}

/** What the constraint asks of this ticket's lines. Portions outside 1 to 12 are a range error, not clamped silently. */
export const resolveConstraint = (
  constraint: Constraint,
  lines: readonly CopyLine[]
): Outcome => {
  if (constraint.kind === 'portions')
    return clampPortions(constraint.portions) === constraint.portions
      ? { kind: 'portions', portions: constraint.portions }
      : { kind: 'range' }
  const line = lineNamed(lines, constraint.ingredient)
  return line === null
    ? { kind: 'missing', ingredient: constraint.ingredient }
    : bounded(line, constraint)
}
