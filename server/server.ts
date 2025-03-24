import express, { json, urlencoded } from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { createDataSources } from 'datasources'
import { resolvers } from 'schemas/resolvers'
import { typeDefs } from 'schemas/typeDefs'
import { authMiddleware } from 'utils/auth'
import connection from './config/connection'
import { AuthenticatedRequest, MyContext } from 'schemas/types'

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
