# Auth and pro

Optional. Shopping and hearts do not require it.

Client: `utils/auth/AuthContext.tsx`, `hooks/useAuth.ts`. The JWT is `localStorage` key `id_token`. `authHeaders` in `App.tsx` sends `Bearer` when that key is set.

Screens: `pages/Admin/Login.tsx`, `Signup.tsx`, `Upgrade.tsx`, `Success.tsx`. Styles: `pages/Admin/auth.css`.

Server: `server/src/utils/auth.ts` checks the bearer token. `requireUser.ts` guards resolvers that need a user. Password hashing is bcrypt 6. Tokens are jsonwebtoken 9.

Pro is a user flag flipped after Stripe checkout (`makeUserPro`, `datasources/stripe.ts`). A cancelled checkout returns to `/upgrade?checkout=cancelled`; Upgrade shows that, or an alert when checkout cannot start. `STRIPE_API_HOST`/`_PORT`/`_PROTOCOL`/`_KEY` point stripe-node at a stand-in (e2e only); unset in production. The shopper flow and the recipe page do not gate on it.

Saved recipes in Mongo are separate from device hearts. The Saved page reads hearts, not `getSavedRecipes`.
