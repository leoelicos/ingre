/* What a user's list says they like (#224): observed class weights, explicit likes and dislikes. */
import type { LibraryRecipe } from '../../types/library'
import type { Group, IngredientClass } from './classes'
import { CLASSES, classOf, groupOf } from './classes'

/** One ingredient the user did something with, and how strongly. */
export interface Signal {
  readonly ingredientId: string
  readonly weight: number
}

/** How much each kind of behaviour says: a picked recipe, a hand-added extra, crossed off, saved. */
export const SIGNAL_WEIGHTS = { picked: 1, extra: 2, bought: 1, kept: 2 }

/** Share of all observed behaviour that fell in each class; classes never seen are absent. */
export type Weights = ReadonlyMap<IngredientClass, number>

export interface Taste {
  readonly weights: Weights
  /** explicit likes and dislikes beat anything observed */
  readonly likes: ReadonlySet<IngredientClass>
  readonly dislikes: ReadonlySet<IngredientClass>
}

export const NO_TASTE: Taste = {
  weights: new Map(),
  likes: new Set(),
  dislikes: new Set()
}

/** What an explicit like or dislike is worth: more than any observed share can reach. */
export const EXPLICIT = 2
/** How much a class's whole group counts towards it, so a carrot lover leans to vegetables. */
export const GROUP_PULL = 0.5

export const recipeSignals = (
  recipes: readonly LibraryRecipe[],
  weight: number
): Signal[] =>
  recipes.flatMap((recipe) =>
    recipe.ingredients.map((line) => ({
      ingredientId: line.ingredientId,
      weight
    }))
  )

export const idSignals = (ids: Iterable<string>, weight: number): Signal[] =>
  [...ids].map((ingredientId) => ({ ingredientId, weight }))

const known = (signals: readonly Signal[]): Signal[] =>
  signals.filter(({ ingredientId }) => classOf(ingredientId) !== 'other')

const totals = (signals: readonly Signal[]): Map<IngredientClass, number> => {
  const sums = new Map<IngredientClass, number>()
  signals.forEach(({ ingredientId, weight }) => {
    const ingredientClass = classOf(ingredientId)
    sums.set(ingredientClass, (sums.get(ingredientClass) ?? 0) + weight)
  })
  return sums
}

/** Observed behaviour as class shares that add up to 1; nothing observed gives no weights. */
export const observedWeights = (signals: readonly Signal[]): Weights => {
  const sums = totals(known(signals))
  const all = [...sums.values()].reduce((a, b) => a + b, 0)
  return new Map(
    [...sums].map(([ingredientClass, sum]): [IngredientClass, number] => [
      ingredientClass,
      sum / all
    ])
  )
}

const classShare = (weights: Weights, ingredientClass: IngredientClass) =>
  weights.get(ingredientClass) ?? 0

const groupShare = (weights: Weights, group: Group): number =>
  CLASSES.filter((c) => groupOf(c) === group).reduce(
    (sum, c) => sum + classShare(weights, c),
    0
  )

/** How much the user favours a class: dislikes, then likes, then what they have done. */
export const affinity = (taste: Taste, ingredientClass: IngredientClass) => {
  if (taste.dislikes.has(ingredientClass)) return -EXPLICIT
  if (taste.likes.has(ingredientClass)) return EXPLICIT
  return (
    classShare(taste.weights, ingredientClass) +
    GROUP_PULL * groupShare(taste.weights, groupOf(ingredientClass))
  )
}

/** A recipe's score: the mean affinity of its ingredients, so size never wins. */
export const recipeScore = (taste: Taste, recipe: LibraryRecipe): number =>
  recipe.ingredients.length === 0
    ? 0
    : recipe.ingredients.reduce(
        (sum, line) => sum + affinity(taste, classOf(line.ingredientId)),
        0
      ) / recipe.ingredients.length

/** Best match first; equal scores (including no history at all) fall back to A to Z. */
export const rankByTaste = (
  recipes: readonly LibraryRecipe[],
  taste: Taste
): LibraryRecipe[] =>
  recipes
    .map((recipe) => ({ recipe, score: recipeScore(taste, recipe) }))
    .sort(
      (a, b) => b.score - a.score || a.recipe.name.localeCompare(b.recipe.name)
    )
    .map(({ recipe }) => recipe)
