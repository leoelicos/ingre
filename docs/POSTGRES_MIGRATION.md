# Postgres migration (#217)

Postgres is the API's only database. Mongoose, the Mongo models and
`mongodb-memory-server` are gone; the one piece of Mongo code left is the
read-only reader the cutover copy uses (`server/scripts/legacyMongo.ts`).

**Merging this to `main` is the cutover.** A push to `main` that touches
`server/**` deploys to Render (`.github/workflows/server-deploy.yml`), and the new
server refuses to start without `DATABASE_URL` or on a schema with pending
migrations. Do not merge until the runbook below is ready to run, and the
Postgres host is approved.

## Needs the owner first

- **Postgres hosting needs Alana's sign-off** (no paid service without Alana):
  which provider, the plan, backups, and the region (close to Render's).
- The production `DATABASE_URL`, set on the Render service (never in the repo).
- A date for the cutover window (sign-in and saving recipes pause for it).

## What is here

| Piece                                         | Where                                               |
| --------------------------------------------- | --------------------------------------------------- |
| Schema v1 (SQL)                               | `server/migrations/0001_init.sql`                   |
| Firebase uid on users (Firebase Auth)         | `server/migrations/0002_firebase_uid.sql`           |
| Cutover: public id, payment columns, webhooks | `server/migrations/0003_cutover.sql`                |
| Migration runner (ledger, one tx per file)    | `server/src/postgres/migrate.ts`                    |
| The API's pool (`DATABASE_URL`), schema check | `server/config/connection.ts`, `src/postgres/db.ts` |
| Datasources (parameterised SQL)               | `server/src/datasources/*.ts`                       |
| Mongo reader (read-only, scripts only)        | `server/scripts/legacyMongo.ts`                     |
| Mongo documents → plain data (pure, tested)   | `server/src/postgres/legacy.ts`                     |
| Backfill (upserts) + row-count check          | `server/src/postgres/backfill.ts`                   |
| CLI                                           | `server/scripts/pg.ts`                              |

## Ids

Every outside system holds a user's Mongo ObjectId: RevenueCat's `app_user_id`,
Paddle's `custom_data.ingre_user_id`, Apple's `appAccountToken` (zero padded),
Google's obfuscated account id, and legacy JWTs. So `users.public_id` (and
`recipes.public_id`) is that ObjectId for every migrated row, and 24 random hex
digits in the same shape for new rows (`new_public_id()`, checked by
`users_public_id_shape`). The API only ever exposes `public_id` as `_id`; the
bigint row id stays internal. A category's `_id` is its row id; a recipe line's
`_id` is `<recipe public id>:<position>`.

## Mapping

| Mongo                              | Postgres                                                                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Category`                         | `categories` (the aisle, one row per name)                                                                                                   |
| `Ingredient` (one per recipe line) | `ingredients` (distinct, keyed by catalogue id or lower-cased name) + `recipe_ingredients` (one row per line, with its own name and section) |
| `Recipe`                           | `recipes` (`public_id` = `_id`; `customisations` as `jsonb`)                                                                                 |
| `User`                             | `users` (`public_id` = `_id`; bcrypt hash as is; tier, Stripe, store and entitlement fields; null hash for a Firebase-only user)             |
| `User.savedRecipes`                | `saved_recipes` (deduped, order kept)                                                                                                        |
| `WebhookEvent`                     | `webhook_events` (so a repeat Paddle or RevenueCat delivery is still skipped)                                                                |
| no Mongo source                    | `tickets`, `user_preferences` (empty)                                                                                                        |

The backfill upserts on `public_id` (users, recipes) and names, so it can be
re-run. References to documents that no longer exist are skipped and counted.

## Cutover runbook

Run from a machine with the repo at the merge commit, Node 22, and `npm ci` in
`server/`. `LEGACY_MONGODB_URI` is production Mongo with a **read-only** user;
`DATABASE_URL` is the approved production Postgres. Neither has a default, and
neither goes in a file that is committed.

1. **Rehearse** on a copy first: a scratch Postgres and a Mongo restore (or the
   production Mongo with the read-only user), then steps 3 to 5. Fix anything
   `toLegacyData` refuses (it throws on a document it can't copy faithfully).
2. **Freeze writes.** Put the API in maintenance (Render: scale to zero or
   suspend the service) so nothing writes to Mongo. Pause the Stripe, Paddle,
   RevenueCat and store webhooks if their dashboards allow; they retry anyway,
   and `webhook_events` keeps a repeat from counting twice.
3. **Migrate:** `DATABASE_URL=… npm run pg -- migrate`
4. **Backfill:** `DATABASE_URL=… LEGACY_MONGODB_URI=… npm run pg -- backfill`
   (dry run: the counts it would write), then the same with `--write`.
5. **Verify:** `DATABASE_URL=… LEGACY_MONGODB_URI=… npm run pg -- verify` must
   print `Row counts match`. Spot-check a pro user, a store subscriber and a
   Paddle subscriber: same `_id`, tier and `active` as in Mongo.
6. **Switch:** set `DATABASE_URL` on Render (and remove `MONGODB_URI`), then
   merge to `main` (the deploy hook ships it) and resume the service. Sign in
   with a legacy account and a Firebase account, save and remove a recipe.
7. **Keep Mongo read-only** for the rollback window (suggested 30 days): revoke
   write roles from the app user, keep backups, then retire it on a date the
   owner sets.

Rollback inside the window: redeploy the last Mongo commit with `MONGODB_URI`
back. Anything written to Postgres after the switch (new users, saved recipes,
payment events) is not in Mongo, so roll back only if the switch fails early,
or copy those rows back by hand first.

Migrations run before each deploy from now on: `npm run pg -- migrate` (a
Render pre-deploy command, or by hand). The server never migrates itself; it
refuses to start until the schema is current.

## Development and tests

- Local: a Postgres you run (`DATABASE_URL=postgres://localhost:5432/ingre`),
  `npm run pg -- migrate`, then `npm run seed` for the demo accounts.
- `npm test` in `server/` runs everything on [PGlite](https://pglite.dev)
  (Postgres in WebAssembly, in-process: no server, no network, no real data).
  `src/test-utils/pg.ts` `useTestDb()` gives a test file a migrated database,
  emptied before each test. Jest runs with `--experimental-vm-modules` because
  PGlite loads its WebAssembly with a dynamic import.
- `npm run start:e2e` serves the API on a fresh, migrated in-memory PGlite for
  the Playwright suites.

## Firebase Auth

Sign-in is moving to Firebase (docs/AUTH.md). The app user id stays the public
id, which Paddle and RevenueCat hold; `users.firebase_uid` is the Firebase uid.
`findOrCreateUserByFirebase` (`server/src/datasources/firebaseUser.ts`) is the
only code that finds, links or creates a user for Firebase.

## Still open

- Whether the static JSON catalogue is seeded into `ingredients`.
- Pruning old `webhook_events` rows (Mongo kept them forever too).
