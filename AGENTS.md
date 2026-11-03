# AGENTS.md — ingre

Shared context for every AI agent. Read this first; don't rediscover the repo or rely on chat history.
Deeper per-area notes: `.cursor/README.md` and `.cursor/context/*.md` (open only the one you need).

## Purpose

Shopping app for the home cook: pick recipes, get an ingredient shopping list (Australian context, Coles/Woolies sections).
Live: https://ingre.vercel.app · API: https://ingre-backend.onrender.com/graphql

## Stack

- Client (`client/`): React 18, TypeScript 6 (strict), Vite 8, React Router 7, Apollo Client 3,
  Tailwind CSS 3 (tokens via CSS vars in `src/styles/theme.css`, `darkMode: 'media'`),
  React Aria Components, Font Awesome, Sass. Bootstrap is no longer a dependency.
- Server (`server/`): Express 4 + Apollo Server 5 (`@as-integrations/express4`), run with `tsx`,
  Mongoose 6 / MongoDB, JWT + bcrypt auth, Stripe, zod.
- Tests: Jest 30 + ts-jest; client uses Testing Library + jest-axe (jsdom); server uses mongodb-memory-server.
- Hosting: Vercel (client, from `main`, preview per PR; SPA rewrite in `vercel.json`).
  Render free tier (API): cold start ~30-60s after idle — expect a slow first request.
- Node 22.x (root `engines`, CI matrix).

## Repo map

```
package.json          root scripts (install/develop/build/seed), concurrently
vercel.json           SPA rewrite to /index.html
.github/workflows/ci.yml  the only CI workflow
.cursor/              rules + atomised context notes (context/*.md)
docs/                 TODO.md, TEST_MOCK_INVENTORY.md, TIERS.md (feature flags, tiers)
docs/                 TODO.md, TEST_MOCK_INVENTORY.md, ANALYTICS.md
docs/                 TODO.md, TEST_MOCK_INVENTORY.md, RAG.md (retrieval over curated profiles, #225)
docs/                 TODO.md, TEST_MOCK_INVENTORY.md, ENGAGEMENT_LOOP.md
docs/                 TODO.md, TEST_MOCK_INVENTORY.md, MOBILE_CONSTRAINTS.md
docs/                 TODO.md, TEST_MOCK_INVENTORY.md, ENGINEERING_SHOWCASE.md
docs/                 TODO.md, TEST_MOCK_INVENTORY.md, DESIGN_PRINCIPLES.md
docs/                 TODO.md, TEST_MOCK_INVENTORY.md, brand/logo-options/ (draft logo assets, #235)
MODERNIZATION.md      modernisation checklist (history)
scripts/convert-catalogue.py  catalogue data conversion
client/
  vite.config.mts, tailwind.config.js, postcss.config.js, jest.config.js, tsconfig.json
  .eslintrc.js (ESLint 8, legacy config), .prettierrc.json
  src/index.tsx, src/App.tsx    entry + routes + Apollo client setup
  src/components/   Header, BottomNav, AccountMenu, HeaderSearch, SectionTone, Widgets, ...
  src/pages/        Home, Recipe, Search, ShoppingList, TapOff, Admin (login/signup/upgrade/success/404)
  src/lib/apollo/graphQL   queries/mutations
  src/utils/        auth, idb, storage, shopping, state, library, rag (local retrieval, #225)
  src/utils/        auth, idb, storage, shopping, state, library, profile
  src/data/         ingredients.json, recipes.json
  src/styles/       theme.css (design tokens), segmented.css
server/
  server.ts         Express + Apollo on /graphql (PORT or 3001); listens only after Mongo connects
  config/connection.ts   Mongoose connection
  src/schemas/      typeDefs.ts, resolvers(.ts|/), types.ts
  src/models/       Category, Ingredient, Recipe, User
  src/datasources/  per-model data access (+ stripe)
  src/utils/        auth, requireUser, ingredientDefaults
  seeds/            seed script
  migrations/       Postgres SQL migrations (#217; not used by the API yet), see docs/POSTGRES_MIGRATION.md
  scripts/pg.ts     Postgres migrate / backfill / verify CLI (never default-connects)
  eslint.config.mjs (ESLint 9 flat), jest.config.js
```

Tests sit beside code (`*.test.ts`) or in `__tests__/` folders.

## Routes (client/src/App.tsx)

`/` home grid · `/recipe/:id` · `/saved` (on this device) · `/ingredients` shopping flow ·
`/search` · `/tapoff` · `/login` `/signup` · `/upgrade` `/success` (Stripe) · `*` no match.

## Commands (verified from package.json / ci.yml)

Root:

- `npm run install` — installs server then client
- `npm run develop` — API watch + Vite together
- `npm start` — API only · `npm run build` — client build · `npm run seed` — seed DB
  Client (`cd client`):
- `npm start` (Vite dev, port 3000 per .cursor notes) · `npm run build` (`vite build`, output `client/build`) · `npm run preview`
- `npm test` · `npm run lint`
  Server (`cd server`):
