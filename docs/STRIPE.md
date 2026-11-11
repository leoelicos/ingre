# Stripe for the three tiers (#312)

Test mode only. The server refuses any secret key that isn't `sk_test_…`; the client ignores any publishable key that isn't `pk_test_…`. No keys are committed: they come from the environment.

| Tier     | Price          | Lookup key               |
| -------- | -------------- | ------------------------ |
| Explorer | 4 USD a month  | `ingre_explorer_monthly` |
| Manager  | 8 USD a month  | `ingre_manager_monthly`  |
| Leader   | 16 USD a month | `ingre_leader_monthly`   |

## Configuration

| Where            | Variable                      | What                                                                                  |
| ---------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| server (Render)  | `STRIPE_SECRET_KEY`           | test-mode secret key, `sk_test_…` (Dashboard → Developers → API keys)                 |
| server (Render)  | `STRIPE_WEBHOOK_SECRET`       | the endpoint's signing secret, `whsec_…` (or the one `stripe listen` prints)          |
| server, optional | `STRIPE_PRICE_<TIER>`         | pins a tier's Price id; otherwise found by lookup key                                 |
| client (Vercel)  | `VITE_STRIPE_PUBLISHABLE_KEY` | test-mode publishable key, `pk_test_…`, read at build time (`vite.config.mts` define) |

Without `VITE_STRIPE_PUBLISHABLE_KEY` the Plans page keeps the hosted Stripe Checkout (#208), which is what the e2e suite exercises against WireMock.

## Products and Prices

```
cd server
STRIPE_SECRET_KEY=sk_test_... npm run stripe:setup
```

Creates one Product per tier (metadata `ingre_tier`) and a monthly recurring USD Price with the lookup key above. It is idempotent: a second run finds the Prices by lookup key and creates nothing; a missing Price is recreated on the existing Product. It prints the Price ids for the optional `STRIPE_PRICE_<TIER>` pins.

## Paying: Stripe.js `createToken`

1. Plans (with the `tiers` flag and a publishable key): **Choose Manager** opens a card form drawn by Stripe Elements (`@stripe/react-stripe-js` `CardElement`). The card number never reaches ingré.
2. **Pay** calls `stripe.createToken(cardElement)` and sends only the token id: `subscribe(tier: MANAGER, token: "tok_…")`.
3. The server attaches the token as the payment source of the user's Stripe Customer (created on first use, `metadata.userId`), then creates the subscription for the tier's Price, or moves an existing subscription to the new Price.
4. The user gets `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus` and `active` (true while `active` or `trialing`); an active subscription also sets `tier`.

`createToken` is Stripe's legacy Tokens API; Stripe now recommends PaymentMethods with Payment/Setup Intents (which also handle 3D Secure). It is used here because #312 asked for it. Moving to `createPaymentMethod` + a SetupIntent later only touches `CardSubscribe.tsx` and `BillingApi.subscribe`.

## Webhooks

`POST /stripe/webhook` (raw body, signature checked with `STRIPE_WEBHOOK_SECRET`; 503 until it is set, 400 on a bad signature). Handled:

| Event                                           | Effect                                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| `checkout.session.completed`                    | links the Customer to the user in `client_reference_id`                 |
| `customer.subscription.created/updated/deleted` | status, `active`, tier (from the Price's lookup key, else `ingre_tier`) |
| `invoice.paid`                                  | `active`                                                                |
| `invoice.payment_failed`                        | `past_due`, not active (tier kept)                                      |

A `canceled` or `incomplete_expired` subscription clears the tier. Locally:

```
stripe listen --forward-to localhost:3001/stripe/webhook   # prints whsec_… for STRIPE_WEBHOOK_SECRET
stripe trigger customer.subscription.updated
```

In the Dashboard (test mode), add an endpoint `https://ingre-backend.onrender.com/stripe/webhook` with the six events above.

## Test cards and tokens (https://docs.stripe.com/testing)

In the card form: `4242 4242 4242 4242` pays; `4000 0000 0000 0002` is declined; `4000 0000 0000 0341` attaches but the first charge fails. Any future expiry (12/34), any 3-digit CVC.

In tests (server `billing.test.ts`, `subscribe.test.ts`, against a local Stripe stand-in, `src/test-utils/fakeStripe.ts`):

| Token                     | Result                                                                  |
| ------------------------- | ----------------------------------------------------------------------- |
| `tok_visa`                | active subscription                                                     |
| `tok_mastercard`          | active (used to switch tiers)                                           |
| `tok_visa_chargeDeclined` | `card_declined` / `generic_decline`; can't be attached, no subscription |
| `tok_chargeCustomerFail`  | attaches, then the first charge fails: `incomplete`, not active         |
