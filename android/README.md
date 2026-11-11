# Native Android (Kotlin + Jetpack Compose)

A native Kotlin app lives in `android/`. It is the Android app; the web app in `client/` is web only.

## Debug APK from CI

On pull requests that touch `android/**` (or manual runs) the **Native Android** workflow builds a debug APK and uploads it as `native-android-debug-apk`.

The workflow log prints a direct link to the run:

```
Native Android debug APK:
https://github.com/leoelicos/ingre/actions/runs/<run-id>
```

Download the artifact from that run and install it on an unmanaged Android device.

## Plans (Google Play subscriptions, #314)

Off by default. Build with `./gradlew assembleDebug -Pingre.tiers=true` to show **Plans** under Account (signed in). Purchases go through Google Play Billing and only count after the server checks them with Google (`submitStorePurchase`). Setup in Play Console and on the server: `docs/STORE_SUBSCRIPTIONS.md`.
