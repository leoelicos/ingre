# Tiers behind a feature flag (#208)

Everything here is **off by default**. Nothing changes for anyone until the `tiers` flag is switched on.

## Turning it on

- `?flags=tiers` on any page turns the flag on for this device and it stays on (`localStorage` key `ingre.flags`).
- `?flags=` (empty) turns every flag off again.
- Flags live in `client/src/utils/flags/`. Add a name to `FLAGS` to add a flag.

## Tiers

| Tier     | Price (USD) | Adds                                                                          |
| -------- | ----------- | ----------------------------------------------------------------------------- |
| Explorer | 4           | suggestions, capture support, triage                                          |
| Manager  | 8           | budget, calendar, composed menus, guest profiles, risk handling               |
| Leader   | 16          | precise execution, multi-day prep, dietary separation, HACCP, exact technique |

Each tier includes the one below. The data is in `client/src/utils/tier/tiers.ts` (prices in USD, like the existing checkout).
`activeFeatures(tier, optedIn)` is the opt-in rule: a feature is on only when the tier has it **and** the user chose it. Nothing is locked or gated yet; this PR only defines the tiers and the way to buy one.

## Upsell

Plans appear only after the first end-to-end (a picked recipe with every chip crossed off), and only in two places: the **account menu** (a "Plans" item) and the **Plans page** (`/upgrade` with the flag on). No modal, banner or interstitial. The first end-to-end is remembered on the device (`ingre.tier.firstEndToEnd`).

## Buying

Choosing a tier starts the existing Stripe checkout for that tier (`checkout(tier:)` on the server). After Stripe returns to the Success page, `makeUserPro(tier:)` records the tier on the user. The tier travels through the redirect in `sessionStorage`, because Stripe's success URL only carries the session id.

## Subscriptions (#312)

With `VITE_STRIPE_PUBLISHABLE_KEY` set, choosing a tier opens a card form in place (Stripe Elements, `createToken`) and subscribes monthly; Stripe's webhooks keep the tier and `active` status in step. See `docs/STRIPE.md`.

## Test mode only

There are **no real charges**. The server refuses any Stripe key that is not an `sk_test_` key (`server/src/datasources/stripe.ts`). Keys come from the environment (`STRIPE_SECRET_KEY`) and are never committed. With no key, the public sample test key is used. E2E runs against the WireMock Stripe stand-in; to run against Stripe's real test mode, add test keys (`sk_test_…`, `pk_test_…`) as CI secrets. Use Stripe's public test card `4242 4242 4242 4242`, any future expiry, any 3-digit CVC.
