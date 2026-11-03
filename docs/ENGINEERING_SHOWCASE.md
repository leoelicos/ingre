# Engineering showcase (#240)

Prototype and early builds should visibly show five things. Product polish only needs to look intentional. Growth and marketing machinery (funnels, A/B tests, referral loops, SEO tooling) is out of scope for the showcase and is not built until the owner asks.

For each pillar: what it means here, where it already shows, and what a change must do.

## 1. Type integrity
- TypeScript is strict on both sides. The client also sets `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals` and `noUnusedParameters` (`client/tsconfig.json`).
- No `any`, no `as` casts, no non-null `!`: narrow instead. GraphQL fields that are always present are `!` in the schema, so the client types are exact.
- Small, atomic, pure functions that return a value (never `undefined` as a result). Parse at the edge (zod on the server), then pass typed data inward.
- Where it shows: `tsc --noEmit` and ESLint at 0 warnings are CI steps (`.github/workflows/ci.yml`).

## 2. Accessibility
- WCAG 2.2 AA, keyboard and VoiceOver. Interactive widgets are React Aria Components. Colour is never the only cue.
- Where it shows: every new UI has a `jest-axe` test, and the Playwright suite runs at 390 px and 1280 px. Contrast ratios are asserted in unit tests (`badgeContrast`), not eyeballed.
- A change that adds UI must add its keyboard path and accessible names to its tests (see Definition of done in `AGENTS.md`).

## 3. Named analytics events
- Today the app records page views only (the Vercel Analytics script). There are no custom events yet, and this PR does not add any: the showcase needs a clear contract before it needs data.
- The contract for when events are added:
  - Names are `object_action`, lower snake case, past tense: `recipe_picked`, `ingredient_added`, `ticket_added`, `suggestion_refreshed`, `mode_changed`, `export_downloaded`.
  - Each name is a member of one TypeScript string-literal union in a single file, so an unnamed or misspelt event does not compile. Its properties are typed per event.
  - No personal data in an event. No ingredient free text. Ids and counts only.
  - Events are a thin wrapper (`track(name, props)`) over whichever sink is chosen, so the sink can change without touching call sites. A new paid sink needs Alana's sign-off (see `AGENTS.md`).
  - Every named event has a unit test that fires it and asserts the name and properties.

## 4. Clear system design
- One page of architecture: `AGENTS.md` (stack, repo map, routes, commands) and `.cursor/context/*.md` for each area.
- Client is a static bundle of the catalogue plus device-side state; the server owns accounts, saved recipes and Stripe only. That split is why Explore is instant and works offline.
- Rule: a change that adds a route, a data file, a server model or a top-level folder updates the repo map in `AGENTS.md` in the same PR.

## 5. A path to real persistence (Postgres)
- Postgres is the intended system of record (see #217). The path is a typed schema, SQL migrations, a repository interface per datasource, then a read-only period for Mongo before it is retired. Nothing is cut over by a feature PR.
- Rule: new server-side data goes through a datasource with a narrow interface and gets a schema sketch in `docs/` (`docs/POSTGRES_SCHEMA.md`, in PR #242), so it can move without rewriting resolvers.
- Never touch production data from a branch.

## Checklist for a change
1. Did it add any `any`, `as` or `!`?
2. Does every new control have an accessible name and a keyboard path, and a `jest-axe` test?
3. If it adds a user action worth measuring, is the event named in the one union, with typed properties and no personal data?
4. Is the repo map in `AGENTS.md` still true?
5. Could the data it adds move to Postgres without changing a resolver?
6. Is anything in it growth or marketing machinery? If so, leave it out.
