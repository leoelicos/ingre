# Server

Express 4 + Apollo Server 5. Entry: `server/server.ts`. Express middleware is `@as-integrations/express4`, not `@apollo/server/express4`.

Port `process.env.PORT` or 3001. `listen` runs only after the Postgres pool connects and the schema has no pending migrations (`config/connection.ts`, `DATABASE_URL`).

Schema: `src/schemas/typeDefs.ts`, `resolvers.ts`, and `resolvers/{recipe,session,user}/`. Context: `src/context.ts`. Shared types: `src/schemas/types.ts`. Errors: `src/errors.ts`.

Datasources: user, recipe, ingredient, category, stripe (`src/datasources/`). Models: User, Recipe, Ingredient, Category.

GraphQL inputs are non-null. Resolvers return typed errors or null, not `undefined`. Recipe save helpers live beside `saveRecipe.ts`. `updateRecipe` was removed.

Tests use PGlite (`src/test-utils/pg.ts`, `useTestDb()`). Do not point tests at a real database.
