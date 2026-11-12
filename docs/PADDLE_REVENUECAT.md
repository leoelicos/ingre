# Paddle + RevenueCat: global pricing

Web checkout through **Paddle** (merchant of record: it charges and remits sales tax, VAT
and GST), one entitlement per user across Paddle, the App Store and Google Play through
**RevenueCat**. Everything in the repo is sandbox-only placeholders; nothing here can take
a real payment.

> House rule: Paddle and RevenueCat are paid services. They need sign-off from Alana
> (finance) before anything goes live.

## Pieces

| Where                                     | What                                                                                                                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client/src/pages/Checkout/`              | `/checkout` (behind the `tiers` flag): prices in the customer's currency, tax shown the way their country expects, billing choice, Paddle's overlay checkout               |
| `client/src/utils/payments/pricing.ts`    | the PPP pricing engine: list prices per region, PPP discount, rounding, the annual-only rule                                                                               |
| `client/src/utils/payments/country.ts`    | the customer's country: granted location, then the browser locale's region, then the time zone, then US; the customer can always pick another                              |
| `client/src/utils/payments/paddle.ts`     | Paddle.js through `@paddle/paddle-js`: `PricePreview` for Paddle's own price and tax, `Checkout.open` with `customData.ingre_user_id`                                      |
| `client/src/utils/payments/revenuecat.ts` | `@revenuecat/purchases-js`: the signed-in user's active entitlement ("Your plan: …")                                                                                       |
| `server/src/webhooks/paddle.ts`           | `POST /paddle/webhook`: signature checked with the Paddle Node SDK (`Paddle-Signature`, raw body)                                                                          |
| `server/src/webhooks/revenuecat.ts`       | `POST /revenuecat/webhook`: App Store, Google Play and other store events from RevenueCat (exact `Authorization` header)                                                   |
| `server/src/payments/`                    | both feeds normalised into one typed `EntitlementState`; new Paddle subscriptions are posted to RevenueCat (`/v1/receipts`, `X-Platform: paddle`) so the apps see them too |
| `server/src/datasources/entitlement.ts`   | idempotent apply: each event id is claimed once (`WebhookEvent`), older events never overwrite newer ones, a failed apply releases the claim so the provider's retry works |
| `*/keyGuard.ts`                           | the server and Vite refuse to start when a test or sandbox run holds a production key (`pdl_live_`, `live_`, RevenueCat store or `sk_` keys, `sk_live_` Stripe)            |

## Who RevenueCat sees

RevenueCat's `app_user_id` is the ingré user's Mongo ObjectId everywhere: the web SDK is
configured with it (`webEntitlement`), Paddle checkouts carry it as `ingre_user_id`, and the
server only accepts an ObjectId from a webhook (`userIdOf`), so `$RCAnonymousID:` ids and
emails are ignored.

The iOS and Android apps still buy through StoreKit 2 and Play Billing directly, checked by
`submitStorePurchase` (#314); they don't use the RevenueCat SDK yet, so their purchases reach
RevenueCat only if its store server notifications are connected, and then without an ingré
user id. Before the apps move to RevenueCat (a separate change):

- configure `Purchases` anonymously at launch; call `Purchases.shared.logIn(userId)` (Swift)
  or `Purchases.sharedInstance.logInWith(userId)` (Kotlin) with the JWT's `data._id` straight
  after sign-in, and again at launch when a stored token is restored;
- on sign-out call `logOut()` only when `isAnonymous` is false (it throws otherwise);
- replace `submitStorePurchase` for new purchases, not run both, so one purchase isn't
  applied twice under two subscription ids.

## Tax display

| Region                   | Tax mode  | Cards and order summary                                     |
| ------------------------ | --------- | ----------------------------------------------------------- |
| US, Canada               | exclusive | price before tax; "Sales tax (rate)" as its own line; total |
| UK, EU, Australia, India | inclusive | one total; "Includes VAT/GST (rate): amount" under it       |

The tax amount and rate always come from Paddle's pricing preview for the customer's
country, never from the app.

## Regional prices (minor units, month / year)

Yearly is 10 months. Converted prices end in .99 (INR: whole tens minus 1). Set these as
**price overrides per country** on the six Paddle prices so Paddle charges exactly what
the page shows.

| Region | Currency | Explorer       | Manager        | Leader         | Billing                                                   |
| ------ | -------- | -------------- | -------------- | -------------- | --------------------------------------------------------- |
| US     | USD      | 400 / 4000     | 800 / 8000     | 1600 / 16000   | monthly by default                                        |
| CA     | CAD      | 599 / 5599     | 1199 / 11099   | 2299 / 22099   | monthly by default                                        |
| GB     | GBP      | 399 / 3199     | 699 / 6399     | 1299 / 12699   | monthly by default                                        |
| EU     | EUR      | 399 / 3699     | 799 / 7399     | 1499 / 14799   | monthly by default                                        |
| AU     | AUD      | 699 / 6199     | 1299 / 12399   | 2499 / 24799   | monthly by default                                        |
| IN     | INR      | 11900 / 117900 | 23900 / 235900 | 47900 / 470900 | 65% PPP discount; yearly by default; Explorer yearly only |

A tier is yearly only where Paddle's fee (5% + 50¢) would take more than 25% of a monthly
payment. Lower-priced PPP regions default to yearly.

## Environment

- Client: `client/.env.example` (copy to `client/.env`). `client/.env.test` holds sandbox
  placeholders for `vite --mode test` (the e2e suite).
- Server: `server/.env.EXAMPLE` (copy to `server/.env`). `server/.env.test` holds sandbox
  placeholders loaded by `npm run start:e2e`.
- `.env` files are git-ignored. Never commit a real key.

## Tests

- Unit: `client/src/utils/payments/__tests__/`, `client/src/pages/Checkout/__tests__/`,
  `server/src/payments/`, `server/src/webhooks/`, `server/src/datasources/entitlement.test.ts`.
  Paddle webhooks are signed for real with the SDK's scheme; the RevenueCat API is a local
  stand-in.
- End to end: `automation/tests/checkout-localization.spec.ts` (US, Germany, India). Paddle.js,
  Paddle's pricing-preview API, the overlay and RevenueCat's API are `page.route` stand-ins
  (`automation/tests/paddle.ts`); the client, server and sign-up are real.

## Going live

1. Sign-off from Alana (finance) for Paddle and RevenueCat.
2. Paddle: verify the seller account; create products Explorer, Manager and Leader, each with a
   monthly and a yearly price, `custom_data` `{"ingre_tier": "EXPLORER"}` (etc.), and the country
   overrides above. Set the price ids as `VITE_PADDLE_PRICE_<TIER>_<MONTH|YEAR>`.
3. Paddle: create a client-side token (`live_...`) as `VITE_PADDLE_CLIENT_TOKEN`, set
   `VITE_PADDLE_ENVIRONMENT=production`, and approve the web domain.
4. Paddle: add a notification destination for `https://ingre-backend.onrender.com/paddle/webhook`
   with the `subscription.*` events; its secret is `PADDLE_WEBHOOK_SECRET`. Set
   `PADDLE_ENVIRONMENT=production` and `PADDLE_API_KEY=pdl_live_...` on the server.
5. RevenueCat: create the project's Paddle app (connect Paddle), App Store and Google Play apps,
   entitlements `explorer`, `manager`, `leader`, and attach each store's products. Put the Paddle
   app's public key in `REVENUECAT_API_KEY` and the Web Billing public key (`rcb_...`) in
   `VITE_REVENUECAT_WEB_API_KEY`.
6. RevenueCat: add a webhook to `https://ingre-backend.onrender.com/revenuecat/webhook` with an
   Authorization header value, the same value as `REVENUECAT_WEBHOOK_AUTH`; set
   `REVENUECAT_ENVIRONMENT=production`.
7. Run one sandbox purchase end to end (Paddle sandbox, RevenueCat sandbox), then switch the keys.
