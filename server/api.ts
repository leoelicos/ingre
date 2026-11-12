import express, { json, raw, urlencoded } from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import { resolvers } from './src/schemas/resolvers'
import { typeDefs } from './src/schemas/typeDefs'
import { buildContext } from './src/context'
import { MyContext } from './src/schemas/types'
import { getStripe } from './src/datasources/stripe'
import { UserApi } from './src/datasources/user'
import { stripeWebhook } from './src/webhooks/stripe'
import { StoreApi } from './src/datasources/store'
import { appleNotifications, googleRtdn } from './src/webhooks/store'
import { assertNoProductionKeys } from './src/payments/keyGuard'
import { EntitlementApi } from './src/datasources/entitlement'
import { revenueCatSync } from './src/payments/revenuecat'
import { paddleWebhook } from './src/webhooks/paddle'
import { revenueCatWebhook } from './src/webhooks/revenuecat'

/**
 * The API: Express + Apollo on /graphql and the payment webhooks. Call it once the
 * database is set (src/postgres/db.ts): server.ts does with Postgres, e2e.ts with an
 * in-memory PGlite.
 */
export const startApi = async (port: string | number): Promise<void> => {
  // Paddle + RevenueCat: a test or sandbox run with a production payment key stops here
  assertNoProductionKeys(process.env)
  const app = express()
  const server = new ApolloServer<MyContext>({ typeDefs, resolvers })
  await server.start()
  // #312: Stripe's events, signature-checked over the raw body (before any JSON parser)
  app.post(
    '/stripe/webhook',
    raw({ type: 'application/json' }),
    stripeWebhook(getStripe(), new UserApi())
  )
  // #314: App Store and Google Play subscription notices (verified with each store)
  const store = new StoreApi()
  app.post('/store/google/rtdn', json(), googleRtdn(store, new UserApi()))
  app.post(
    '/store/apple/notifications',
    json({ limit: '1MB' }),
    appleNotifications(store, new UserApi())
  )
  // Paddle + RevenueCat: web subscriptions (Paddle, signature-checked over the raw body)
  // and store purchases reported by RevenueCat, normalised into one entitlement
  const entitlements = new EntitlementApi()
  app.post(
    '/paddle/webhook',
    raw({ type: 'application/json' }),
    paddleWebhook(entitlements, revenueCatSync(process.env))
  )
  app.post(
    '/revenuecat/webhook',
    json({ limit: '1MB' }),
    revenueCatWebhook(entitlements)
  )
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({ origin: '*' }),
    json({ limit: '13MB' }),
    urlencoded({ limit: '13MB', extended: true }),
    expressMiddleware(server, {
      context: async ({ req }) => buildContext(req.headers)
    })
  )

  app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}/graphql`)
  })
}
