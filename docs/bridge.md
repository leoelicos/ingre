# Platform bridge

Track where each feature currently exists.

| Feature                                   | Web   | Android | iOS   | Notes |
| ----------------------------------------- | ----- | ------- | ----- | ----- |
| Ingredient search                         | Yes   | —       | —     |       |
| Ingredient-first suggestions              | In PR | —       | —     | #243  |
| Fixed ingredient journey                  | In PR | —       | —     | #244  |
| Add ticket / list item                    | Yes   | —       | —     |       |
| Explore sections + colour                 | In PR | —       | —     | #249  |
| Guidance dial (self-directed ↔ hand-held) | In PR | —       | —     | #246  |
| War room (capture list + voice)           | In PR | —       | —     | #248  |
| Bottom navigation (four tabs)             | In PR | —       | —     | #252  |
| BRA (pantry/shopping)                     | In PR | —       | —     | #253  |
| Sticky search + keyboard handling         | In PR | —       | —     | #256  |
| Guest profiles                            | In PR | —       | —     | #250  |
| First-run carousel + TMD                  | In PR | —       | —     | #265  |
| Tiers (Explorer / Manager / Leader)       | In PR | —       | —     | #264  |
| Food-safety notes                         | In PR | —       | —     | #263  |
| Local analytics events                    | In PR | —       | —     | #261  |
| Postgres path (no cutover)                | In PR | —       | —     | #262  |
| Capacitor shell                           | In PR | In PR   | In PR | #202  |
| Import / export                           | Draft | —       | —     | #270  |
| Composed menus                            | Draft | —       | —     | #267  |
| Precise execution / cook plan             | Draft | —       | —     | #268  |
| Non-food items                            | Draft | —       | —     | #273  |
| Order-pad constraints                     | Draft | —       | —     | #274  |
| Seasonality                               | Draft | —       | —     | #266  |
| Logo / wordmark options                   | In PR | —       | —     | #251  |

## Legend

- **Yes** — on `main`
- **In PR** — open non-draft PR
- **Draft** — draft / WIP PR
- **—** — not started

## Rule

Web mobile is the reference. Android and iOS (Capacitor) must not drop a feature that is Yes or In PR on web without an explicit note here.
