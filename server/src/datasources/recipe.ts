/*
 * Recipes in Postgres: `recipes` plus one `recipe_ingredients` row per line, each line
 * pointing at a shared catalogue `ingredients` row (and its category). `_id` is the
 * recipe's public id; a line's `_id` is `<recipe public id>:<position>`.
 */
import { z } from 'zod'
import { customisationSchema } from '../schemas/customisation'
import { NotFoundError } from '../errors'
import type { SqlClient } from '../postgres/sql'
import type { CustomisationDoc, RecipePopulated } from '../schemas/types'
import { SqlStore } from './sqlStore'

const recipeRow = z.object({
  id: z.coerce.number(),
  public_id: z.string(),
  name: z.string(),
  portions: z.number(),
  picture_url: z.string(),
  library_id: z.string().nullable(),
  instructions: z.string().nullable(),
  customisations: z.array(customisationSchema)
})

const lineRow = z.object({
  recipe_id: z.coerce.number(),
  position: z.number(),
  name: z.string(),
  quantity: z.number(),
  measure: z.string(),
  key: z.string(),
  category_id: z.string().nullable(),
  category_name: z.string().nullable()
})

/** A line's catalogue id: its ingredient key unless that is a name key (#182). */
export const catalogueIdOf = (key: string): string | null =>
  key.startsWith('name:') ? null : key

/** Lines whose ingredient lost its category show it as Generic. */
const GENERIC = { _id: 'generic', name: 'Generic' }

const RECIPE_COLUMNS = `r.id, r.public_id, r.name, r.portions::float8 as portions,
  r.picture_url, r.library_id, r.instructions, r.customisations`

/** The recipes `from` (a from/where/order by clause on `recipes r`), with their lines. */
export const selectRecipes = async (
  sql: SqlClient,
  from: string,
  params: ReadonlyArray<unknown>
): Promise<RecipePopulated[]> => {
  const recipes = (
    await sql.query(`select ${RECIPE_COLUMNS} ${from}`, params)
  ).map((row) => recipeRow.parse(row))
  if (recipes.length === 0) return []
  const lines = (
    await sql.query(
      `select ri.recipe_id, ri.position, coalesce(ri.name, i.name) as name,
         ri.quantity::float8 as quantity, ri.measure, i.key,
         c.id::text as category_id, c.name as category_name
       from recipe_ingredients ri
       join ingredients i on i.id = ri.ingredient_id
       left join categories c on c.id = coalesce(ri.category_id, i.category_id)
       where ri.recipe_id = any($1::bigint[])
       order by ri.recipe_id, ri.position`,
      [recipes.map(({ id }) => id)]
    )
  ).map((row) => lineRow.parse(row))
  return recipes.map((recipe) => ({
    _id: recipe.public_id,
    name: recipe.name,
    portions: recipe.portions,
    picture_url: recipe.picture_url,
    customisations: recipe.customisations,
    ...(recipe.library_id === null ? {} : { libraryId: recipe.library_id }),
    ...(recipe.instructions === null
      ? {}
      : { instructions: recipe.instructions }),
    ingredients: lines
      .filter((line) => line.recipe_id === recipe.id)
      .map((line) => ({
        _id: `${recipe.public_id}:${line.position}`,
        name: line.name,
        quantity: line.quantity,
        measure: line.measure,
        category:
          line.category_id === null || line.category_name === null
            ? GENERIC
            : { _id: line.category_id, name: line.category_name },
        ingredientId: catalogueIdOf(line.key)
      }))
  }))
}

/** A line to save: a catalogue ingredient (from IngredientApi) as the user named it. */
export interface RecipeLine {
  readonly _id: string
  readonly name: string
  readonly quantity: number
  readonly measure: string
  readonly category: { readonly _id: string }
}

export class RecipeApi extends SqlStore {
  public createRecipe = ({
    name,
    portions,
    instructions,
    ingredients,
    picture_url,
    libraryId,
    customisations = []
  }: {
    name: string
    portions: number
    instructions?: string | null | undefined
    ingredients: ReadonlyArray<RecipeLine>
    picture_url: string
    libraryId?: string | null | undefined
    customisations?: CustomisationDoc[]
  }): Promise<RecipePopulated> =>
    this.sql.transaction(async (tx) => {
      const [row] = await tx.query(
        `insert into recipes
           (name, portions, picture_url, library_id, instructions, customisations)
         values ($1, $2, $3, $4, $5, $6::jsonb)
         returning id, public_id`,
        [
          name,
          portions,
          picture_url,
          libraryId ?? null,
          instructions ?? null,
          JSON.stringify(customisations)
        ]
      )
      const { id, public_id } = z
        .object({ id: z.coerce.number(), public_id: z.string() })
        .parse(row)
      for (const [position, line] of ingredients.entries()) {
        await tx.query(
          `insert into recipe_ingredients
             (recipe_id, position, ingredient_id, quantity, measure, name,
              category_id)
           values ($1, $2, $3, $4, $5, $6, $7)`,
          [
            id,
            position,
            line._id,
            line.quantity,
            line.measure,
            line.name,
            line.category._id
          ]
        )
      }
      const [recipe] = await selectRecipes(
        tx,
        'from recipes r where r.public_id = $1',
        [public_id]
      )
      if (recipe === undefined) throw new NotFoundError('Recipe not saved')
      return recipe
    })

  public getRecipe = async (publicId: string) =>
    (
      await selectRecipes(this.sql, 'from recipes r where r.public_id = $1', [
        publicId
      ])
    )[0] ?? null

  /**
   * Deletes a recipe the user saved (its lines and saves go with it). Another user's
   * recipe is not found, so nobody can delete someone else's.
   */
  public deleteRecipe = async ({
    recipeId,
    userId
  }: {
    recipeId: string
    userId: string
  }): Promise<void> => {
    const deleted = await this.sql.query(
      `delete from recipes r
       using saved_recipes s, users u
       where r.public_id = $1 and s.recipe_id = r.id
         and s.user_id = u.id and u.public_id = $2
       returning r.id`,
      [recipeId, userId]
    )
    if (deleted.length === 0) throw new NotFoundError('Recipe does not exist!')
  }
}
