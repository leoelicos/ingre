/*
 * npm start: connects to Postgres (DATABASE_URL), refuses to start on a schema with
 * pending migrations, then listens. Nothing listens before the database is ready.
 */
import { connect } from './config/connection'
import { startApi } from './api'

const PORT = process.env['PORT'] || 3001

connect()
  .then(() => startApi(PORT))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
