import {
  assertPaymentKeys,
  isTestingRun,
  paymentKeyProblems
} from '../keyGuard'

/* Paddle + RevenueCat: the browser never runs a test with a production key. */

const sandbox = {
  mode: 'test',
  paddleEnvironment: 'sandbox',
  paddleToken: 'test_abc',
  revenueCatKey: 'rcb_sb_abc'
}

describe('client key guard', () => {
  it('counts tests and anything not set to production as testing', () => {
    expect(isTestingRun(sandbox)).toBe(true)
    expect(
      isTestingRun({ ...sandbox, mode: 'production', paddleEnvironment: '' })
    ).toBe(true)
    expect(
      isTestingRun({
        ...sandbox,
        mode: 'production',
        paddleEnvironment: 'production'
      })
    ).toBe(false)
  })

  it('passes sandbox keys, and live keys in production', () => {
    expect(paymentKeyProblems(sandbox)).toEqual([])
    expect(
      paymentKeyProblems({
        mode: 'production',
        paddleEnvironment: 'production',
        paddleToken: 'live_abc',
        revenueCatKey: 'rcb_abc'
      })
    ).toEqual([])
  })

  it('names production keys in a test run', () => {
    expect(
      paymentKeyProblems({
        mode: 'test',
        paddleEnvironment: 'production',
        paddleToken: 'live_abc',
        revenueCatKey: 'appl_abc'
      })
    ).toEqual([
      'VITE_PADDLE_ENVIRONMENT is production in a test run',
      'VITE_PADDLE_CLIENT_TOKEN is a live Paddle token (live_…) in a test or sandbox run',
      'VITE_REVENUECAT_WEB_API_KEY is a production key in a test or sandbox run (use rcb_sb_…)'
    ])
  })

  it('never allows a RevenueCat secret key in the browser', () => {
    expect(
      paymentKeyProblems({
        mode: 'production',
        paddleEnvironment: 'production',
        paddleToken: '',
        revenueCatKey: 'sk_abc'
      })
    ).toEqual([
      'VITE_REVENUECAT_WEB_API_KEY is a secret key (sk_…); never ship it to the browser'
    ])
  })

  it('throws, so Vite stops', () => {
    expect(() => assertPaymentKeys(sandbox)).not.toThrow()
    expect(() =>
      assertPaymentKeys({ ...sandbox, paddleToken: 'live_abc' })
    ).toThrow(/live Paddle token/)
  })
})
