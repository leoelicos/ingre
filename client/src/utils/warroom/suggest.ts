/*
 * Suggestions around what is on the list (t33u), all local and explainable:
 * - ingredients that go with it: how many catalogue recipes hold both, times a bit more for
 *   what this person adds; the reason names the item it goes with best ("with mince");
 * - recipes nearly there: at least one of its ingredients on the list and at most three more
 *   to buy (staples like salt don't count); the reason says how many more ("2 more").
 */
import type { LibraryRecipe } from '../../types/library'
import { catalogue, library } from '../library/recipeLibrary'
import type { Kind, Tile } from './rank'
import { ALL_TILES } from './rank'

export interface Suggestion {
  readonly tile: Tile
  /** what the short reason is made from */
  readonly reason:
    | { readonly type: 'with'; readonly name: string }
    | { readonly type: 'more'; readonly count: number }
    /** padding when nothing goes with the list yet: a usual of theirs, or a recipe to try */
    | { readonly type: 'usual' }
    | { readonly type: 'try' }
}

const STAPLES = new Set(
  catalogue.filter((i) => i.staple === true).map((i) => i.id)
)
const byId = new Map(ALL_TILES.map((tile) => [tile.id, tile]))
const isTile = (tile: Tile | undefined): tile is Tile => tile !== undefined

const needed = (recipe: LibraryRecipe): string[] => [
  ...new Set(
    recipe.ingredients
      .map((i) => i.ingredientId)
      .filter((id) => !STAPLES.has(id))
  )
]

/** Ingredients that share recipes with the ones on the list, best first. */
export const goesWith = (
  onList: ReadonlySet<string>,
  counts: ReadonlyMap<string, number>,
  recipes: readonly LibraryRecipe[] = library
): Suggestion[] => {
  const scores = new Map<
    string,
    { score: number; best: string; bestCount: number }
  >()
  const pair = new Map<string, { a: string; b: string; together: number }>()
  recipes.forEach((recipe) => {
    const ids = needed(recipe)
    ids
      .filter((a) => onList.has(a))
      .forEach((a) =>
        ids
          .filter((b) => !onList.has(b))
          .forEach((b) => {
            const key = `${a}|${b}`
            pair.set(key, {
              a,
              b,
              together: (pair.get(key)?.together ?? 0) + 1
            })
          })
      )
  })
  pair.forEach(({ a, b, together }) => {
    const was = scores.get(b) ?? { score: 0, best: a, bestCount: 0 }
    scores.set(b, {
      score: was.score + together,
      best: together > was.bestCount ? a : was.best,
      bestCount: Math.max(together, was.bestCount)
    })
  })
  return [...scores.entries()]
    .map(([id, { score, best }]) => ({
      id,
      best,
      score: score * (1 + 0.5 * (counts.get(id) ?? 0))
    }))
    .sort((x, y) => y.score - x.score || x.id.localeCompare(y.id))
    .flatMap(({ id, best }) =>
      [byId.get(id)].filter(isTile).map(
        (tile): Suggestion => ({
          tile,
          reason: { type: 'with', name: best.replaceAll('-', ' ') }
        })
      )
    )
}

/** Recipes with something on the list and at most three more to buy, fewest missing first. */
export const nearlyThere = (
  onList: ReadonlySet<string>,
  picked: ReadonlySet<string>,
  recipes: readonly LibraryRecipe[] = library
): Suggestion[] =>
  recipes
    .filter((recipe) => !picked.has(recipe.id))
    .map((recipe) => {
      const ids = needed(recipe)
      const have = ids.filter((id) => onList.has(id)).length
      return { recipe, have, missing: ids.length - have }
    })
    .filter(({ have, missing }) => have > 0 && missing <= 3)
    .sort(
      (a, b) =>
        a.missing - b.missing ||
        b.have - a.have ||
        a.recipe.name.localeCompare(b.recipe.name)
    )
    .flatMap(({ recipe, missing }) =>
      [byId.get(recipe.id)].filter(isTile).map(
        (tile): Suggestion => ({
          tile,
          reason: { type: 'more', count: missing }
        })
      )
    )

/** The strip's fill: alternating ingredients and recipes for Both, `slots` at most. */
export const suggestionsFor = (
  kind: Kind,
  onList: ReadonlySet<string>,
  picked: ReadonlySet<string>,
  counts: ReadonlyMap<string, number>,
  slots: number
): Suggestion[] => {
  const ingredients = kind === 'recipes' ? [] : goesWith(onList, counts)
  const recipes = kind === 'ingredients' ? [] : nearlyThere(onList, picked)
  const mixed: Suggestion[] = []
  for (
    let i = 0;
    mixed.length < slots && (i < ingredients.length || i < recipes.length);
    i += 1
  ) {
    const a = ingredients[i]
    const b = recipes[i]
    if (a !== undefined) mixed.push(a)
    if (b !== undefined && mixed.length < slots) mixed.push(b)
  }
  return mixed
}
