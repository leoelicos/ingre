import express, { json, urlencoded } from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import { createDataSources } from './src/datasources'
import { resolvers } from './src/schemas/resolvers'
import { typeDefs } from './src/schemas/typeDefs'
import { authMiddleware } from './src/utils/auth'
import connection from './config/connection'
import { AuthenticatedRequest, MyContext } from './src/schemas/types'

const PORT = process.env.PORT || 3001
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
      context: async ({ req }) => {
        const authReq = req as AuthenticatedRequest
        authReq.dataSources = createDataSources()
        return { ...authMiddleware({ req: authReq }), headers: req.headers }
      }
    })
  )

  connection.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running at http://localhost:${PORT}/graphql`)
    })
  })
}

startApolloServer()
