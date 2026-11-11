# Store subscriptions in the native apps (#314)

The three tiers from #312 sold inside the native apps through each store's own billing, which Apple and Google require for digital subscriptions bought in an app. Native only: `android/` (Kotlin + Compose) and `ios/` (SwiftUI). Not the Capacitor projects.

Everything is **off** until you finish the setup below:

- The apps hide Plans unless the `tiers` flag is on. Android: build with `-Pingre.tiers=true`. iOS: the `INGRE_TIERS` Swift condition, or the `-IngreTiers YES` launch argument (UI tests use this). Store builds you publish now have no Plans and sell nothing.
- The server refuses every store purchase (`STORE_NOT_CONFIGURED`) until that store's credentials are set, and the notification endpoints answer 503. A purchase is never trusted without the store confirming it.
- No paid services or dependencies: Google Play Billing Library (Google's own), StoreKit 2 (Apple's own), and the server talks to both stores' APIs with `node:crypto` and `fetch`. No RevenueCat.

| Tier     | Price          | Product id (both stores, = Stripe lookup key) | App Store group level |
| -------- | -------------- | --------------------------------------------- | --------------------- |
| Explorer | 4 USD a month  | `ingre_explorer_monthly`                      | 3                     |
| Manager  | 8 USD a month  | `ingre_manager_monthly`                       | 2                     |
| Leader   | 16 USD a month | `ingre_leader_monthly`                        | 1 (highest)           |

## How it works

