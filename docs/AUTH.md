# Auth platforms

## Biometric login (#284)

| Platform | Mechanism | When shown |
|----------|-----------|------------|
| Desktop web | WebAuthn platform authenticator | Only if `PublicKeyCredential` exists |
| iOS | Face ID / Touch ID via Capacitor | Always in the native shell |
| Android | BiometricPrompt via Capacitor | Always in the native shell |

Success stores the same JWT as password login. Failure falls back to email and password.

## Google OAuth (#285)

| Platform | Mechanism |
|----------|-----------|
| Desktop web | Google Identity Services / OAuth redirect |
| iOS | Capacitor Google Auth or ASWebAuthenticationSession |
| Android | Capacitor Google Auth or Chrome Custom Tabs |

The server exchanges the Google identity for the existing JWT session. A new user is created when no account matches the Google email.
