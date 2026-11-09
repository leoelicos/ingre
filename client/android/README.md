# Android app (Capacitor shell)

The Android app in `client/android` wraps the web app (`client/build`) with Capacitor. It is not the native Kotlin app in the repository's top-level `android/` folder (#195).

## Updating the installed app without uninstalling (#296)

Android installs a new APK over the old one only when all three of these hold:

1. **Same application id:** `com.leoelicos.ingre` (`applicationId` in `app/build.gradle`, `appId` in `client/capacitor.config.ts`). Do not change it.
2. **Same signing key:** every debug APK must be signed with the one shared debug key. It is **not in the repository**; it lives in the repository secret **`ANDROID_DEBUG_KEYSTORE_BASE64`** (the keystore, base64-encoded). Do not regenerate or replace it.
   - Alias `androiddebugkey`, store and key password `android` (the standard Android debug values).
   - Certificate SHA-256: `4A:BD:01:DA:56:14:86:E8:FA:62:65:2A:D1:D4:D7:6C:54:1E:30:2A:62:8E:D2:6A:16:6F:71:E8:8A:83:4A:F2`.
   - **CI** (`.github/workflows/mobile-android.yml`) decodes the secret into `app/debug.keystore` before building. If the secret is missing (a fork, for example) it says so and builds with the runner's default key instead, and that APK will not install over one built by this repo's CI.
   - `app/build.gradle` signs debug builds with `app/debug.keystore` **when that file exists**, and otherwise falls back to Gradle's default `~/.android/debug.keystore`. A plain local build therefore works, but is signed with your own machine's key.
   - **To build locally an APK that installs over CI builds,** ask the repository owner for the key and save it as `client/android/app/debug.keystore` (it is in `client/android/.gitignore`; never commit it).
   - The keystore was committed on the `fix/296-android` branch (commit `8c88346`) and removed in a later commit, so it is still in that branch's history. It was moved to the secret rather than rewriting history, so phones that installed APKs signed with it keep updating.
3. **Higher version code:** `versionCode` in `app/build.gradle` must be higher than the installed build's. It is `2` (`versionName` `1.1`); the first builds were `1`. Raise it by one for each APK you hand out.

### Why uninstalling was needed before

Before #296, `app/build.gradle` had no debug signing config. Gradle then signs with `~/.android/debug.keystore` on whichever machine runs the build and creates that file if it is missing. The debug APK is built on a GitHub-hosted runner (`.github/workflows/mobile-android.yml`, `./gradlew assembleDebug`, artifact `app-debug-apk`), which is a fresh machine for every run, so each run signed with a different key. The three `app-debug-apk` artifacts from 28 October 2026 (runs 40614373960, 40671159471, 40671210743) each have a different signing certificate. A different key is why Android refused the update and the app had to be uninstalled. All three were `versionCode 1`, too.

An app already installed from one of those APKs was signed with a key that no longer exists. Uninstall it **one last time**; every debug APK built after #296 then updates in place.

## Building a debug APK

```sh
cd client
npm ci
npm run build
npx cap sync android
cd android
./gradlew assembleDebug   # app/build/outputs/apk/debug/app-debug.apk
```

Or run the **Mobile Android** workflow from the Actions tab (`workflow_dispatch`; it no longer runs on pull requests) and download the `app-debug-apk` artifact.

## Release builds

Release AABs for Google Play are signed with a separate release keystore from repository secrets (`ANDROID_KEYSTORE_BASE64` and friends; see `docs/MOBILE.md`). The shared debug key above is never used for releases.

## Icons and splash

The launcher icon, round icon, adaptive-icon foreground and splash screens are the egg from `client/public/images/ingre-icon.svg`, rasterised for every density (`app/src/main/res/mipmap-*`, `drawable*/splash.png`) on white (`@color/ic_launcher_background`). To change them, change that SVG and rasterise it again; do not draw new artwork here.
