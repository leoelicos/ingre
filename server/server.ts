import express, { json, urlencoded } from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import { resolvers } from './src/schemas/resolvers'
import { typeDefs } from './src/schemas/typeDefs'
import { buildContext } from './src/context'
import connection from './config/connection'
import { MyContext } from './src/schemas/types'

const PORT = process.env['PORT'] || 3001
const app = express()

const server = new ApolloServer<MyContext>({ typeDefs, resolvers })

const startApolloServer = async () => {
  await server.start()
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
