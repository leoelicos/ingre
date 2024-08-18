import path from 'path';
import express, { json, urlencoded } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { resolvers } from 'schemas/resolvers';
import { typeDefs } from 'schemas/typeDefs';
import { authMiddleware } from './src/utils/auth';
import connection from './config/connection';

const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

app.use(json({ limit: '13MB' }));
app.use(urlencoded({ limit: '13MB', extended: true }));

const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
  connection.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

startApolloServer();
