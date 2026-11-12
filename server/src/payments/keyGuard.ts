/*
 * Paddle + RevenueCat (global pricing): a test run must never hold a live key. This runs
 * when the server starts (server.ts), so a test or sandbox process with a production
 * Paddle, RevenueCat or Stripe key stops at once instead of charging anyone.
 */
export type Env = Readonly<Record<string, string | undefined>>

/** A test run: Jest, the e2e server (APP_ENV=test) or a sandbox Paddle. */
export const isTestingEnv = (env: Env): boolean =>
  env['NODE_ENV'] === 'test' ||
  env['APP_ENV'] === 'test' ||
  env['PADDLE_ENVIRONMENT'] === 'sandbox'

/** Paddle Billing API keys: pdl_sdbx_apikey_… (sandbox) and pdl_live_apikey_… (live). */
const LIVE_PADDLE_API_KEY = /^pdl_live_/
/** Paddle.js client-side tokens: test_… (sandbox) and live_… (live). */
const LIVE_PADDLE_CLIENT_TOKEN = /^live_/
/**
 * RevenueCat keys that reach production: store app keys (appl_, goog_, amzn_, mac_),
 * Web Billing and Stripe app keys without their sandbox marker (rcb_sb_, strp_sb_ are
 * sandbox), and secret API keys (sk_), which reach every environment of the project.
 */
const PRODUCTION_REVENUECAT_KEY =
  /^(appl_|goog_|amzn_|mac_|sk_|rcb_(?!sb_)|strp_(?!sb_))/
/** Stripe live secret and restricted keys. */
const LIVE_STRIPE_KEY = /^(sk|rk)_live_/

const value = (env: Env, name: string): string => env[name] ?? ''

/** What is wrong with this environment for a test run; empty when it is safe (or not a test run). */
export const productionKeyProblems = (env: Env): string[] => {
  if (!isTestingEnv(env)) return []
  const problems: string[] = []
  const paddleEnvironment = value(env, 'PADDLE_ENVIRONMENT')
  if (paddleEnvironment !== '' && paddleEnvironment !== 'sandbox')
    problems.push(
      `PADDLE_ENVIRONMENT is "${paddleEnvironment}"; a test run must use "sandbox"`
    )
  if (LIVE_PADDLE_API_KEY.test(value(env, 'PADDLE_API_KEY')))
    problems.push('PADDLE_API_KEY is a live Paddle key (pdl_live_…)')
  for (const name of ['PADDLE_CLIENT_TOKEN', 'VITE_PADDLE_CLIENT_TOKEN'])
    if (LIVE_PADDLE_CLIENT_TOKEN.test(value(env, name)))
      problems.push(`${name} is a live Paddle client token (live_…)`)
  if (PRODUCTION_REVENUECAT_KEY.test(value(env, 'REVENUECAT_API_KEY')))
    problems.push(
      'REVENUECAT_API_KEY reaches production; use a sandbox or Test Store key'
    )
  if (value(env, 'REVENUECAT_ENVIRONMENT') === 'production')
    problems.push('REVENUECAT_ENVIRONMENT is "production" in a test run')
  if (LIVE_STRIPE_KEY.test(value(env, 'STRIPE_SECRET_KEY')))
    problems.push('STRIPE_SECRET_KEY is a live Stripe key')
  return problems
}

export class ProductionKeyError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Production payment keys in a test run:\n- ${problems.join('\n- ')}`)
    this.name = 'ProductionKeyError'
  }
}

/** Throws (so the process stops) when a test run holds a production key. */
export const assertNoProductionKeys = (env: Env): void => {
  const problems = productionKeyProblems(env)
  if (problems.length > 0) throw new ProductionKeyError(problems)
}
