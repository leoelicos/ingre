# Routes

Declared in `client/src/App.tsx`.

| Path | Screen |
| --- | --- |
| `/` | Home recipe grid |
| `/recipe/:id` | Recipe page |
| `/saved` | Hearted recipes on this device |
| `/ingredients` | Shopping flow (not an old ingredients page) |
| `/search` | Search (search now sits in the header) |
| `/tapoff` | Tap Off. Not in the header |
| `/login` `/signup` | Account |
| `/upgrade` `/success` | Stripe pro |
| `*` | No match |

Header shows only the logo, search and the account icon (`client/src/components/Header.tsx`). Log in and Sign up sit in the account icon menu, and Saved appears there after sign-in.

Home cards and the recipe page add recipes to the list. `/recipe/:id` is the recipe detail: serves, what to buy, method, add to list.
