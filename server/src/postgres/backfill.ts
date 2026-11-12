import type {
  LegacyCategory,
  LegacyData,
  LegacyIngredient,
  LegacyRecipe,
  LegacyUser
} from './legacy'
import { onlyRow, readInt, requireFound, type SqlClient } from './sql'

export type Table =
  | 'categories'
  | 'ingredients'
  | 'recipes'
  | 'recipe_ingredients'
  | 'users'
  | 'saved_recipes'

export type Counts = Readonly<Record<Table, number>>

export interface BackfillReport {
  readonly counts: Counts
  /** References to Mongo documents that no longer exist, not copied. */
  readonly skipped: { readonly lines: number; readonly saved: number }
}

const TABLES: ReadonlyArray<Table> = [
  'categories',
  'ingredients',
  'recipes',
  'recipe_ingredients',
  'users',
  'saved_recipes'
]

/** Catalogue id when there is one, else the lower-cased name. */
export const ingredientKey = ({
  ingredientId,
  name
}: Pick<LegacyIngredient, 'ingredientId' | 'name'>) =>
  ingredientId ?? `name:${name.trim().toLowerCase()}`

const distinct = <T>(items: ReadonlyArray<T>) => Array.from(new Set(items))

const lookup = <V>(entries: ReadonlyArray<readonly [string, V]>) =>
  new Map(entries)

const ingredientsByMongoId = (data: LegacyData) =>
  lookup(data.ingredients.map((i) => [i.mongoId, i] as const))

const recipeIds = (data: LegacyData) =>
  new Set(data.recipes.map(({ mongoId }) => mongoId))

/** Recipe lines whose ingredient document still exists. */
const liveLines = (data: LegacyData, recipe: LegacyRecipe) => {
  const known = ingredientsByMongoId(data)
  return recipe.ingredientMongoIds.flatMap((id) => {
    const found = known.get(id)
    return found ? [found] : []
  })
}

/** Saved recipes that still exist, first occurrence only, in saved order. */
const liveSaved = (data: LegacyData, user: LegacyUser) => {
  const known = recipeIds(data)
  return distinct(user.savedRecipeMongoIds).filter((id) => known.has(id))
}

export const expectedCounts = (data: LegacyData): Counts => ({
  categories: distinct(data.categories.map(({ name }) => name)).length,
  ingredients: distinct(data.ingredients.map(ingredientKey)).length,
  recipes: data.recipes.length,
  recipe_ingredients: data.recipes.reduce(
    (sum, recipe) => sum + liveLines(data, recipe).length,
    0
  ),
  users: data.users.length,
  saved_recipes: data.users.reduce(
    (sum, user) => sum + liveSaved(data, user).length,
    0
  )
})

const firstId = async (db: SqlClient, text: string, params: unknown[]) => {
  return readInt(onlyRow(await db.query(text, params)), 'id')
}

const upsertCategory = (db: SqlClient, { mongoId, name }: LegacyCategory) =>
  firstId(
    db,
    `insert into categories (mongo_id, name) values ($1, $2)
     on conflict (name) do update
       set mongo_id = coalesce(categories.mongo_id, excluded.mongo_id)
     returning id`,
    [mongoId, name]
  )

const upsertIngredient = (
  db: SqlClient,
  { name }: LegacyIngredient,
  key: string,
  categoryId: number | null
) =>
  firstId(
    db,
    `insert into ingredients (key, name, category_id) values ($1, $2, $3)
     on conflict (key) do update
       set name = excluded.name, category_id = excluded.category_id
     returning id`,
    [key, name, categoryId]
  )

const upsertRecipe = (db: SqlClient, recipe: LegacyRecipe) =>
  firstId(
    db,
    `insert into recipes
       (mongo_id, name, portions, picture_url, library_id, instructions,
        customisations, created_at)
     values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
     on conflict (mongo_id) do update set
       name = excluded.name, portions = excluded.portions,
       picture_url = excluded.picture_url, library_id = excluded.library_id,
       instructions = excluded.instructions,
       customisations = excluded.customisations
     returning id`,
    [
      recipe.mongoId,
      recipe.name,
      recipe.portions,
      recipe.pictureUrl,
      recipe.libraryId,
      recipe.instructions,
      JSON.stringify(recipe.customisations),
      recipe.createdAt
    ]
  )

const upsertUser = (db: SqlClient, user: LegacyUser) =>
  firstId(
    db,
    `insert into users
       (mongo_id, first_name, last_name, email, password_hash, firebase_uid,
        pro, created_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (mongo_id) do update set
       first_name = excluded.first_name, last_name = excluded.last_name,
       email = excluded.email, password_hash = excluded.password_hash,
       firebase_uid = excluded.firebase_uid, pro = excluded.pro
     returning id`,
    [
      user.mongoId,
      user.firstName,
      user.lastName,
      user.email,
      user.passwordHash,
      user.firebaseUid,
      user.pro,
      user.createdAt
    ]
  )

