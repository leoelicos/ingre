import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { assertPaymentKeys } from './src/utils/payments/keyGuard'

/** Paddle + RevenueCat: one Paddle price id per tier and interval. */
const PRICE_ENV = {
  EXPLORER_month: 'VITE_PADDLE_PRICE_EXPLORER_MONTH',
  EXPLORER_year: 'VITE_PADDLE_PRICE_EXPLORER_YEAR',
  MANAGER_month: 'VITE_PADDLE_PRICE_MANAGER_MONTH',
  MANAGER_year: 'VITE_PADDLE_PRICE_MANAGER_YEAR',
  LEADER_month: 'VITE_PADDLE_PRICE_LEADER_MONTH',
  LEADER_year: 'VITE_PADDLE_PRICE_LEADER_YEAR'
} as const

export default defineConfig(({ mode }) => {
  // .env, .env.[mode] (e.g. .env.test), then the real environment, which wins
  const env: Record<string, string | undefined> = {
    ...loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), 'VITE_'),
    ...process.env
  }
  // Paddle + RevenueCat: a test or sandbox run with a production key stops here
  assertPaymentKeys({
    mode,
    paddleEnvironment: env['VITE_PADDLE_ENVIRONMENT'] ?? '',
    paddleToken: env['VITE_PADDLE_CLIENT_TOKEN'] ?? '',
    revenueCatKey: env['VITE_REVENUECAT_WEB_API_KEY'] ?? ''
  })
  const priceIds = Object.fromEntries(
    Object.entries(PRICE_ENV).map(([key, name]) => [key, env[name] ?? ''])
  )
  return {
    plugins: [react()],
    // Exposes Vite's mode as a typed compile-time constant (see src/appMode.ts).
    define: {
      __APP_MODE__: JSON.stringify(mode),
      // optional API URL override, e.g. the e2e server (see automation/)
      __GRAPHQL_URL__: JSON.stringify(env['VITE_GRAPHQL_URL'] ?? ''),
      // #312: Stripe's publishable key (pk_test_ only); unset keeps the hosted checkout
      __STRIPE_PUBLISHABLE_KEY__: JSON.stringify(
        env['VITE_STRIPE_PUBLISHABLE_KEY'] ?? ''
      ),
      // Paddle + RevenueCat (src/utils/payments/config.ts); unset keeps checkout off
      __PADDLE_CLIENT_TOKEN__: JSON.stringify(
        env['VITE_PADDLE_CLIENT_TOKEN'] ?? ''
      ),
      __PADDLE_ENVIRONMENT__: JSON.stringify(
        env['VITE_PADDLE_ENVIRONMENT'] ?? ''
      ),
      __PADDLE_PRICE_IDS__: JSON.stringify(JSON.stringify(priceIds)),
      __REVENUECAT_WEB_API_KEY__: JSON.stringify(
        env['VITE_REVENUECAT_WEB_API_KEY'] ?? ''
      ),
      // Firebase Auth (src/utils/auth/firebase.ts); unset keeps the legacy login
      __FIREBASE_CONFIG__: JSON.stringify(
        JSON.stringify({
          apiKey: env['VITE_FIREBASE_API_KEY'] ?? '',
          authDomain: env['VITE_FIREBASE_AUTH_DOMAIN'] ?? '',
          projectId: env['VITE_FIREBASE_PROJECT_ID'] ?? '',
          appId: env['VITE_FIREBASE_APP_ID'] ?? ''
        })
      )
    },
    server: {
      port: 3000,
      proxy: {
        '/graphql': 'http://localhost:3001'
      }
    },
    /* the speech model's worker (#207) loads transformers.js lazily, which needs ES workers */
    worker: { format: 'es' },
    build: {
      outDir: 'build',
      target: 'es2022'
    }
  }
})
