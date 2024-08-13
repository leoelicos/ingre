import path from 'path';
import express, { static as expressStatic, json, urlencoded } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { resolvers, typeDefs } from 'schemas';
import { authMiddleware } from 'utils/auth';
import connection from './config/connection';

const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

app.use(json({ limit: '13MB' }));
app.use(urlencoded({ limit: '13MB', extended: true }));
app.use('/images', expressStatic(path.join(__dirname, '../client/images')));
if (process.env.NODE_ENV === 'production') {
  app.use(expressStatic(path.join(__dirname, '../client/build')));
}
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
app.get('/*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'), (err) => err && res.status(500).send(err));
});
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
