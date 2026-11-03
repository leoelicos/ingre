/**
 * #217: Postgres migration CLI. Nothing in the app imports this.
 *
 *   DATABASE_URL=postgres://… npm run pg -- migrate
 *   DATABASE_URL=… MONGODB_URI=… npm run pg -- backfill          (dry run)
 *   DATABASE_URL=… MONGODB_URI=… npm run pg -- backfill --write
 *   DATABASE_URL=… MONGODB_URI=… npm run pg -- verify
 *
 * Mongo is only ever read. Neither URL has a default. Point DATABASE_URL at a
 * scratch database; there is no cutover in this change.
 */
import mongoose from 'mongoose'
import { Pool, type PoolClient } from 'pg'
import {
  backfill,
  expectedCounts,
  verifyCounts
} from '../src/postgres/backfill'
import { parseCli } from '../src/postgres/cliOptions'
import { readLegacy } from '../src/postgres/legacy'
import { listMigrations, migrate } from '../src/postgres/migrate'
import type { Row, SqlClient } from '../src/postgres/sql'

const rowsOf = (rows: ReadonlyArray<Row>) => rows

const fromClient = (client: Pool | PoolClient): SqlClient => ({
  query: async (text, params = []) =>
    rowsOf((await client.query<Row>(text, [...params])).rows),
  exec: async (text) => {
    await client.query(text)
  },
  transaction: async (work) => {
    const conn = client instanceof Pool ? await client.connect() : client
    try {
      await conn.query('begin')
      const result = await work(fromClient(conn))
      await conn.query('commit')
      return result
    } catch (error) {
      await conn.query('rollback')
      throw error
    } finally {
      if (client instanceof Pool && 'release' in conn) conn.release()
    }
  }
})

const main = async () => {
  const options = parseCli(process.argv.slice(2), process.env)
  const pool = new Pool({ connectionString: options.databaseUrl })
  const db = fromClient(pool)
  try {
    if (options.command === 'migrate') {
      const applied = await migrate(db, listMigrations())
      console.log(
        applied.length ? `Applied ${applied.join(', ')}` : 'Up to date'
      )
      return
    }
    await mongoose.connect(options.mongoUri)
    const data = await readLegacy()
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
    await mongoose.disconnect()
    await pool.end()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
