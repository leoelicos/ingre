/**
 * #217: Postgres CLI: migrations, and the one-off copy from Mongo at the cutover
 * (docs/POSTGRES_MIGRATION.md). Nothing in the app imports this.
 *
 *   DATABASE_URL=postgres://… npm run pg -- migrate
 *   DATABASE_URL=… LEGACY_MONGODB_URI=… npm run pg -- backfill          (dry run)
 *   DATABASE_URL=… LEGACY_MONGODB_URI=… npm run pg -- backfill --write
 *   DATABASE_URL=… LEGACY_MONGODB_URI=… npm run pg -- verify
 *
 * Mongo is only ever read. Neither URL has a default.
 */
import { Pool } from 'pg'
import {
  backfill,
  expectedCounts,
  verifyCounts
} from '../src/postgres/backfill'
import { parseCli } from '../src/postgres/cliOptions'
import { listMigrations, migrate } from '../src/postgres/migrate'
import { fromPool } from '../src/postgres/sql'
import { readLegacyMongo } from './legacyMongo'

const main = async () => {
  const options = parseCli(process.argv.slice(2), process.env)
  const pool = new Pool({ connectionString: options.databaseUrl })
  const db = fromPool(pool)
  try {
    if (options.command === 'migrate') {
      const applied = await migrate(db, listMigrations())
      console.log(
        applied.length ? `Applied ${applied.join(', ')}` : 'Up to date'
      )
      return
    }
    const data = await readLegacyMongo(options.mongoUri)
    if (options.command === 'verify') {
      const problems = await verifyCounts(db, data)
      console.log(problems.length ? problems.join('\n') : 'Row counts match')
      process.exitCode = problems.length ? 1 : 0
      return
    }
    if (!options.write) {
      console.log('Dry run (add --write to copy). Would write:')
      console.log(expectedCounts(data))
      return
    }
    console.log(await backfill(db, data))
  } finally {
    await pool.end()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
