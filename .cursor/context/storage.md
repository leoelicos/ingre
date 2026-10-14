# Device storage

All shopper state is `localStorage`. Helpers: `client/src/utils/storage/`.

`readStored` / `writeStored` (`storage.ts`): bad JSON or a failed parse returns the fallback. `useStored` and `useStoredSet` subscribe the UI.

Keys in `shoppingState.ts`:

| Key | Holds |
| --- | --- |
| `ingre.list.picked` | Recipe ids on this list |
| `ingre.list.have` | Ticked at home |
| `ingre.list.basket` | Ticked in the basket |
| `ingre.list.locations` | Home-location overrides |
| `ingre.list.step` | Last flow step |
| `ingre.list.extras` | Hand-added lines |

`favourites.ts` is the heart set Saved reads. `people.ts` is the serves choice. `idb.ts` is unused legacy; do not build on it.

Start-new clears picks, ticks, and extras. It does not clear hearts or serves.
