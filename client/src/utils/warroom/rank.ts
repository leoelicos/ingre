/*
 * The War room wall (t27u–t34u): every ingredient and recipe as a tile, ordered by what this
 * person adds, then by how common it is, and searched from two letters ("ba" -> Banana).
 */
import Fuse from 'fuse.js'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import { catalogue, library, sectionColours } from '../library/recipeLibrary'
import { normaliseTerm } from '../library/searchTerms'
import type { ShopSection } from '../shopping/sections'
import { AISLES, placeInShop } from '../shopping/sections'
import type { HistoryEntry } from './history'

export type Kind = 'both' | 'ingredients' | 'recipes'
export const KINDS: readonly Kind[] = ['both', 'ingredients', 'recipes']

export type Tile =
  | {
      readonly kind: 'ingredient'
      readonly id: string
      readonly name: string
      readonly item: LibraryIngredient
      readonly section: ShopSection
      readonly tone: string
    }
  | {
      readonly kind: 'recipe'
      readonly id: string
      readonly name: string
      readonly recipe: LibraryRecipe
      readonly tone: string
    }

/**
 * Lines a household buys most weeks whatever it cooks, commonest first (rough, from Australian
 * supermarket best-seller lists; bananas are the top seller). Recipes alone can't say milk
 * and bananas go in nearly every trolley.
 */
export const EVERYDAY_ORDER: readonly string[] = [
  'banana',
  'full-cream-milk',
  'egg',
  'white-bread',
  'apple',
  'butter',
  'onion',
  'potato',
  'tomato',
  'carrot',
  'cheddar',
  'chicken-breast',
  'beef-mince',
  'garlic',
  'avocado',
  'broccoli',
  'lemon',
  'mandarin',
  'strawberries',
  'greek-yoghurt',
  'cucumber',
  'coffee',
  'tea-bags',
  'wholemeal-bread',
  'orange',
  'bacon',
  'sliced-ham',
  'salad-mix',
  'pasta',
  'spaghetti',
  'jasmine-rice',
  'light-milk',
  'blueberries',
  'zucchini',
  'mushrooms',
  'capsicum',
  'baby-spinach'
]
export const EVERYDAY: ReadonlySet<string> = new Set(EVERYDAY_ORDER)

/** How many catalogue recipes use each ingredient. */
export const recipeUses = (
  recipes: readonly LibraryRecipe[] = library
): Map<string, number> => {
  const uses = new Map<string, number>()
  recipes.forEach((recipe) =>
    new Set(recipe.ingredients.map((i) => i.ingredientId)).forEach((id) =>
      uses.set(id, (uses.get(id) ?? 0) + 1)
    )
  )
  return uses
}

const USES = recipeUses()

/**
 * Commonness, how likely anyone buys it this week (t32u), highest first:
 * - an everyday line scores 30 for the top seller down to about 12 for the last of the list,
 *   so best-sellers lead (banana, then milk, eggs, bread);
 * - plus recipes in the catalogue that use it, capped at 10, so cooking lines come next;
 * - minus 5 for a pantry staple (salt, oil) that is rarely on a weekly list.
 * One past add (PER_ADD) outweighs all of it: what this person buys always comes first.
 */
export const commonness = (item: LibraryIngredient): number => {
  const rank = EVERYDAY_ORDER.indexOf(item.id)
  return (
    (rank < 0 ? 0 : 30 - rank / 2) +
    Math.min(USES.get(item.id) ?? 0, 10) -
    (item.staple === true ? 5 : 0)
  )
}

const ingredientTile = (item: LibraryIngredient): Tile => {
  const { section } = placeInShop(item.category)
  return {
    kind: 'ingredient',
    id: item.id,
    name: item.name,
    item,
    section,
    tone: sectionColours[section] ?? 'neutral'
  }
}

const recipeTile = (recipe: LibraryRecipe): Tile => ({
  kind: 'recipe',
  id: recipe.id,
  name: recipe.name,
  recipe,
  tone: 'neutral'
})

export const ALL_TILES: readonly Tile[] = [
  ...catalogue.map(ingredientTile),
  ...library.map(recipeTile)
]

/** Times each id (ingredient or recipe) was added, from the history. */
export const countsOf = (
  history: readonly HistoryEntry[]
): Map<string, number> => {
  const counts = new Map<string, number>()
  history.forEach(({ itemId }) =>
    counts.set(itemId, (counts.get(itemId) ?? 0) + 1)
  )
  return counts
}

/** Weight of one past add; above the highest commonness. */
export const PER_ADD = 50

/**
 * A tile's pull: what this person adds comes first (50 per add outweighs any commonness, so
 * last week's shop fills the first screen next visit), a bit more if recent, then commonness.
 */
