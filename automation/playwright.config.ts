import { defineConfig, devices } from '@playwright/test'
import { ports, urls } from './tests/env'

/** where the production build for the preview server goes (git-ignored) */
const PREVIEW_DIR = '../automation/.preview-dist'

/*
 * One run = WireMock (Stripe stand-in) + the real server on an in-memory MongoDB
 * + the real client dev server pointed at that server + the production build on
 * vite preview (for #177). See README.md.
 */
export default defineConfig({
  testDir: './tests',
  /* one browser at a time: the WireMock request journal is shared by the Upgrade tests */
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
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
      command: `npx wiremock --port ${ports.wiremock} --root-dir wiremock --global-response-templating --disable-banner`,
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
        STRIPE_API_KEY: 'sk_test_e2e_dummy'
      }
    },
    {
      name: 'client',
      command: `npm --prefix ../client run -s start -- --port ${ports.client} --strictPort`,
      url: urls.client,
      reuseExistingServer: false,
      timeout: 60_000,
      env: { VITE_GRAPHQL_URL: urls.graphql }
    },
    {
      /* the production build, so the analytics test (#177) can see production behaviour */
      name: 'preview',
      command: `npm --prefix ../client run -s build -- --outDir ${PREVIEW_DIR} --emptyOutDir && npm --prefix ../client run -s preview -- --outDir ${PREVIEW_DIR} --port ${ports.preview} --strictPort`,
      url: urls.preview,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { VITE_GRAPHQL_URL: urls.graphql }
    }
  ]
})
