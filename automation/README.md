# automation: end-to-end tests (#175, #179)

Playwright drives the **real client** against the **real GraphQL server**. Only
these upstreams are replaced:

| Upstream                                                  | Stand-in                                                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Postgres                                                  | in-memory PGlite, migrated by `npm run start:e2e` in `server/` (fresh database every run) |
| Paddle.js, Paddle's pricing-preview API, RevenueCat's API | `page.route` stand-ins in `tests/paddle.ts` (only `checkout-localization.spec.ts`)        |

Everything else is a black box driven through the browser, at phone size
(390×844, `mobile` project) and on desktop (1280×800, `desktop` project).

## Run

Needs Node 22 and **Java 11+** (the Firebase Auth Emulator). From a clean checkout:

```sh
cd automation
npm install
npm test
```

`npm test` installs `../server` and `../client` if they have no `node_modules`,
installs Playwright's Chromium, checks formatting and types, then runs every suite.
From the repo root, `npm test` runs the client and server unit tests and then this.

Playwright's `webServer` starts these processes and stops them afterwards:

1. The server on 4311: `npm --prefix ../server run start:e2e`.
2. The client dev server on 4310 with `VITE_GRAPHQL_URL` pointing at that server.
3. The production build on 4313 (`vite build` into `.preview-dist/`, then
   `vite preview`), also pointed at that server. Only the analytics test (#177)
   uses it, because analytics loads in production builds only.
4. The Firebase Auth Emulator on 9099.

Ports busy? Set `E2E_CLIENT_PORT`, `E2E_SERVER_PORT`, `E2E_PREVIEW_PORT`.

The Auth Emulator also starts on 9099 for this path (see `docs/AUTH.md`). To
exercise the same auth flows against the real `ingre-92a75` project instead,
set the real `VITE_FIREBASE_*` and `FIREBASE_SERVICE_ACCOUNT_JSON` in the
environment and run `npm run test:firebase-live`. That command uses
`playwright.live.config.ts`, does not start the emulator, and is not run by
`npm test` or PR CI. Never commit those secrets.

Useful: `npx playwright test tests/list.spec.ts --project=mobile`,
`npx playwright test --ui`, `npm run report` after a failure (traces are kept on failure).

## Suites

| Spec                                    | Journey                                                                                                                                                                                                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `list.spec.ts`                          | The ingredients-first page (#179), one test per acceptance scenario                                                                                                                                                                                                                                                |
| `chips.spec.ts`                         | Ingredient chips (#181)                                                                                                                                                                                                                                                                                            |
| `explore.spec.ts`                       | Explore (#181) in its sheet or modal (#192): search at the top, focus trap, Escape, ✕, motion                                                                                                                                                                                                                      |
| `workspace.spec.ts`                     | The one workspace (#192): 575/576 layout, the sideways recipe row, sticky Ingredients header, 44px label rows, the FAB, sheet vs modal, swipe to close and swipe to delete with Undo                                                                                                                               |
| `recipes.spec.ts`                       | Recipe rows (#181)                                                                                                                                                                                                                                                                                                 |
| `headers.spec.ts`                       | Section headers (#181): plain outlined headings, no accordions (#192)                                                                                                                                                                                                                                              |
| `stage2.spec.ts`, `stage2-more.spec.ts` | Balance-sheet ingredients, recipe copies, filters and saving (#182)                                                                                                                                                                                                                                                |
| `tabs.spec.ts`                          | Four tabs (#227): Explore, Inventory, Cook and Profile as one stable bottom bar on every page; tabs land on their section; Saved and Account live under Profile                                                                                                                                                    |
| `wrapup.spec.ts`                        | Self-hosted fonts (#176), no Bootstrap classes (#170), Skip to content (#131), no analytics outside production (#177)                                                                                                                                                                                              |
| `auth.spec.ts`                          | Sign up, log out and log in from the account menu; a wrong password                                                                                                                                                                                                                                                |
| `checkout-localization.spec.ts`         | Paddle + RevenueCat global pricing: a US customer (base price, sales tax as its own line in Paddle's overlay), a German one (euros formatted the German way, VAT included) and an Indian one (₹, the PPP discount, yearly billing enforced on the lowest tier), each with locale, time zone and a granted location |
| `saved.spec.ts`                         | Saving from Explore and the Saved filter                                                                                                                                                                                                                                                                           |
| `profile.spec.ts`                       | Customer profile (#224): browse ranked by what you pick, explicit settings beat behaviour, allergen and diet locks always win                                                                                                                                                                                      |
| `sections.spec.ts`                      | Explore sections (#226): a colour accent per ingredient (green vegetables, orange fruit, pink meat, blue seafood) and a section filter                                                                                                                                                                             |
| `darkmode.spec.ts`                      | Dark mode follows the device; selected rows keep their border and check mark                                                                                                                                                                                                                                       |
| `analytics.spec.ts`                     | Core-loop events logged on this device only (#222)                                                                                                                                                                                                                                                                 |
| `a11y.spec.ts`                          | Accessibility baseline (#223): axe (WCAG 2.2 AA, colour contrast, light and dark) along the core loop, keyboard-only use, focus rings, reduced motion                                                                                                                                                              |
| `neumorphic.spec.ts`                    | Raised Recipes section, recessed recipe rows, raised chips; every edge at least 3:1 on the page (light and dark), focus rings                                                                                                                                                                                      |

Every test also fails if the page makes any request that leaves localhost
(fixture in `tests/fixtures.ts`). Paddle.js and the Paddle and RevenueCat APIs are routed per page in
`checkout-localization.spec.ts`; page routes win over the fixture's.

## Adding a test

1. Add `tests/<journey>.spec.ts` and import `test` and `expect` from `./fixtures`
   (not from `@playwright/test`) so the outside-request guard applies.
2. Find things by role and accessible name (`getByRole`), as a screen reader would.
3. Need an account? `signUp(page, newAccount())`. The database is empty at the start
   of each run, so make new accounts rather than relying on earlier tests.
4. Need Paddle or RevenueCat to behave differently? Add a `page.route` in
   `tests/paddle.ts` (see `checkout-localization.spec.ts`).
5. Run `npm test` (it also runs `prettier --check` and `tsc`).
