# Mobile apps

Ingre's phone apps are native, built from their own folders (#195):

- **Android**: Kotlin + Jetpack Compose in `android/`. See `android/README.md`. The **Native Android** workflow (`.github/workflows/android-native.yml`) builds a debug APK on pull requests that touch `android/**`, or on manual runs.
- **iOS**: Swift + SwiftUI in `ios/`. See the "Native iOS app" section of the root `README.md`. The **native** workflow (`.github/workflows/native.yml`) runs the `IngreCore` unit tests and the UI tests on an iPhone simulator.

The web app in `client/` is web only. The earlier Capacitor wrapper of it (`client/android`, `client/ios` and the `mobile-android` / `mobile-ios` release workflows) was removed before any store release.

Store releases (signing, Google Play and TestFlight uploads) are not set up yet for the native apps.

## Store identity

Neither app has been published, so these are the first values the stores will see. The app ID can never change after the first upload.

| | Android | iOS |
| --- | --- | --- |
| App ID | `applicationId = "com.leoelicos.ingre"` (`android/app/build.gradle.kts`) | `PRODUCT_BUNDLE_IDENTIFIER: com.leoelicos.ingre` (`ios/project.yml`) |
| Test bundles | n/a | `com.leoelicos.ingre.tests` (unit), `com.leoelicos.ingre.uitests` (UI) |
| Name people see | `app_name` = `INGRE` (`res/values/strings.xml`) | `INFOPLIST_KEY_CFBundleDisplayName: INGRE` |
| Minimum OS | Android 8.0 (`minSdk = 26`) | iOS 17 (`deploymentTarget`, and `platforms` in `ios/IngreCore/Package.swift`) |
| Version shown to people | `versionName = "1.0.0"` | `MARKETING_VERSION: 1.0.0` |
| Build number | `versionCode = 1` | `CURRENT_PROJECT_VERSION: 1` |

The version and build number each live in one place: `android/app/build.gradle.kts` (`defaultConfig`) and the project-wide `settings.base` in `ios/project.yml` (every iOS target inherits it; run `xcodegen generate` after editing).

### Bumping for a release

- **Version** (`1.0.0`): semantic version, the same on both platforms for the same release. Raise the patch for fixes, the minor for features.
- **Build number**: a whole number that only goes up. Google Play rejects any `versionCode` it has already seen, and App Store Connect rejects a repeated `CURRENT_PROJECT_VERSION` for the same version. Raise it for every upload, including a re-upload of the same version.

### Icons and launch screens

The icon is the egg from `client/public/images/ingre-icon.svg` (#296) on a transparent background. A solid fill is added only where a platform needs one, using `--palette-cream` `#FFF8F0`.

The name people see is uppercase `INGRE`. Code, IDs and package names stay lowercase `ingre`.

- **Android**: `android/app/src/main/res/mipmap-*`. The adaptive icon is the transparent egg foreground on the `@color/ic_launcher_background` layer (cream). The legacy `ic_launcher` and `ic_launcher_round` PNGs are the transparent egg. The launch screen uses the Android 12 SplashScreen API through `androidx.core:core-splashscreen` (`Theme.Ingre.Starting`, `installSplashScreen()` in `MainActivity`): the egg (`drawable/ic_splash.xml`) on `@color/splash_background`.
- **iOS**: `ios/Ingre/Assets.xcassets` holds three assets. `AppIcon` is one 1024 px image, and Xcode makes the other sizes. The App Store icon can't have transparency, so the default icon is the egg flattened onto cream; the dark-appearance variant (iOS 18+) is the transparent egg. `LaunchIcon` is the transparent egg and `LaunchBackground` is the launch colour. The launch screen is the `UILaunchScreen` entry in `ios/Ingre/Info.plist`, merged with the generated Info.plist keys.
- **Colours**: the web app's page background from `client/src/styles/theme.css`: `--palette-cream` `#FFF8F0` in light mode, `--palette-night` `#141815` in dark mode.

### Privacy manifest (iOS)

`ios/Ingre/PrivacyInfo.xcprivacy` is bundled with the app. Today it declares no tracking and no required-reason APIs. Collected data is limited to email address and purchase history, linked to the account and used only for app functionality, because Plans (#314) signs in and sends App Store transactions to the server. Update it in the same PR as any change that adds one of those, for example `UserDefaults` (required-reason API `NSPrivacyAccessedAPICategoryUserDefaults`, reason `CA92.1`), accounts, network calls or purchases.