1. The app shows Plans (signed in only) with each store's local price.
2. Choosing a tier opens the store's purchase sheet. The purchase is tied to the account: Android sends the user id as `obfuscatedAccountId`; iOS sends it as `appAccountToken` (the ObjectId zero-padded to a UUID).
3. The app sends the purchase to `submitStorePurchase(platform, productId, purchaseToken)`: Google's purchase token, or StoreKit's signed transaction (JWS).
4. The server checks it with the store, then sets the same fields as Stripe (#312): `active`, `subscriptionStatus`, `tier`, plus `storePlatform`, `storeProductId`, `storeId`, `storeExpiresAt`.
   - Google: Play Developer API `purchases.subscriptionsv2.get` with the service account, then acknowledges it if needed.
   - Apple: the JWS chain must end at Apple Root CA - G3 (pinned in `server/src/store/appleRoot.ts`), then the current status is read from the App Store Server API with the In-App Purchase key.
   - A purchase tied to another account, or already held by another user, is refused.
5. Only after the server confirms does the app acknowledge (Android) or finish (iOS) the purchase. Google refunds a purchase that isn't acknowledged in 3 days; StoreKit re-offers an unfinished transaction. So a purchase the server can't confirm is never kept.
6. Renewals, lapses, refunds and tier changes reach the server through store notifications; each one is re-read from the store before anything changes.

Switching tiers: Android upgrades now with the price difference (`CHARGE_PRORATED_PRICE`) and downgrades at the next renewal (`DEFERRED`). On iOS the subscription group does the same by level.

Statuses use Stripe's words so one rule decides `active` and `tier`: active (incl. grace period, and cancelled-but-paid-up), `past_due` (billing retry / on hold / paused), `canceled` (expired, revoked), `incomplete` (pending).

## Server environment (Render)

| Variable                           | What                                                             |
| ---------------------------------- | ---------------------------------------------------------------- |
| `GOOGLE_PLAY_PACKAGE_NAME`         | `com.leoelicos.ingre`                                            |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | the service account's JSON key, as is or base64                  |
| `GOOGLE_RTDN_TOKEN`                | any long random string; also put in the Pub/Sub push URL (below) |
| `APPLE_BUNDLE_ID`                  | `com.leoelicos.ingre`                                            |
| `APPLE_IAP_KEY_ID`                 | the In-App Purchase key's id                                     |
| `APPLE_IAP_ISSUER_ID`              | the Issuer ID on the same page                                   |
| `APPLE_IAP_PRIVATE_KEY`            | the `.p8` file's contents (newlines as `\n`, or base64)          |

Never commit these. Without a store's variables that store stays off.

Endpoints:

- `POST /graphql` `submitStorePurchase`
- `POST /store/google/rtdn?token=<GOOGLE_RTDN_TOKEN>`: Google Real-time developer notifications (Pub/Sub push)
- `POST /store/apple/notifications`: App Store Server Notifications V2

## What you need to set up later

None of this costs money beyond each store's developer fee. Do it when you're ready to charge.

### Before either store: ABN, tax and banking

- To sell subscriptions you must accept each store's paid apps agreement and give tax and bank details. You can publish free apps as an individual without an ABN, but Apple asks Australian developers for an ABN (and GST status) in the Paid Apps agreement's tax forms, and Google's payments profile asks for tax details. Sort the ABN out first.
- Both stores take 15% under their small business programs (Apple App Store Small Business Program, Google's 15% service fee tier). Enrol in Apple's program; Google applies the 15% tier to subscriptions automatically.
- Finance sign-off (Alana) before charging, as with any paid service.

### Google Play Console

1. **Payments profile**: Setup → Payments profile; link a merchant account (tax and bank details here).
2. **Products**: Monetise → Products → Subscriptions → Create subscription, three times, with the product ids above. For each add one **auto-renewing monthly base plan** (any base plan id, e.g. `monthly`) with the price, and activate it. The app picks the base plan (the offer without an offer id).
3. **Service account** for the server:
   - Google Cloud console (same project as Play, or link one under Play Console → Setup → API access): create a service account, create a JSON key, and paste it into `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`.
   - Play Console → Users and permissions → Invite new user → the service account's email → app permissions for ingre: **View financial data** and **Manage orders and subscriptions**. It can take up to 24 hours to work.
   - Enable the **Google Play Android Developer API** in that Cloud project.
4. **Real-time developer notifications**:
   - Cloud console → Pub/Sub → create a topic (e.g. `play-billing`), and grant `google-play-developer-notifications@system.gserviceaccount.com` the **Pub/Sub Publisher** role on it.
   - Create a **push** subscription on the topic with endpoint `https://ingre-backend.onrender.com/store/google/rtdn?token=<GOOGLE_RTDN_TOKEN>`.
   - Play Console → Monetise → Monetisation setup → Real-time developer notifications: the topic name, then **Send test notification** (the server answers it and ignores it).
5. **Testing**: Setup → License testing: add your Google account; upload a build with the flag on (`./gradlew bundleRelease -Pingre.tiers=true`) to an internal testing track. License testers buy with test cards and renewals are sped up (monthly renews every 5 minutes).

### App Store Connect

1. **Agreements, Tax and Banking**: accept the Paid Apps agreement and fill in tax (ABN) and bank details. Products can't be sold until it's active.
2. **App**: create the app with bundle id `com.leoelicos.ingre` (already in `ios/project.yml`).
3. **Subscription group**: your app → Monetisation → Subscriptions → create a group named `ingre plans`, then three auto-renewable subscriptions with the product ids above, duration 1 month, the prices, and a display name and description each. Levels: Leader 1, Manager 2, Explorer 3 (same as `ios/Ingre.storekit`). Each needs a review screenshot before first submission.
4. **In-App Purchase key** for the server: Users and Access → Integrations → In-App Purchase → generate a key. Download the `.p8` (only once) → `APPLE_IAP_PRIVATE_KEY`; the Key ID → `APPLE_IAP_KEY_ID`; the Issuer ID → `APPLE_IAP_ISSUER_ID`.
5. **Server notifications**: your app → App Information → App Store Server Notifications → **Version 2** for both Production and Sandbox, URL `https://ingre-backend.onrender.com/store/apple/notifications`.
6. **Testing without a Mac**: TestFlight builds buy in the sandbox for free (renewals sped up) and the server accepts Sandbox and Production. Builds are made on GitHub's macOS runners. Add a sandbox tester under Users and Access → Sandbox if you want a separate account. Xcode's local StoreKit testing (`ios/Ingre.storekit`) works in the simulator, but those transactions are signed by Xcode, so the server refuses them by design; the hosted `IngreTests` use them with a stand-in server.
7. App Review: the review build needs the flag on and the products submitted with it.

## Tests

- Server: `server/src/store/*.test.ts`, `datasources/store.test.ts`, `webhooks/store.test.ts`, `resolvers/user/submitStorePurchase.test.ts`. Apple's chain is made fresh per run (`test-utils/appleChain.ts`, a tiny DER writer, no committed keys); Google and Apple APIs are a fetch stand-in (`test-utils/fakeStores.ts`).
- Android: `./gradlew testDebugUnitTest` (`billing/*Test.kt`, fake Google Play and server).
- iOS: `swift test` in `ios/IngreCore` (tiers and the purchase flow with a fake App Store, on Linux in CI); `IngreTests` (StoreKit 2 against `Ingre.storekit` with `SKTestSession`) and `PlansUITests` on the simulator job.