const writeCategories = async (db: SqlClient, data: LegacyData) => {
  const ids = new Map<string, number>()
  for (const category of data.categories) {
    ids.set(category.mongoId, await upsertCategory(db, category))
  }
  return ids
}

const writeIngredients = async (
  db: SqlClient,
  data: LegacyData,
  categoryIds: ReadonlyMap<string, number>
) => {
  const ids = new Map<string, number>()
  for (const ingredient of data.ingredients) {
    const key = ingredientKey(ingredient)
    if (!ids.has(key)) {
      const categoryId = categoryIds.get(ingredient.categoryMongoId) ?? null
      ids.set(key, await upsertIngredient(db, ingredient, key, categoryId))
    }
  }
  return ids
}

const writeLine = (
  db: SqlClient,
  recipeId: number,
  position: number,
  ingredientId: number,
  line: LegacyIngredient
) =>
  db.query(
    `insert into recipe_ingredients
       (recipe_id, position, ingredient_id, quantity, measure, text)
     values ($1, $2, $3, $4, $5, $6)`,
    [recipeId, position, ingredientId, line.quantity, line.measure, line.text]
  )

/** Replaces a recipe's lines, so an edited recipe re-syncs cleanly. */
const writeLines = async (
  db: SqlClient,
  data: LegacyData,
  recipe: LegacyRecipe,
  recipeId: number,
  ingredientIds: ReadonlyMap<string, number>
) => {
  await db.query('delete from recipe_ingredients where recipe_id = $1', [
    recipeId
  ])
  const lines = liveLines(data, recipe)
  for (const [position, line] of lines.entries()) {
    const ingredientId = requireFound(ingredientIds, ingredientKey(line))
    await writeLine(db, recipeId, position, ingredientId, line)
  }
  return recipe.ingredientMongoIds.length - lines.length
}

const writeRecipes = async (
  db: SqlClient,
  data: LegacyData,
  ingredientIds: ReadonlyMap<string, number>
) => {
  const ids = new Map<string, number>()
  let skipped = 0
  for (const recipe of data.recipes) {
    const id = await upsertRecipe(db, recipe)
    ids.set(recipe.mongoId, id)
    skipped += await writeLines(db, data, recipe, id, ingredientIds)
  }
  return { ids, skipped }
}

const writeSaved = async (
  db: SqlClient,
  data: LegacyData,
  user: LegacyUser,
  userId: number,
  recipeIdsByMongo: ReadonlyMap<string, number>
) => {
  await db.query('delete from saved_recipes where user_id = $1', [userId])
  const live = liveSaved(data, user)
  for (const [position, mongoId] of live.entries()) {
    await db.query(
      `insert into saved_recipes (user_id, recipe_id, position)
       values ($1, $2, $3)`,
      [userId, requireFound(recipeIdsByMongo, mongoId), position]
    )
  }
  return distinct(user.savedRecipeMongoIds).length - live.length
}

const writeUsers = async (
  db: SqlClient,
  data: LegacyData,
  recipeIdsByMongo: ReadonlyMap<string, number>
) => {
  let skipped = 0
  for (const user of data.users) {
    const userId = await upsertUser(db, user)
    skipped += await writeSaved(db, data, user, userId, recipeIdsByMongo)
  }
  return skipped
}

/**
 * Copies Mongo data into Postgres in one transaction. Upserts on the Mongo
 * id, so it is safe to run again. Writes only to the Postgres client given.
 */
export const backfill = (
  db: SqlClient,
  data: LegacyData
): Promise<BackfillReport> =>
  db.transaction(async (tx) => {
    const categoryIds = await writeCategories(tx, data)
    const ingredientIds = await writeIngredients(tx, data, categoryIds)
    const recipes = await writeRecipes(tx, data, ingredientIds)
    const saved = await writeUsers(tx, data, recipes.ids)
    return {
      counts: expectedCounts(data),
      skipped: { lines: recipes.skipped, saved }
    }
  })

const countRows = async (db: SqlClient, table: Table) => {
  const rows = await db.query(`select count(*) as n from ${table}`)
  return readInt(onlyRow(rows), 'n')
}

/** One message per table whose row count differs from what Mongo implies. */
export const verifyCounts = async (
  db: SqlClient,
  data: LegacyData
): Promise<ReadonlyArray<string>> => {
  const expected = expectedCounts(data)
  const messages: string[] = []
  for (const table of TABLES) {
    const found = await countRows(db, table)
    if (found !== expected[table]) {
      messages.push(`${table}: expected ${expected[table]}, found ${found}`)
    }
  }
  return messages
}
