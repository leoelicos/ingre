# Deploy

Frontend: Vercel, from `main`, plus a preview per pull request. Site: https://ingre.vercel.app/

`vercel.json` rewrites every path to `/index.html` so client routes work. Node 22 is pinned for Vercel. The build is the client Vite build; files land in `client/build`.

Backend: Render, https://ingre-backend.onrender.com/graphql. Free tier sleeps; the first request after idle can take about 30 seconds. Database is MongoDB through Mongoose.

Production mode (`APP_MODE === 'production'`) is the only client mode that calls Render. Local dev calls port 3001.

Do not put secrets in the repo. Server env is read at process start (Mongo URL, JWT secret, Stripe).

## Server pipeline

`main` is production. Pushes to `main` that touch `server/**` run `.github/workflows/server-deploy.yml`, which POSTs the `RENDER_DEPLOY_HOOK` secret. That secret is the deploy hook URL from the Render service.

Do not merge to `main` unless the change is production-ready.
