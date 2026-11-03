/* #230: recipes as schema.org Recipe JSON-LD, the format sites and other apps share. */
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import { formatNumber } from '../../i18n'
import { asRecord } from '../storage/asRecord'
import { parseIngredientLine } from './ingredientLine'
import { IMPORTED_PREFIX } from './storage'

const CONTEXT = 'https://schema.org'

const nameOfItem = (
  id: string,
  catalogue: readonly LibraryIngredient[]
): string => catalogue.find((item) => item.id === id)?.name ?? id

/** "200 g red lentils", "2 brown onions": the quantity, a unit unless whole items, the name. */
export const ingredientLine = (
  quantity: number,
  measure: string,
  name: string
): string =>
  [formatNumber(quantity), measure === 'whole' ? '' : measure, name]
    .filter((part) => part !== '')
    .join(' ')

/** One recipe as a schema.org Recipe. */
export const toJsonLd = (
  recipe: LibraryRecipe,
  catalogue: readonly LibraryIngredient[]
) => ({
  '@context': CONTEXT,
  '@type': 'Recipe',
  name: recipe.name,
  recipeYield: `${recipe.portions} servings`,
  recipeIngredient: recipe.ingredients.map((entry) =>
    ingredientLine(
      entry.quantity,
      entry.measure,
      nameOfItem(entry.ingredientId, catalogue)
    )
  ),
  recipeInstructions: recipe.method.map((text) => ({
    '@type': 'HowToStep',
    text
  }))
})

/** The JSON text of a file holding these recipes. */
export const exportRecipes = (
  recipes: readonly LibraryRecipe[],
  catalogue: readonly LibraryIngredient[]
): string =>
  JSON.stringify(
    recipes.map((recipe) => toJsonLd(recipe, catalogue)),
    null,
    2
  )

/** An imported recipe and the ingredient lines the catalogue had nothing for. */
export interface Imported {
  readonly recipe: LibraryRecipe
  readonly unmatched: readonly string[]
}

export type ImportResult =
  | {
      readonly ok: true
      readonly recipes: readonly Imported[]
      readonly skipped: readonly string[]
    }
  | { readonly ok: false; readonly reason: 'notJson' | 'noRecipe' }

const isRecipeType = (type: unknown): boolean =>
  type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))

/** Recipe nodes in a JSON-LD document: a node, a list of nodes, or an `@graph`. */
export const recipeNodes = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) return value.flatMap(recipeNodes)
  const node = asRecord(value)
  if (node === null) return []
  return isRecipeType(node['@type'])
    ? [node]
    : recipeNodes(node['@graph'] ?? [])
}

const strings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : Array.isArray(value)
    ? value.flatMap(strings)
    : []

/** Steps from a string, a list of steps, a HowToStep object or a HowToSection group. */
export const stepsOf = (value: unknown): string[] => {
  if (typeof value === 'string')
    return value.trim() === '' ? [] : [value.trim()]
  if (Array.isArray(value)) return value.flatMap(stepsOf)
  const node = asRecord(value)
  return node === null
    ? []
    : [...stepsOf(node['text']), ...stepsOf(node['itemListElement'])]
}

/** "4", "4 servings", ["4", "4 servings"], 4 -> 4; two when nothing says. */
export const portionsOf = (value: unknown): number => {
  const match = /\d+/.exec(strings(value)[0] ?? String(value))
  const portions = Number(match?.[0])
  return portions > 0 ? portions : 2
}

const slug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const lineAndUnmatched = (
  lines: readonly string[],
  catalogue: readonly LibraryIngredient[]
) => {
  const parsed = lines.map((line) => ({
    line,
    entry: parseIngredientLine(line, catalogue)
  }))
  return {
    ingredients: parsed.flatMap(({ entry }) => (entry === null ? [] : [entry])),
    unmatched: parsed
      .filter(({ entry }) => entry === null)
      .map(({ line }) => line)
  }
}

/** One recipe node as a library recipe, or null without a name or any ingredient we know. */
export const importNode = (
  node: Record<string, unknown>,
  catalogue: readonly LibraryIngredient[]
): Imported | null => {
  const name = strings(node['name'])[0]?.trim() ?? ''
  const { ingredients, unmatched } = lineAndUnmatched(
    strings(node['recipeIngredient']),
    catalogue
  )
  return name === '' || ingredients.length === 0
    ? null
    : {
        recipe: {
          id: `${IMPORTED_PREFIX}${slug(name)}`,
          name,
          portions: portionsOf(node['recipeYield']),
          ingredients,
          method: stepsOf(node['recipeInstructions'])
        },
        unmatched
      }
}

const nodeName = (node: Record<string, unknown>): string =>
  strings(node['name'])[0] ?? 'A recipe without a name'

/** The parsed JSON in a box, or null when the text is not JSON. */
const parseJson = (text: string): { readonly value: unknown } | null => {
  try {
    return { value: JSON.parse(text) }
  } catch {
    return null
  }
}

/** Recipes from the text of a JSON or JSON-LD file; says why when there is nothing to import. */
export const importRecipes = (
  text: string,
  catalogue: readonly LibraryIngredient[]
): ImportResult => {
  const json = parseJson(text)
  if (json === null) return { ok: false, reason: 'notJson' }
  const nodes = recipeNodes(json.value)
  if (nodes.length === 0) return { ok: false, reason: 'noRecipe' }
  const imported = nodes.map((node) => ({
    node,
    result: importNode(node, catalogue)
  }))
  return {
    ok: true,
    recipes: imported.flatMap(({ result }) =>
      result === null ? [] : [result]
    ),
    skipped: imported
      .filter(({ result }) => result === null)
      .map(({ node }) => nodeName(node))
  }
}
