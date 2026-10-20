# automation: end-to-end tests (#175)

Playwright drives the **real client** against the **real GraphQL server**. Only the
two upstreams are replaced:

| Upstream                 | Stand-in                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| MongoDB                  | `mongodb-memory-server`, started by `npm run start:e2e` in `server/` (fresh database every run) |
| Stripe API and Stripe.js | WireMock, mappings in `wiremock/`                                                               |

Everything else is a black box driven through the browser, at phone size
(390×844, `mobile` project) and on desktop (1280×800, `desktop` project).

## Run

Needs Node 22 and **Java 11+** (WireMock runs from the `wiremock` npm package's
standalone jar). From a clean checkout:

```sh
cd automation
npm install
npm test
```

`npm test` installs `../server` and `../client` if they have no `node_modules`,
installs Playwright's Chromium, checks formatting and types, then runs every suite.
From the repo root, `npm test` runs the client and server unit tests and then this.

Playwright's `webServer` starts three processes and stops them afterwards:

1. WireMock on port 4312 (`wiremock/`, response templating on).
2. The server on 4311: `npm --prefix ../server run start:e2e`, with
   `STRIPE_API_HOST`, `STRIPE_API_PORT`, `STRIPE_API_PROTOCOL` and a dummy
   `STRIPE_API_KEY` pointing stripe-node at WireMock. Production sets none of these.
3. The client dev server on 4310 with `VITE_GRAPHQL_URL` pointing at that server.

Ports busy? Set `E2E_CLIENT_PORT`, `E2E_SERVER_PORT`, `E2E_WIREMOCK_PORT`.

Useful: `npx playwright test tests/upgrade.spec.ts --project=mobile`,
`npx playwright test --ui`, `npm run report` after a failure (traces are kept on failure).

## Suites

| Spec               | Journey                                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `upgrade.spec.ts`  | **Critical, never skip.** Sign up, Upgrade, stand-in Stripe checkout: success (user becomes pro), Stripe error (clear message, not upgraded) and cancel (clear message, not upgraded). Asserts the Stripe calls through WireMock's `/__admin/requests`. |
| `auth.spec.ts`     | Sign up, log out and log in from the account menu; a wrong password                                                                                                                                                                                     |
| `pick.spec.ts`     | Choosing recipes on Pick                                                                                                                                                                                                                                |
| `list.spec.ts`     | Chips, ticking with Undo at home, quick ticks at the shop, Shopping done                                                                                                                                                                                |
| `saved.spec.ts`    | Saving from the recipe page and the Saved filter                                                                                                                                                                                                        |
| `search.spec.ts`   | Header search, Tab accepts the suggestion                                                                                                                                                                                                               |
| `darkmode.spec.ts` | Dark mode follows the device                                                                                                                                                                                                                            |

Every test also fails if the page makes any request that leaves localhost
(fixture in `tests/fixtures.ts`). Stripe.js (`https://js.stripe.com/v3`) is
answered by WireMock's `stripe-js.json` stand-in.

## Stripe stand-in

- `stripe-create-product.json`, `stripe-create-price.json`,
  `stripe-create-checkout-session.json`: the three calls `checkout.ts` makes. The
  session's `url` points at the stand-in hosted checkout.
- `stripe-js.json` + `__files/stripe-js-v3.js`: `redirectToCheckout` opens
  `/c/pay/<session>` on WireMock.
- `stripe-hosted-checkout.json` + `__files/hosted-checkout.html`: **Pay** goes to the
  app's `success_url`, **Cancel** to its `cancel_url`.
- Error paths add a higher-priority stub for one call at test time
  (`failStripe` in `tests/wiremock.ts`) and remove it afterwards.

Never put a real Stripe key here or call Stripe from the tests.

## Adding a test

1. Add `tests/<journey>.spec.ts` and import `test` and `expect` from `./fixtures`
   (not from `@playwright/test`) so the outside-request guard applies.
2. Find things by role and accessible name (`getByRole`), as a screen reader would.
3. Need an account? `signUp(page, newAccount())`. The database is empty at the start
   of each run, so make new accounts rather than relying on earlier tests.
4. Need Stripe to behave differently? Add a mapping under `wiremock/mappings/`, or a
   per-test stub through the admin API like `failStripe`.
5. Run `npm test` (it also runs `prettier --check` and `tsc`).
