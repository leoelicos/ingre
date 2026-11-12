/*
 * npm run start:e2e (#175): the normal API on a fresh in-memory Postgres (PGlite,
 * migrated on start), for the Playwright suites in ../automation. Every start is an
 * empty database. Stripe is pointed elsewhere only through env
 * (STRIPE_API_HOST/_PORT/_PROTOCOL/_KEY).
 */
import dotenv from 'dotenv'
import { PGlite } from '@electric-sql/pglite'
import { setDb } from './src/postgres/db'
import { listMigrations, migrate } from './src/postgres/migrate'
import { fromPglite } from './src/postgres/sql'

const E2E_JWT_SECRET = 'e2e-only-secret'

const start = async (): Promise<void> => {
  // Paddle + RevenueCat: a test run (the key guard in api.ts refuses live keys) with
  // the committed sandbox placeholders from .env.test; real env vars still win
  process.env['APP_ENV'] = 'test'
  dotenv.config({ path: '.env.test' })
  process.env['JWT_SECRET'] = process.env['JWT_SECRET'] || E2E_JWT_SECRET
  const pglite = new PGlite()
  const db = fromPglite(pglite)
  await migrate(db, listMigrations())
  setDb(db)
  const stop = async (): Promise<void> => {
    await pglite.close()
    process.exit(0)
  }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
  const { startApi } = await import('./api')
  await startApi(process.env['PORT'] || 3001)
}

start()
