/*
 * The Postgres pool, from DATABASE_URL (no default: the server never guesses a
 * database). Postgres is the only database; Mongo was retired (docs/POSTGRES_MIGRATION.md).
 */
import { Pool } from 'pg'
import { fromPool, type SqlClient } from '../src/postgres/sql'
import { assertMigrated, setDb } from '../src/postgres/db'

type Env = Readonly<Record<string, string | undefined>>

export const databaseUrlOf = (env: Env): string => {
  const url = env['DATABASE_URL']
  if (!url || !/^postgres(ql)?:\/\//.test(url))
    throw new Error('DATABASE_URL must be set to a postgres:// URL')
  return url
}

/** Connects, checks the schema is migrated, and makes it the API's database. */
export const connect = async (env: Env = process.env): Promise<SqlClient> => {
  const pool = new Pool({ connectionString: databaseUrlOf(env) })
  const db = fromPool(pool)
  await assertMigrated(db)
  setDb(db)
  return db
}
