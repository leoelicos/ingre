import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/* The shipped recipe library (#103): counts and A to Z checks follow the data, not a fixed size. */
const recipes = (
  JSON.parse(
    readFileSync(join(process.cwd(), '../client/src/data/recipes.json'), 'utf8')
  ) as { recipes: { name: string }[] }
).recipes

export const RECIPE_COUNT = recipes.length

/** The first recipe name A to Z, as Explore browses with no history. */
export const FIRST_A_TO_Z = recipes
  .map(({ name }) => name)
  .sort((a, b) => a.localeCompare(b))[0]
