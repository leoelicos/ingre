# Auth platforms

## Biometric login (#284)

| Platform    | Mechanism                       | When shown                           |
| ----------- | ------------------------------- | ------------------------------------ |
| Desktop web | WebAuthn platform authenticator | Only if `PublicKeyCredential` exists |
| iOS         | Face ID / Touch ID              | Always in the native app             |
| Android     | BiometricPrompt                 | Always in the native app             |

Success stores the same JWT as password login. Failure falls back to email and password.

## Google OAuth (#285)

| Platform    | Mechanism                                 |
| ----------- | ----------------------------------------- |
| Desktop web | Google Identity Services / OAuth redirect |
| iOS         | ASWebAuthenticationSession                |
| Android     | Chrome Custom Tabs                        |

Desktop opens the Google authorize URL. iOS and Android pass `platform=ios|android` so the native app can use a system browser session. The server maps the Google identity onto an existing user or creates one, then issues the same JWT.

## Firebase Auth

Firebase holds the passwords, Google sign-in and sessions; the API only checks Firebase
ID tokens. The ingré user id stays the Mongo `_id`, so Paddle's `ingre_user_id`,
RevenueCat's `app_user_id` (purchases-js `appUserId`) and every webhook are unchanged.

| Piece                                      | Where                                                       |
| ------------------------------------------ | ----------------------------------------------------------- |
| Token check (firebase-admin)               | `server/src/utils/firebase.ts`                              |
| Bearer token → user, legacy JWT fallback   | `server/src/context.ts`                                     |
| Find, link or create the user (data store) | `server/src/datasources/firebaseUser.ts`                    |
| Web sign-in (Firebase JS SDK)              | `client/src/utils/auth/firebase.ts`                         |
| Sign-in that the API must accept           | `client/src/utils/auth/useFirebaseSignIn.ts`                |
| ID token on every API request              | `withAuthHeaders` in `client/src/App.tsx`                   |
| Checkout's user id (from `getUser`)        | `useSignedInUser` in `client/src/pages/Checkout/account.ts` |

### Who a Firebase user is

`findOrCreateUserByFirebase` is the only code that touches the user store; the auth code
calls nothing else, so the Postgres cutover replaces that one function. In order:

1. the user whose `firebaseUid` is the token's uid;
2. an imported account: the uid is the account's Mongo id (see the import below) and the
   email matches;
3. the unlinked account with the token's email, only when Firebase has verified it
   (Google always has; email and password accounts haven't until the user verifies);
4. otherwise a new user (no password, names from the Firebase display name).

An unverified email that belongs to an account, or an email linked to another uid, is
refused, so nobody takes over an account by signing up with its email. The web app then
signs out of Firebase and shows "Couldn't log you in."

`User.firebaseUid` is unique and sparse. Postgres: `0002_firebase_uid.sql` adds
`users.firebase_uid` (unique) and lets `password_hash` be null; the backfill copies it.

### During the move (TRANSITION)

- The API accepts a Firebase ID token or the legacy JWT (`context.ts`). The native apps
  and the e2e suite still use the JWT `login` / `addUser` mutations.
- The web app uses Firebase when all four `VITE_FIREBASE_*` values are set, else the
  legacy login. Passwords need at least 6 characters (Firebase's minimum).
- Revocation isn't checked per request: a disabled or revoked account's ID token works
  until it expires (at most an hour).
- Remove the JWT branch, `signToken`, `login`, `addUser` and the bcrypt hashes once every
  client signs in with Firebase.

### Setting up Firebase

1. Create a Firebase project (Spark, the free plan, covers email and Google sign-in; ask
   Alana before anything that moves it to Blaze or Identity Platform).
2. Authentication > Sign-in method: turn on **Email/Password** and **Google**. Keep
   "One account per email address" (the default).
3. Authentication > Settings > Authorised domains: add `ingre.vercel.app` and the
   Vercel preview domain.
4. Project settings > Your apps: add a web app and put its `apiKey`, `authDomain`,
   `projectId` and `appId` in Vercel as `VITE_FIREBASE_API_KEY`,
   `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
5. Project settings > Service accounts: generate a private key and put the JSON (as is
   or base64) in Render as `FIREBASE_SERVICE_ACCOUNT_JSON`. Never commit it.

### Importing existing passwords

Users keep their passwords: Firebase imports the bcrypt hashes as they are. Give each
account its Mongo id as the Firebase uid, so the API links it on first sign-in (step 2
above) without the email needing to be verified.

```
# users.json: {"users":[{"localId":"<Mongo _id>","email":"…","emailVerified":false,
#   "passwordHash":"<base64 of the bcrypt string>","displayName":"First Last"}]}
firebase auth:import users.json --hash-algo=BCRYPT --project <project-id>
```

`passwordHash` is the base64 encoding of the whole `$2b$10$…` string from
`User.password`. Export from a read-only copy, keep the file off the repo and delete it
afterwards. Accounts created after the export link by verified email instead.

### Native apps (not in this change)

iOS and Android still sign in with the JWT. To move them: add the Firebase SDKs
(`FirebaseApp.configure()`), sign in with Firebase, send `getIDToken()` /
`getIdToken(false)` as the Bearer token, and read the ingré id from `getUser` for
RevenueCat's `logIn` (see `docs/PADDLE_REVENUECAT.md`, "Who RevenueCat sees").