- `npm start` (`npx tsx server.ts`) · `npm run watch` · `npm test` · `npm run lint` · `npm run seed`
  CI-equivalent checks (run before pushing):

```
cd client && npm ci && npx tsc --noEmit && npm run lint -- --max-warnings 0 \
  && npx prettier --check "src/**/*.{ts,tsx,css}" \
  && npm test -- --coverage --coverageThreshold='{"global":{"branches":100,"functions":100,"lines":100,"statements":100}}' \
  && npm run build
cd ../server && npm ci && npm test
```

Note: CI enforces 100% client coverage. CI does not run server lint or server tsc.
Env vars: TODO (not verified; check `server/config/connection.ts`, `client/src/lib/apollo`).

## Coding conventions (observed)

- TypeScript strict both sides; client also `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noUnusedLocals/Parameters`. No `any` (lint error). Don't silence with `as`, `as any`, or `!` — narrow instead.
- Prettier: no semicolons, single quotes, width 80, no trailing commas, one JSX attribute per line.
- Relative imports (path aliases were removed).
- Styling: Tailwind utilities using theme tokens (`bg-surface`, `text-text`, `badge-produce`, `rounded-card`…);
  add colours as CSS vars in `theme.css`, not hex in components.
- Interactive widgets: React Aria Components.
- npm only; commit the package's own `package-lock.json`; no yarn lockfile.
- Comments reference issue numbers (e.g. `#154`) for why something exists.
- Australian English in code comments and UI (colour, capitalise, organise).

## House rules (from the owners)

Accessibility

- WCAG 2.2 AA. Everything usable by keyboard and VoiceOver.
- Colour is never the only cue (add text, icon or shape).
- Real `<button>`s (or React Aria Button) with accessible names; no clickable divs.
- Menus announce open/closed state, close on Escape, and support arrow keys.
  UI text
- Plain, literal language. Say what happens ("Add to list", not "Let's go!").
- Design principles (#212, `docs/DESIGN_PRINCIPLES.md`): plain translatable English with no culinary jargon by default,
  one primary name per ingredient (aliases for search only), service animations of about 500 ms ease-out that become
  instant under reduced motion, minimalist look, thumb-zone first.
  Ingredient colours
- No ingredient icons or three-letter code badges (removed #191: recipe rows show just their name).
  Chips and category tabs are coloured by supermarket section (produce = green), never colour alone.
  See `client/src/components/SectionTone/` (badgeTone.ts, tones.ts).
  Engagement loop (#215, `docs/ENGAGEMENT_LOOP.md`)
- scroll, tap an ingredient, read a suggestion, act, then the suggestions update. Acting (adding a ticket) stays in the loop:
  no navigation, no blocking dialog, next suggestions still in view. Always a next tap. Any gesture also has a button.
  Naming (#214, `docs/TERMINOLOGY.md`)
- English first for home cooks, Australian English primary. One primary display name per ingredient; aliases are for
  search only. Regional and specialist names get an optional tooltip. Don't settle cut-name debates.
  Accounts and header
- No account needed this phase. Saved stays on the device.
- Navigation is four tabs in one stable bottom bar (BottomNav): Explore, Inventory, Cook, Profile (#227). Saved recipes and other collections live under Profile, never as top-level tabs.
- Header shows only: logo, search, account icon. Log in / Sign up live in the account icon menu.
- Saved appears in the account icon menu after sign-in.
  Analytics
- Core-loop actions are logged as named events with `track()` (`client/src/utils/analytics/events.ts`,
  list in `docs/ANALYTICS.md`). Local logging only until the owner says otherwise; no personal data in details.
  Mobile (#241)
- Mobile first at 390 px: one-thumb reach, 44 px targets, keyboard coverage, safe areas, short sessions (`docs/MOBILE_CONSTRAINTS.md`). Gestures are shortcuts; every one has a visible control.
  Engineering showcase (#240)
- Show type integrity, accessibility, named analytics events, clear system design and a Postgres path (`docs/ENGINEERING_SHOWCASE.md`). No growth or marketing machinery.
  Process
- One PR per batch of work. Automated checks only during the build; one review on the Vercel preview; the owner merges.
- No paid services, and no new dependencies with paid tiers, without sign-off from Alana (finance).
- Keep briefs and messages short. No confirmation-only messages.

## Definition of done

- [ ] Meets the PRP's acceptance criteria (template: `docs/prp/TEMPLATE.md`).
- [ ] All CI-equivalent checks above pass locally (tsc, lint 0 warnings, prettier, 100% coverage, build, server tests).
- [ ] New UI has tests including a `jest-axe` check; keyboard path and accessible names tested.
- [ ] Manually checked with keyboard only and VoiceOver; nothing relies on colour alone.
- [ ] UI text is plain, literal, Australian English; motion and layout follow `docs/DESIGN_PRINCIPLES.md`.
- [ ] No new paid service/dependency without Alana's sign-off; lockfile committed.
- [ ] One PR for the batch, with a short description and preview link; owner merges.
