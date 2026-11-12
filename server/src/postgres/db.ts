/*
 * The API's one Postgres connection (config/connection.ts sets it when the server
 * starts; tests set a PGlite one). Datasources read it when they run a query.
 */
import { listMigrations, type Migration } from './migrate'
import { readString, type SqlClient } from './sql'

let current: SqlClient | null = null

export const setDb = (db: SqlClient | null): void => {
  current = db
}

export const db = (): SqlClient => {
  if (current === null) throw new Error('The database is not connected')
  return current
}

/** Refuses to serve on a schema that is behind: run `npm run pg -- migrate` first. */
export const assertMigrated = async (
  client: SqlClient,
  migrations: ReadonlyArray<Migration> = listMigrations()
): Promise<void> => {
  const [ledger] = await client.query(
    'select to_regclass($1) is not null as present',
    ['schema_migrations']
  )
  const rows =
    ledger?.['present'] === true
      ? await client.query('select name from schema_migrations')
      : []
  const applied = new Set(rows.map((row) => readString(row, 'name')))
  const pending = migrations.filter(({ name }) => !applied.has(name))
  if (pending.length > 0)
    throw new Error(
      `Pending migrations: ${pending.map(({ name }) => name).join(', ')} (run npm run pg -- migrate)`
    )
}
