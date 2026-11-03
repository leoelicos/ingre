# Mobile constraints (#241)

Mobile is the hard target, not the shrunk web page. These limits are why mobile interaction design is slower than web design, and they must be solved before feature logic feels finished. A feature is not done until it works within them at 390 px wide.

## The constraints

| Constraint | Rule | Where it is handled today |
| --- | --- | --- |
| Thumb reach | Primary actions sit in the lower half of the screen, within reach of one thumb (bottom-right first). Nothing important sits only in the top corners. | Bottom tab bar (PR #252, #227). Search stays at the top but is sticky (PR #256, #228); the bottom-right area is #210. |
| Keyboard coverage | The soft keyboard covers about half the screen. The field being typed in stays visible and high, and fixed bars at the bottom step aside while it is up. | `useKeyboardOpen` hides the tab bar and Scroll to top (PR #256, #228). The search header is sticky. |
| 44 pt targets | Every tappable control is at least 44 x 44 CSS px (the iOS 44 pt guide; WCAG 2.2 AA asks for 24 px, we use the larger one). Space between neighbours so a thumb does not hit two. | `min-h-[44px] min-w-[44px]` on buttons, row toggles and menu items. Tests assert it for new controls. |
| Short sessions | A visit is seconds to a few minutes, often one-handed, often interrupted. State survives a reload and a lost connection; the first screen is useful without sign-in or setup. | List, picks and copies live on the device (`localStorage`). No account needed this phase. |
| Safe areas | Fixed bars pad by `env(safe-area-inset-bottom)` so the home indicator never covers a control. | `BottomNav`, the list bar. Note: `viewport-fit=cover` is not set, so browsers keep content inside the safe area and the padding is a safety net. If it is ever turned on, check every fixed element. |

## Rules for a change
1. Check it at 390 x 844 in Playwright (the `mobile` project) as well as 1280, and look at the screenshot.
2. One thumb: can the main action be reached and pressed without moving the hand?
3. Keyboard: with the keyboard up, is the field visible, and is nothing fixed covering it? Headless browsers have no soft keyboard, so tests fake `visualViewport` as `automation/tests/keyboard.spec.ts` does.
4. Targets: 44 px minimum, with room between neighbours.
5. Fixed or sticky elements: say what they cover and how they step aside (keyboard, popovers, the bottom bar).
6. Page-level `scroll-padding` closes React Aria popovers; use `scroll-margin` on focused controls instead (see `client/src/index.css`).
7. Gestures (swipe, long press) are shortcuts only. Each has a visible control that does the same.

## Known gaps
- No landscape-specific layout; landscape on a phone uses the vertical layout.
- The 44 px rule is enforced per control in tests, not globally. A lint-style test that walks every button would close this.
