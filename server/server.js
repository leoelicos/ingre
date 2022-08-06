/*
 * ingre
 * server.js
 * This script contains the necessary code to initiate the application
 * Copyright 2022 Leo Wong
 */

// import utility for working with file and directory paths
const path = require('path');

// import server framework for Node.js
const express = require('express');

// import GraphQL middleware for Express
const { ApolloServer } = require('apollo-server-express');

// import GraphQL schemas
const { typeDefs, resolvers } = require('./schemas');

// import JWT authorization middleware for Express
const { authMiddleware } = require('./utils/auth');

// import MongoDB connection
const db = require('./config/connection');

// use Heroku's env port for deployment, and local port 3001 for testing
const PORT = process.env.PORT || 3001;

// assign variable 'app' for readability
const app = express();

// define Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

// implement middleware that parses json
app.use(express.json({ limit: '13MB' }));
// implement middleware that parses urlencoded bodies
app.use(express.urlencoded({ limit: '13MB', extended: true }));

// middleware to serve static images
app.use('/images', express.static(path.join(__dirname, '../client/images')));

// implement middleware that serves build folder in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// middleware to serve home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// middleware to catch all other routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'), (err) => err && res.status(500).send(err));
});

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  //
  // start Apollo server
  await server.start();

  // middleware that adds /graphql route inside express
  server.applyMiddleware({ app });

  // open MongoDB connection
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

// Call the async function to start the server
startApolloServer(typeDefs, resolvers);
