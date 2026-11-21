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

Choosing a tier on `/upgrade` continues on `/checkout`. Web payment is Paddle
(merchant of record) and entitlements are RevenueCat. See `docs/PADDLE_REVENUECAT.md`.
Stripe is fully retired as a web payment path.

## Test mode only

There are **no real charges** in sandbox. Paddle and RevenueCat keys in the repo
are sandbox placeholders. The server and Vite refuse to start a test run with a
production key. E2E uses `page.route` stand-ins for Paddle.js and RevenueCat
(`automation/tests/paddle.ts`, `checkout-localization.spec.ts`).

## Native apps (#314)

The native apps sell the same tiers through the App Store and Google Play (stores require their own billing in apps), behind the same flag, off by default. See `docs/STORE_SUBSCRIPTIONS.md`.
