# Routes

Declared in `client/src/App.tsx`.

| Path | Screen |
| --- | --- |
| `/` | Home recipe grid |
| `/recipe/:id` | Recipe page |
| `/saved` | Hearted recipes on this device |
| `/ingredients` | Shopping flow (not an old ingredients page) |
| `/search` | Search. Not in the header |
| `/tapoff` | Tap Off. Not in the header |
| `/login` `/signup` | Account |
| `/upgrade` `/success` | Stripe pro |
| `*` | No match |

Header links are only Recipes, Saved, and Shopping list (`client/src/components/Header.tsx`).

Home cards and the recipe page add recipes to the list. `/recipe/:id` is the recipe detail: serves, what to buy, method, add to list.
