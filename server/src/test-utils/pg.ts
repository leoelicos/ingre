import { PGlite } from '@electric-sql/pglite'
import { fromPglite, type SqlClient } from '../postgres/sql'
import { listMigrations, migrate } from '../postgres/migrate'
import { setDb } from '../postgres/db'
import { afterAll, beforeAll, beforeEach } from '@jest/globals'

/** An in-process Postgres for tests: no server, no network, no real data. */
export const createTestDb = () => {
  const pglite = new PGlite()
  const db: SqlClient = fromPglite(pglite)
  return { db, close: () => pglite.close() }
}

export const createMigratedTestDb = async () => {
  const test = createTestDb()
  await migrate(test.db, listMigrations())
  return test
}

const TABLES = [
  'saved_recipes',
  'recipe_ingredients',
  'tickets',
  'user_preferences',
  'recipes',
  'ingredients',
  'categories',
  'users',
  'webhook_events'
]

/**
 * A migrated PGlite for one test file, set as the API's database (src/postgres/db.ts)
 * and emptied before each test. Call at the top of a describe or file.
 */
export const useTestDb = () => {
  let test: Awaited<ReturnType<typeof createMigratedTestDb>> | null = null
  const close = async () => {
    setDb(null)
    await test?.close()
  }
  beforeAll(async () => {
    test = await createMigratedTestDb()
    setDb(test.db)
  })
  beforeEach(async () => {
    await sql().exec(`truncate ${TABLES.join(', ')} restart identity cascade`)
  })
  afterAll(close)
  const sql = (): SqlClient => {
    if (test === null) throw new Error('useTestDb: the database is not open')
    return test.db
  }
  return sql
}
