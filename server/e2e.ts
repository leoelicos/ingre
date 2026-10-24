/*
 * npm run start:e2e (#175): the normal server on a fresh in-memory MongoDB, for the
 * Playwright suites in ../automation. Every start is an empty database.
 * Stripe is pointed elsewhere only through env (STRIPE_API_HOST/_PORT/_PROTOCOL/_KEY).
 */
import { MongoMemoryServer } from 'mongodb-memory-server'

const E2E_JWT_SECRET = 'e2e-only-secret'

const start = async (): Promise<void> => {
  const mongo = await MongoMemoryServer.create()
  process.env['MONGODB_URI'] = mongo.getUri('ingre-e2e')
  process.env['JWT_SECRET'] = process.env['JWT_SECRET'] || E2E_JWT_SECRET
  const stop = async (): Promise<void> => {
    await mongo.stop()
    process.exit(0)
  }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
  await import('./server')
}

start()
