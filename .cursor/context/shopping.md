# Shopping list

UI: `client/src/pages/ShoppingList/`. Logic: `client/src/utils/shopping/`.

Three steps, in order: `pick`, `home`, `shop`. Labels: Pick, At home, At the shop. Tabs on every width; swipe on touch (`swipe.ts`).

| Piece | Role |
| --- | --- |
| `ShoppingFlow.tsx` | Step shell, swipe, print, start-new |
| `PickStep.tsx` | Recipes chosen for this shop |
| `ShoppingListView.tsx` | At home and at the shop. Shop bar: "n of m in basket" and "I'm done shopping" |
| `TapOff.tsx` | Finish screen ("Shopping done"): basket and still-to-buy counts, no checklist |
| `ListRow.tsx` | One line, tick, undo |
| `AddItem.tsx` | Catalogue or free-text extra |
| `StartNewList.tsx` | Clears the list, 10s undo |
| `PrintSheet.tsx` | Print-only sheet |

Ticks wait, then move together (`usePendingTicks`). Have-at-home beats in-basket (`normaliseTicks`). Staples are assumed, not listed as already bought.

Amounts and plurals: `units.ts`. Shop sections: `sections.ts`. A row name uses `capitaliseFirst` at the start of a sentence.
