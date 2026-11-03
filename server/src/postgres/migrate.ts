import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { readString, type SqlClient } from './sql'

export interface Migration {
  readonly name: string
  readonly sql: string
}

export const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations')

const isSqlFile = (file: string) => file.endsWith('.sql')

const readMigration = (dir: string) => (name: string) => ({
  name,
  sql: readFileSync(path.join(dir, name), 'utf8')
})

/** The `NNNN_name.sql` files in a directory, oldest first. */
export const listMigrations = (dir: string = MIGRATIONS_DIR) =>
  readdirSync(dir).filter(isSqlFile).sort().map(readMigration(dir))

const ensureLedger = (db: SqlClient) =>
  db.exec(`create table if not exists schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )`)

const appliedNames = async (db: SqlClient) =>
  new Set(
    (await db.query('select name from schema_migrations')).map((row) =>
      readString(row, 'name')
    )
  )

const applyOne = (db: SqlClient, { name, sql }: Migration) =>
  db.transaction(async (tx) => {
    await tx.exec(sql)
    await tx.query('insert into schema_migrations (name) values ($1)', [name])
    return name
  })

/**
 * Applies the migrations that have not run yet, each in its own transaction.
 * Safe to run again: it returns the names it applied (empty when up to date).
 */
export const migrate = async (
  db: SqlClient,
  migrations: ReadonlyArray<Migration>
): Promise<ReadonlyArray<string>> => {
  await ensureLedger(db)
  const done = await appliedNames(db)
  const applied: string[] = []
  for (const migration of migrations) {
    if (done.has(migration.name)) continue
    applied.push(await applyOne(db, migration))
  }
  return applied
}
