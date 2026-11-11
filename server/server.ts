import express, { json, raw, urlencoded } from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import { resolvers } from './src/schemas/resolvers'
import { typeDefs } from './src/schemas/typeDefs'
import { buildContext } from './src/context'
import connection from './config/connection'
import { MyContext } from './src/schemas/types'
import { getStripe } from './src/datasources/stripe'
import { UserApi } from './src/datasources/user'
import { stripeWebhook } from './src/webhooks/stripe'
import { StoreApi } from './src/datasources/store'
import { appleNotifications, googleRtdn } from './src/webhooks/store'

const PORT = process.env['PORT'] || 3001
const app = express()

const server = new ApolloServer<MyContext>({ typeDefs, resolvers })

const startApolloServer = async () => {
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
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({ origin: '*' }),
    json({ limit: '13MB' }),
    urlencoded({ limit: '13MB', extended: true }),
    expressMiddleware(server, {
      context: async ({ req }) => buildContext(req.headers)
    })
  )

  connection.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running at http://localhost:${PORT}/graphql`)
    })
  })
}

startApolloServer()
