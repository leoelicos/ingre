# Mobile apps

Ingre's phone apps are native, built from their own folders (#195):

- **Android**: Kotlin + Jetpack Compose in `android/`. See `android/README.md`. The **Native Android** workflow (`.github/workflows/android-native.yml`) builds a debug APK on pull requests that touch `android/**`, or on manual runs.
- **iOS**: Swift + SwiftUI in `ios/`. See the "Native iOS app" section of the root `README.md`. The **native** workflow (`.github/workflows/native.yml`) runs the `IngreCore` unit tests and the UI tests on an iPhone simulator.

The web app in `client/` is web only. The earlier Capacitor wrapper of it (`client/android`, `client/ios` and the `mobile-android` / `mobile-ios` release workflows) was removed before any store release.

Store releases (signing, Google Play and TestFlight uploads) are not set up yet for the native apps.
