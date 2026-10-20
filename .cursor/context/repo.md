# Repo

Monorepo. Node `22.x` (`package.json` engines). npm only; yarn lockfiles were removed.

| Path | Role |
| --- | --- |
| `client/` | Vite + React app |
| `server/` | Express + Apollo |
| `automation/` | Playwright e2e (real client + server, in-memory Mongo, WireMock as Stripe) |
| `docs/` | `TODO.md`, test-mock notes |
| `scripts/convert-catalogue.py` | Rebuilds the JSON catalogues |
| `vercel.json` | SPA rewrite to `index.html` |
| `MODERNIZATION.md` | Upgrade history, not product spec |

Each package has its own `package.json` and `package-lock.json`. Root `npm run install` installs both.

Client source is `client/src`. Server source is `server/src` plus `server/server.ts` and `server/config`.
