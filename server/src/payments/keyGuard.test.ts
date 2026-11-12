import {
  ProductionKeyError,
  assertNoProductionKeys,
  isTestingEnv,
  productionKeyProblems
} from './keyGuard'

/* Paddle + RevenueCat: a test run never starts with a production payment key. */

const sandbox = {
  APP_ENV: 'test',
  PADDLE_ENVIRONMENT: 'sandbox',
  PADDLE_API_KEY: 'pdl_sdbx_apikey_placeholder',
  VITE_PADDLE_CLIENT_TOKEN: 'test_placeholder',
  REVENUECAT_API_KEY: 'rcb_sb_placeholder',
  STRIPE_SECRET_KEY: 'sk_test_placeholder'
}

describe('isTestingEnv', () => {
  it('is Jest, APP_ENV=test or a sandbox Paddle', () => {
    expect(isTestingEnv({ NODE_ENV: 'test' })).toBe(true)
    expect(isTestingEnv({ APP_ENV: 'test' })).toBe(true)
    expect(isTestingEnv({ PADDLE_ENVIRONMENT: 'sandbox' })).toBe(true)
    expect(isTestingEnv({ NODE_ENV: 'production' })).toBe(false)
    expect(isTestingEnv({})).toBe(false)
  })
})

describe('productionKeyProblems', () => {
  it('passes sandbox keys and an empty environment', () => {
    expect(productionKeyProblems(sandbox)).toEqual([])
    expect(productionKeyProblems({ APP_ENV: 'test' })).toEqual([])
    expect(
      productionKeyProblems({
        APP_ENV: 'test',
        REVENUECAT_API_KEY: 'strp_sb_x'
      })
    ).toEqual([])
  })

  it('names every production key in a test run', () => {
    expect(
      productionKeyProblems({
        NODE_ENV: 'test',
        PADDLE_ENVIRONMENT: 'production',
        PADDLE_API_KEY: 'pdl_live_apikey_123',
        PADDLE_CLIENT_TOKEN: 'live_123',
        VITE_PADDLE_CLIENT_TOKEN: 'live_456',
        REVENUECAT_API_KEY: 'appl_123',
        REVENUECAT_ENVIRONMENT: 'production',
        STRIPE_SECRET_KEY: 'sk_live_123'
      })
    ).toEqual([
      'PADDLE_ENVIRONMENT is "production"; a test run must use "sandbox"',
      'PADDLE_API_KEY is a live Paddle key (pdl_live_…)',
      'PADDLE_CLIENT_TOKEN is a live Paddle client token (live_…)',
      'VITE_PADDLE_CLIENT_TOKEN is a live Paddle client token (live_…)',
      'REVENUECAT_API_KEY reaches production; use a sandbox or Test Store key',
      'REVENUECAT_ENVIRONMENT is "production" in a test run',
      'STRIPE_SECRET_KEY is a live Stripe key'
    ])
  })

  it.each(['goog_1', 'amzn_1', 'mac_1', 'sk_1', 'rcb_1', 'strp_1'])(
    'treats the RevenueCat key %s as production',
    (key) =>
      expect(
        productionKeyProblems({ APP_ENV: 'test', REVENUECAT_API_KEY: key })
      ).toHaveLength(1)
  )

  it('leaves production alone', () =>
    expect(
      productionKeyProblems({
        NODE_ENV: 'production',
        PADDLE_ENVIRONMENT: 'production',
        PADDLE_API_KEY: 'pdl_live_apikey_123'
      })
    ).toEqual([]))
})

describe('assertNoProductionKeys', () => {
  it('throws with every problem', () => {
    expect(() => assertNoProductionKeys(sandbox)).not.toThrow()
    const run = () =>
      assertNoProductionKeys({
        APP_ENV: 'test',
        STRIPE_SECRET_KEY: 'rk_live_1'
      })
    expect(run).toThrow(ProductionKeyError)
    expect(run).toThrow(/STRIPE_SECRET_KEY is a live Stripe key/)
  })
})
