import { defineConfig, devices } from '@playwright/test'
import { ports, urls } from './tests/env'

/*
 * One run = the real server on an in-memory MongoDB + the real client dev server
 * pointed at that server. See README.md.
 */
export default defineConfig({
  testDir: './tests',
  /* one browser at a time: each test starts from an empty device, one server */
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
      name: 'server',
      command: 'npm --prefix ../server run -s start:e2e',
      url: urls.graphql,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { PORT: String(ports.server) }
    },
    {
      name: 'client',
      command: `npm --prefix ../client run -s start -- --port ${ports.client} --strictPort`,
      url: urls.client,
      reuseExistingServer: false,
      timeout: 60_000,
      env: { VITE_GRAPHQL_URL: urls.graphql }
    }
  ]
})
