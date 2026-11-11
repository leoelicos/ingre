# Auth platforms

## Biometric login (#284)

| Platform    | Mechanism                        | When shown                           |
| ----------- | -------------------------------- | ------------------------------------ |
| Desktop web | WebAuthn platform authenticator  | Only if `PublicKeyCredential` exists |
| iOS         | Face ID / Touch ID               | Always in the native app             |
| Android     | BiometricPrompt                  | Always in the native app             |

Success stores the same JWT as password login. Failure falls back to email and password.

## Google OAuth (#285)

| Platform    | Mechanism                                           |
| ----------- | --------------------------------------------------- |
| Desktop web | Google Identity Services / OAuth redirect           |
| iOS         | ASWebAuthenticationSession                          |
| Android     | Chrome Custom Tabs                                  |

Desktop opens the Google authorize URL. iOS and Android pass `platform=ios|android` so the native app can use a system browser session. The server maps the Google identity onto an existing user or creates one, then issues the same JWT.
