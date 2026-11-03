import { PGlite } from '@electric-sql/pglite'
import { fromPglite, type SqlClient } from '../postgres/sql'
import { listMigrations, migrate } from '../postgres/migrate'

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
