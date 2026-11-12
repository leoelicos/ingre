/*
 * Paddle + RevenueCat: the browser half of the key guard. vite.config.mts runs it when the
 * dev server or a build starts, so a test or sandbox run with a production key fails at
 * once; config.ts runs it again so the page never starts a checkout with such a key.
 */
export interface ClientKeys {
  /** Vite's mode: development, production or test */
  readonly mode: string
  /** VITE_PADDLE_ENVIRONMENT: sandbox (the default) or production */
  readonly paddleEnvironment: string
  /** VITE_PADDLE_CLIENT_TOKEN: test_… (sandbox) or live_… */
  readonly paddleToken: string
  /** VITE_REVENUECAT_WEB_API_KEY: rcb_sb_… (sandbox) or rcb_… */
  readonly revenueCatKey: string
}

/** A test run, or anything not explicitly set to Paddle production. */
export const isTestingRun = ({
  mode,
  paddleEnvironment
}: ClientKeys): boolean => mode === 'test' || paddleEnvironment !== 'production'

/** RevenueCat public keys that reach production purchases. */
const PRODUCTION_REVENUECAT_KEY =
  /^(appl_|goog_|amzn_|mac_|rcb_(?!sb_)|strp_(?!sb_))/

/** What is wrong with these keys; empty when they are safe to run with. */
export const paymentKeyProblems = (keys: ClientKeys): string[] => {
  const problems: string[] = []
  if (keys.mode === 'test' && keys.paddleEnvironment === 'production')
    problems.push('VITE_PADDLE_ENVIRONMENT is production in a test run')
  if (isTestingRun(keys) && keys.paddleToken.startsWith('live_'))
    problems.push(
      'VITE_PADDLE_CLIENT_TOKEN is a live Paddle token (live_…) in a test or sandbox run'
    )
  if (keys.revenueCatKey.startsWith('sk_'))
    problems.push(
      'VITE_REVENUECAT_WEB_API_KEY is a secret key (sk_…); never ship it to the browser'
    )
  else if (
    isTestingRun(keys) &&
    PRODUCTION_REVENUECAT_KEY.test(keys.revenueCatKey)
  )
    problems.push(
      'VITE_REVENUECAT_WEB_API_KEY is a production key in a test or sandbox run (use rcb_sb_…)'
    )
  return problems
}

/** Throws when the keys are not safe, so Vite stops before serving anything. */
export const assertPaymentKeys = (keys: ClientKeys): void => {
  const problems = paymentKeyProblems(keys)
  if (problems.length > 0)
    throw new Error(
      `Production payment keys in a test run:\n- ${problems.join('\n- ')}`
    )
}
