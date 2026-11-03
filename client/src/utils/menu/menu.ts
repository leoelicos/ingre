/*
 * Composed menus (#219): recipes that work together. A starter that suits the main, a dessert
 * that suits the main, and a wine for each course. The rules are plain and in this file; the
 * recipes' courses, weights and wines are data (data/menus.json).
 */
import menuData from '../../data/menus.json'
import type { LibraryRecipe } from '../../types/library'
import { library } from '../library/recipeLibrary'

export const COURSES = ['starter', 'main', 'dessert'] as const
export type Course = (typeof COURSES)[number]

export const WEIGHTS = ['light', 'medium', 'rich'] as const
export type Weight = (typeof WEIGHTS)[number]

export interface Wine {
  readonly name: string
  readonly why: string
}

/** What the menu needs to know about a recipe. */
export interface MenuInfo {
  readonly course: Course
  readonly weight: Weight
  /** main proteins, so a menu does not repeat one ("pork", "prawn") */
  readonly proteins: readonly string[]
  readonly wine: Wine | null
}

/** A recipe nobody has described yet: a medium main with no wine. */
export const UNDESCRIBED: MenuInfo = {
  course: 'main',
  weight: 'medium',
  proteins: [],
  wine: null
}

export type MenuTable = ReadonlyMap<string, MenuInfo>

const failMenus = (message: string): never => {
  throw new Error(`menus: ${message}`)
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const oneOf = <T extends string>(
  options: readonly T[],
  v: unknown,
  path: string
): T =>
  options.find((option) => option === v) ??
  failMenus(`${path} must be one of ${options.join(', ')}`)

const text = (v: unknown, path: string): string =>
  typeof v === 'string' && v.trim() !== ''
    ? v
    : failMenus(`${path} must be text`)

const parseWine = (v: unknown, path: string): Wine => {
  if (!isRecord(v)) return failMenus(`${path} must be an object`)
  return {
    name: text(v['name'], `${path}.name`),
    why: text(v['why'], `${path}.why`)
  }
}

const parseProteins = (v: unknown, path: string): string[] =>
  Array.isArray(v)
    ? v.map((protein, i) => text(protein, `${path}[${i}]`))
    : failMenus(`${path} must be a list`)

const parseInfo = (v: unknown, id: string): MenuInfo => {
  if (!isRecord(v)) return failMenus(`${id} must be an object`)
  return {
    course: oneOf(COURSES, v['course'], `${id}.course`),
    weight: oneOf(WEIGHTS, v['weight'], `${id}.weight`),
    proteins: parseProteins(v['proteins'], `${id}.proteins`),
    wine: parseWine(v['wine'], `${id}.wine`)
  }
}

/** Validates the bundled menu file, so a typo fails loudly and types need no casts. */
export const parseMenus = (data: unknown): MenuTable => {
  if (!isRecord(data)) return failMenus('expected an object')
  const recipes = data['recipes']
  if (!isRecord(recipes)) return failMenus('expected a "recipes" object')
  return new Map(
    Object.entries(recipes).map(([id, v]) => [id, parseInfo(v, id)])
  )
}

export const MENUS: MenuTable = parseMenus(menuData)

export const infoOf = (recipeId: string, table: MenuTable = MENUS): MenuInfo =>
  table.get(recipeId) ?? UNDESCRIBED

const rank = (weight: Weight): number => WEIGHTS.indexOf(weight)

/** Why two recipes do not suit each other on one menu, or null when they do. */
export type Clash = 'protein' | 'heavy'

export const sharedProtein = (a: MenuInfo, b: MenuInfo): boolean =>
  a.proteins.some((protein) => b.proteins.includes(protein))

/** A starter suits a main when it is no heavier than it (never rich) and repeats no protein. */
export const starterClash = (starter: MenuInfo, main: MenuInfo): Clash | null =>
  sharedProtein(starter, main)
    ? 'protein'
    : starter.weight === 'rich' || rank(starter.weight) > rank(main.weight)
    ? 'heavy'
    : null

/** A dessert suits a main when their weights add up to no more than rich: rich then light. */
export const dessertClash = (dessert: MenuInfo, main: MenuInfo): Clash | null =>
  rank(dessert.weight) + rank(main.weight) > rank('rich') ? 'heavy' : null

/** The clash between a recipe on the menu and a main, by the recipe's course. */
export const clashWith = (
  course: Course,
  a: MenuInfo,
  main: MenuInfo
): Clash | null =>
  course === 'starter'
    ? starterClash(a, main)
    : course === 'dessert'
    ? dessertClash(a, main)
    : null

/** How many suggestions each empty course shows. */
export const MAX_PER_COURSE = 3

const suits = (
  info: MenuInfo,
  course: Course,
  mains: readonly MenuInfo[]
): boolean =>
  info.course === course &&
  mains.every((main) => clashWith(course, info, main) === null)

/** Recipes of a course that suit every main, best (lightest) first, then by name. */
export const suggestionsFor = (
  course: Course,
  mains: readonly MenuInfo[],
  recipes: readonly LibraryRecipe[],
  table: MenuTable = MENUS
): LibraryRecipe[] =>
  recipes
    .filter((recipe) => suits(infoOf(recipe.id, table), course, mains))
    .sort(
      (a, b) =>
        rank(infoOf(a.id, table).weight) - rank(infoOf(b.id, table).weight) ||
        a.name.localeCompare(b.name)
    )
    .slice(0, MAX_PER_COURSE)

/** One course of the menu: what is picked, or what would suit. */
export interface CourseRow {
  readonly course: Course
  readonly picked: readonly LibraryRecipe[]
  /** only when nothing is picked for the course */
  readonly suggestions: readonly LibraryRecipe[]
}

export interface Menu {
  /** false until a main is picked: there is nothing to build a menu around */
  readonly anchored: boolean
  readonly rows: readonly CourseRow[]
}

/** The menu for the recipes on the list, in course order. */
export const composeMenu = (
  picked: readonly LibraryRecipe[],
  recipes: readonly LibraryRecipe[] = library,
  table: MenuTable = MENUS
): Menu => {
  const mains = picked.filter((r) => infoOf(r.id, table).course === 'main')
  const mainInfos = mains.map((r) => infoOf(r.id, table))
  return {
    anchored: mains.length > 0,
    rows: COURSES.map((course) => {
      const here = picked.filter((r) => infoOf(r.id, table).course === course)
      return {
        course,
        picked: here,
        suggestions:
          here.length > 0 || course === 'main' || mains.length === 0
            ? []
            : suggestionsFor(course, mainInfos, recipes, table)
      }
    })
  }
}

/** The first main that a picked starter or dessert clashes with, and why; null when it suits. */
export const clashOf = (
  recipe: LibraryRecipe,
  mains: readonly LibraryRecipe[],
  table: MenuTable = MENUS
): { main: LibraryRecipe; clash: Clash } | null => {
  const info = infoOf(recipe.id, table)
  const found = mains.flatMap((main) => {
    const clash = clashWith(info.course, info, infoOf(main.id, table))
    return clash === null ? [] : [{ main, clash }]
  })
  return found[0] ?? null
}
