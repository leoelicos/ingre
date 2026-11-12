# Postgres migration (#217)

Postgres is the confirmed system of record and Mongo will be retired. This
change adds the schema, a migration runner and a Mongo → Postgres backfill,
with tests. **Nothing in the app uses Postgres yet: no cutover.** Mongo stays
the only database the API reads and writes.

## What is here

| Piece                                      | Where                                     |
| ------------------------------------------ | ----------------------------------------- |
| Schema v1 (SQL)                            | `server/migrations/0001_init.sql`         |
| Firebase uid on users (Firebase Auth)      | `server/migrations/0002_firebase_uid.sql` |
| Migration runner (ledger, one tx per file) | `server/src/postgres/migrate.ts`          |
| Mongo reader (read-only) → plain data      | `server/src/postgres/legacy.ts`           |
| Backfill (upserts) + row-count check       | `server/src/postgres/backfill.ts`         |
| CLI                                        | `server/scripts/pg.ts`                    |

## Mapping

| Mongo                              | Postgres                                                                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Category`                         | `categories` (the aisle)                                                                                                |
| `Ingredient` (one per recipe line) | `ingredients` (distinct, keyed by catalogue id or lower-cased name) + `recipe_ingredients` (one row per line, in order) |
| `Recipe`                           | `recipes` (`customisations` as `jsonb`)                                                                                 |
| `User`                             | `users` (bcrypt hash copied as is; `firebaseUid` → `firebase_uid`, null hash for a Firebase-only user)                  |
| `User.savedRecipes`                | `saved_recipes` (deduped, order kept)                                                                                   |
| no Mongo source                    | `tickets`, `user_preferences` (empty)                                                                                   |

`mongo_id` keeps each legacy ObjectId, so the backfill upserts and can be
re-run. References to documents that no longer exist are skipped and counted.

## Running it (scratch databases only)

Neither URL has a default.

```
DATABASE_URL=postgres://… npm run pg -- migrate
DATABASE_URL=… MONGODB_URI=… npm run pg -- backfill           # dry run: counts only
DATABASE_URL=… MONGODB_URI=… npm run pg -- backfill --write
DATABASE_URL=… MONGODB_URI=… npm run pg -- verify             # row counts match?
```

Mongo is only ever read. `backfill` writes nothing without `--write`.
Do not point `DATABASE_URL` at production until the owner approves the cutover.

## Tests

`npm test` in `server/` runs the migration and backfill tests against
[PGlite](https://pglite.dev) (Postgres in WebAssembly, in-process: no server,
no network, no real data) and `mongodb-memory-server`. The server script runs
Jest with `--experimental-vm-modules` because PGlite loads its WebAssembly with
a dynamic import.

## Firebase Auth

Sign-in is moving to Firebase (docs/AUTH.md). The app user id stays the Mongo `_id`
(`users.mongo_id`), which Paddle and RevenueCat hold; `users.firebase_uid` is the
Firebase uid. At the cutover, a Postgres `findOrCreateUserByFirebase` replaces
`server/src/datasources/firebaseUser.ts`; the auth code calls nothing else.

## Not done (needs the owner)

- Hosting and who approves the spend (no paid service without Alana).
- The cutover: a `DATA_STORE=mongo|postgres` switch, dual writes for users,
  flipping reads, and the date Mongo retires.
- Whether the static JSON catalogue is seeded into `ingredients`.
