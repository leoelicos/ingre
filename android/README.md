# Native Android (Kotlin + Jetpack Compose)

A native Kotlin app lives in `android/`. It is separate from the Capacitor projects under `client/android` and `client/ios`.

## Debug APK from CI

On pull requests that touch `android/**` (or manual runs) the **Native Android** workflow builds a debug APK and uploads it as `native-android-debug-apk`.

The workflow log prints a direct link to the run:

```
Native Android debug APK:
https://github.com/leoelicos/ingre/actions/runs/<run-id>
```

Download the artifact from that run and install it on an unmanaged Android device.
