# Commands

From the repo root:

| Script | Effect |
| --- | --- |
| `npm run install` | Install server, then client |
| `npm run develop` | API watch + Vite together |
| `npm start` | API only |
| `npm run build` | `client` production build |
| `npm run seed` | Server seed script |
| `npm test` | Client + server unit tests, then the e2e suite (`automation/`) |
| `npm run test:e2e` | Only the Playwright e2e suite (needs Java 11+ for WireMock) |

Client (`client/`): `npm start` (Vite, port 3000), `npm run build`, `npm test`, `npm run lint`.

Server (`server/`): `npm start` (`tsx server.ts`, port 3001), `npm run start:e2e` (same server on an in-memory MongoDB), `npm run watch`, `npm test`, `npm run lint`.

E2E (`automation/`): `npm test`. See `automation/README.md`.

GraphQL: `http://localhost:3001/graphql`. Vite proxies `/graphql` there. The browser client still calls the absolute URL from `graphqlEndpoint`.

The API does not listen until Mongo connects.
