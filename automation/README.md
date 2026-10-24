# automation: end-to-end tests (#175, #179)

Playwright drives the **real client** against the **real GraphQL server**. Only
MongoDB is replaced: `npm run start:e2e` in `server/` starts the server on
`mongodb-memory-server`, so every run begins with an empty database.

Everything else is a black box driven through the browser, at phone size
(390×844, `mobile` project) and on desktop (1280×800, `desktop` project).

## Run

Needs Node 22. From a clean checkout:

```sh
cd automation
npm install
npm test
```

`npm test` installs `../server` and `../client` if they have no `node_modules`,
installs Playwright's Chromium, checks formatting and types, then runs every suite.
From the repo root, `npm test` runs the client and server unit tests and then this.

Playwright's `webServer` starts two processes and stops them afterwards:

1. The server on 4311: `npm --prefix ../server run start:e2e`.
2. The client dev server on 4310 with `VITE_GRAPHQL_URL` pointing at that server.

Ports busy? Set `E2E_CLIENT_PORT` and `E2E_SERVER_PORT`.

Useful: `npx playwright test tests/list.spec.ts --project=mobile`,
`npx playwright test --ui`, `npm run report` after a failure (traces are kept on failure).

## Suites

| Spec               | Journey                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list.spec.ts`     | The ingredients-first page (#179), one test per acceptance scenario: one page, chips by category, cross off in place, chip panel, quantity, category and Sort now, Sort, the plus area, recipe rows, several rows open, Save visibility, sections, motion, scroll to top, refresh, keyboard |
| `auth.spec.ts`     | Sign up, log out and log in from the account menu; a wrong password                                                                                                                                                                                                                         |
| `saved.spec.ts`    | Saving from the recipe page and the Saved filter                                                                                                                                                                                                                                            |
| `search.spec.ts`   | Header search: Tab accepts the suggestion, Enter filters the rows; an ingredient with no recipes becomes a chip                                                                                                                                                                             |
| `darkmode.spec.ts` | Dark mode follows the device; selected rows keep their border and check mark                                                                                                                                                                                                                |

Every test also fails if the page makes any request that leaves localhost
(fixture in `tests/fixtures.ts`). Google Fonts and Stripe.js are blocked but not
counted until self-hosted fonts and the Stripe stand-in land.

The Upgrade journey (Stripe checkout through a WireMock stand-in) arrives with the
#175 suite; it needs that branch's server and client Stripe changes.

## Adding a test

1. Add `tests/<journey>.spec.ts` and import `test` and `expect` from `./fixtures`
   (not from `@playwright/test`) so the outside-request guard applies.
2. Find things by role and accessible name (`getByRole`), as a screen reader would.
3. Need an account? `signUp(page, newAccount())`. The database is empty at the start
   of each run, so make new accounts rather than relying on earlier tests.
4. Run `npm test` (it also runs `prettier --check` and `tsc`).
