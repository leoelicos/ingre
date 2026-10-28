# Mobile (iOS & Android) Setup for Production

This project uses [Capacitor](https://capacitorjs.com/) to wrap the React web app as native iOS and Android applications.

## Local development

```bash
cd client
npm ci
npm run build          # or npm start for live reload
npx cap sync
npx cap open ios       # requires macOS + Xcode
npx cap open android   # requires Android Studio
```


## Debug APK from CI (easiest for testing)

On every pull request (and on manual workflow runs) the Android workflow builds a debug APK and uploads it as an artifact.

1. Open the PR or go to the Actions tab.
2. Click the **Mobile Android** workflow run.
3. Scroll to **Artifacts** and download `app-debug-apk`.
4. Transfer the APK to an unmanaged Android device and install it
   (allow “Install unknown apps” for the file manager if prompted).

The workflow log prints a direct link to the run.

## Production pipelines

GitHub Actions workflows:

- `.github/workflows/mobile-android.yml` — builds a signed AAB and uploads to Google Play production track on tags `v*`.
- `.github/workflows/mobile-ios.yml` — builds a signed IPA and uploads to App Store Connect / TestFlight on tags `v*`.

### Required secrets

#### Android

| Secret | Description |
|--------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded `.keystore` or `.jks` file |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | JSON key for a Google Play service account with release permissions |

#### iOS

| Secret | Description |
|--------|-------------|
| `IOS_BUILD_CERTIFICATE_BASE64` | Base64-encoded `.p12` distribution certificate |
| `IOS_P12_PASSWORD` | Password for the `.p12` |
| `IOS_PROVISION_PROFILE_BASE64` | Base64-encoded `.mobileprovision` distribution profile |
| `IOS_KEYCHAIN_PASSWORD` | Temporary keychain password (any strong random string) |
| `APPLE_TEAM_ID` | Your Apple Developer Team ID |
| `APPLE_ID` | Apple ID email used for altool |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password for the Apple ID |

### App identifiers

- Bundle ID / package name: `com.leoelicos.ingre`
- App name: `ingre`

### Notes

- Tag a release (`git tag v1.0.0 && git push --tags`) to trigger production uploads.
- You can also run the workflows manually via the Actions tab (`workflow_dispatch`).
- Icons currently use Capacitor defaults. Replace `client/android/app/src/main/res/mipmap-*/ic_launcher*.png` and the iOS `AppIcon.appiconset` assets with your branded icons before store submission.
- The web build output directory is `client/build` (configured in `vite.config.mts` and `capacitor.config.ts`).