export const scoreOf = (
  tile: Tile,
  counts: ReadonlyMap<string, number>,
  recent: ReadonlySet<string>
): number =>
  (counts.get(tile.id) ?? 0) * PER_ADD +
  (recent.has(tile.id) ? 4 : 0) +
  (tile.kind === 'ingredient' ? commonness(tile.item) : 2)

export const ofKind = (tiles: readonly Tile[], kind: Kind): Tile[] =>
  tiles.filter(
    (tile) =>
      kind === 'both' ||
      (kind === 'ingredients'
        ? tile.kind === 'ingredient'
        : tile.kind === 'recipe')
  )

const aisleIndex = (tile: Tile): number =>
  tile.kind === 'ingredient'
    ? AISLES.indexOf(tile.item.category)
    : AISLES.length

export interface Ordered {
  /** the likeliest, most first: history, then everyday lines */
  readonly likely: readonly Tile[]
  /** everything else, by aisle (colour bands), commonest first in each */
  readonly rest: readonly Tile[]
}

/** The wall's order: computed when the War room opens (and when a search clears), never mid-tap. */
export const wallOrder = (
  history: readonly HistoryEntry[],
  likelyCount: number,
  tiles: readonly Tile[] = ALL_TILES
): Ordered => {
  const counts = countsOf(history)
  const recent = new Set(history.slice(0, 12).map(({ itemId }) => itemId))
  const byScore = [...tiles]
    .filter((tile) => tile.kind === 'ingredient')
    .sort(
      (a, b) =>
        scoreOf(b, counts, recent) - scoreOf(a, counts, recent) ||
        a.name.localeCompare(b.name)
    )
  const likely = byScore.slice(0, likelyCount)
  const chosen = new Set(likely.map(({ id }) => id))
  const recipes = tiles
    .filter((tile) => tile.kind === 'recipe')
    .sort(
      (a, b) =>
        scoreOf(b, counts, recent) - scoreOf(a, counts, recent) ||
        a.name.localeCompare(b.name)
    )
  const rest = tiles
    .filter((tile) => tile.kind === 'ingredient' && !chosen.has(tile.id))
    .sort(
      (a, b) =>
        aisleIndex(a) - aisleIndex(b) ||
        scoreOf(b, counts, recent) - scoreOf(a, counts, recent) ||
        a.name.localeCompare(b.name)
    )
  return { likely, rest: [...recipes, ...rest] }
}

/** 0 the name starts with it, 1 a word does, 2 it is inside the name, 3 no. */
export const matchTier = (name: string, query: string): number => {
  const text = normaliseTerm(name)
  const raw = name.toLowerCase()
  const q = query.trim().toLowerCase()
  /* singular/plural folding only once there is a word to fold ("es" is not "e") */
  const nq = q.length >= 3 ? normaliseTerm(query) : q
  if (raw.startsWith(q) || text.startsWith(nq)) return 0
  const words = raw.split(/[^\p{L}\p{N}]+/u)
  if (words.some((word) => word.startsWith(q))) return 1
  return raw.includes(q) || text.includes(nq) ? 2 : 3
}

/** Below this many results, typos are forgiven too. */
const FUZZY_BELOW = 4

/**
 * Search from the first letter: name-starts, then word-starts, then inside a name, then typos;
 * ties go to what this person adds most, then commonness. "ba" -> Banana first.
 */
export const searchTiles = (
  query: string,
  history: readonly HistoryEntry[],
  tiles: readonly Tile[] = ALL_TILES
): Tile[] => {
  const q = query.trim()
  if (q === '') return []
  const counts = countsOf(history)
  const recent = new Set(history.slice(0, 12).map(({ itemId }) => itemId))
  const found = tiles
    .map((tile) => ({ tile, tier: matchTier(tile.name, q) }))
    /* two letters: word starts only, so the shortlist fits one screen */
    .filter(({ tier }) => tier < (q.length < 3 ? 2 : 3))
    .sort(
      (a, b) =>
        a.tier - b.tier ||
        scoreOf(b.tile, counts, recent) - scoreOf(a.tile, counts, recent) ||
        a.tile.name.localeCompare(b.tile.name)
    )
    .map(({ tile }) => tile)
  if (found.length >= FUZZY_BELOW || q.length < 3) return found
  const seen = new Set(found.map(({ id }) => id))
  const typos = new Fuse(tiles, {
    keys: ['name'],
    threshold: 0.34,
    ignoreLocation: true
  })
    .search(q)
    .map(({ item }) => item)
    .filter(({ id }) => !seen.has(id))
  return [...found, ...typos]
}
