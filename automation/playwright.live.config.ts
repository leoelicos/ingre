import { defineConfig, devices } from '@playwright/test'
import { ports, urls } from './tests/env'

/**
 * Real-Firebase smoke (#320 Option A). Same auth flows as tests/auth.spec.ts,
 * against the real ingre-92a75 project. Does not start the Auth Emulator and
 * is not used by npm test or PR CI. Requires the real VITE_FIREBASE_* and
 * FIREBASE_SERVICE_ACCOUNT_JSON (see scripts/check-firebase-live-env.mjs).
 */
process.env['E2E_FIREBASE_LIVE'] = '1'

/* Empty strings win over a shell that exported the emulator hosts. */
const noEmulator = {
  FIREBASE_AUTH_EMULATOR_HOST: '',
  VITE_FIREBASE_AUTH_EMULATOR_HOST: ''
}

export default defineConfig({
  testDir: './tests',
  testMatch: 'auth.spec.ts',
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  /* live Auth is a network hop, so give the flows more time than the emulator */
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: process.env['CI']
    ? [['list'], ['html', { open: 'never' }]]
    : 'list',
  use: {
    baseURL: urls.client,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 }
      }
    }
  ],
  webServer: [
    {
      name: 'wiremock',
      command: `node scripts/check-firebase-live-env.mjs && npx wiremock --port ${ports.wiremock} --root-dir wiremock --global-response-templating --disable-banner`,
      url: `${urls.wiremock}/__admin/health`,
      reuseExistingServer: false,
      timeout: 60_000
    },
    {
      name: 'server',
      command: 'npm --prefix ../server run -s start:e2e',
      url: urls.graphql,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        PORT: String(ports.server),
        STRIPE_API_HOST: 'localhost',
        STRIPE_API_PORT: String(ports.wiremock),
        STRIPE_API_PROTOCOL: 'http',
        STRIPE_API_KEY: 'sk_test_e2e_dummy',
        FIREBASE_SERVICE_ACCOUNT_JSON:
          process.env['FIREBASE_SERVICE_ACCOUNT_JSON'] ?? '',
        ...noEmulator
      }
    },
    {
      name: 'client',
      /* --mode test: Paddle + RevenueCat sandbox placeholders from client/.env.test */
      command: `npm --prefix ../client run -s start -- --mode test --port ${ports.client} --strictPort`,
      url: urls.client,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        VITE_GRAPHQL_URL: urls.graphql,
        VITE_FIREBASE_API_KEY: process.env['VITE_FIREBASE_API_KEY'] ?? '',
        VITE_FIREBASE_AUTH_DOMAIN:
          process.env['VITE_FIREBASE_AUTH_DOMAIN'] ?? '',
        VITE_FIREBASE_PROJECT_ID: process.env['VITE_FIREBASE_PROJECT_ID'] ?? '',
        VITE_FIREBASE_APP_ID: process.env['VITE_FIREBASE_APP_ID'] ?? '',
        ...noEmulator
      }
    }
  ]
})
