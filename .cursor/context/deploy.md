# Deploy

Frontend: Vercel, from `main`, plus a preview per pull request. Site: https://ingre.vercel.app/

`vercel.json` rewrites every path to `/index.html` so client routes work. Node 22 is pinned for Vercel. The build is the client Vite build; files land in `client/build`.

Backend: Render, https://ingre-backend.onrender.com/graphql. Free tier sleeps; the first request after idle can take about 30 seconds. Database is Postgres (`DATABASE_URL`; host pending Alana's sign-off). Until the cutover in docs/POSTGRES_MIGRATION.md runs, production is still on MongoDB from the last Mongo deploy: merging the Postgres server to `main` is the cutover.

Production mode (`APP_MODE === 'production'`) is the only client mode that calls Render. Local dev calls port 3001.

Do not put secrets in the repo. Server env is read at process start (`DATABASE_URL`, JWT secret, Stripe, Paddle, RevenueCat, Firebase).

## Server pipeline

`main` is production. Pushes to `main` that touch `server/**` run `.github/workflows/server-deploy.yml`, which POSTs the `RENDER_DEPLOY_HOOK` secret. That secret is the deploy hook URL from the Render service.

Do not merge to `main` unless the change is production-ready.
