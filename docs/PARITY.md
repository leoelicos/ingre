# Desktop / mobile parity ideas

Web mobile is the reference. Desktop and the Capacitor shells (iOS, Android) must complete the same core loop.

## Shared contract

- Search → select → suggestion → ticket works on every platform.
- Primary actions stay reachable: bottom-right on mobile, one click away on desktop.
- War room is a button, not a dial position, on every platform.
- Guidance dial exists on every platform; placement may differ.

## Desktop

- Same four-tab information architecture; actions can sit in a side cluster instead of the BRA.
- Keyboard replaces the virtual keyboard; sticky search must not jump.
- Biometric = WebAuthn when present; otherwise hidden.
- Google = standard OAuth redirect.

## iOS / Android

- Capacitor shell keeps thumb-zone, safe-area and keyboard behaviour from mobile web.
- Biometric = Face ID / Touch ID / BiometricPrompt.
- Google = Capacitor Google Auth or system browser session.
- No feature that is Yes on web is dropped without a row in `docs/bridge.md`.

## Bridge table

Track each feature as Web / Android / iOS in `docs/bridge.md`. Update the row when a platform ships it.

## Testing

- Unit test for the behaviour.
- e2e on mobile (390×844) and desktop projects.
- Reduced-motion assertion if motion is added.
