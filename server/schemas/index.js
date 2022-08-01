/*
 * ingre
 * server/schemas/index.js
 * This script defines graphQL schema
 * Copyright 2022 Leo Wong
 */

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

module.exports = { typeDefs, resolvers };
