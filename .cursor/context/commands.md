# Commands

From the repo root:

| Script | Effect |
| --- | --- |
| `npm run install` | Install server, then client |
| `npm run develop` | API watch + Vite together |
| `npm start` | API only |
| `npm run build` | `client` production build |
| `npm run seed` | Server seed script |

Client (`client/`): `npm start` (Vite, port 3000), `npm run build`, `npm test`, `npm run lint`.

Server (`server/`): `npm start` (`tsx server.ts`, port 3001), `npm run watch`, `npm test`, `npm run lint`.

GraphQL: `http://localhost:3001/graphql`. Vite proxies `/graphql` there. The browser client still calls the absolute URL from `graphqlEndpoint`.

The API does not listen until Mongo connects.
