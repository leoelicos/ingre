import { fakeStripe } from '../test-utils/fakeStripe'
import Stripe from 'stripe'
import { makeStripe, setupStripe } from './stripeSetup'

/* #312: the setup script, against a local Stripe stand-in. */

const fake = fakeStripe()
afterAll(() => fake.stop())

it('needs a test-mode STRIPE_SECRET_KEY', async () => {
  const log = jest.fn()
  expect(await setupStripe({}, log)).toBe(1)
  expect(log).toHaveBeenCalledWith(expect.stringContaining('STRIPE_SECRET_KEY'))
  await expect(
    setupStripe({ STRIPE_SECRET_KEY: 'sk_live_nope' }, log)
  ).rejects.toThrow('test-mode')
})

it('creates the Products and Prices once, then reports them as there', async () => {
  const stripe = await fake.start()
  const lines: string[] = []
  const make = jest.fn(() => stripe)
  expect(
    await setupStripe(
      { STRIPE_SECRET_KEY: 'sk_test_x' },
      (l) => lines.push(l),
      make
    )
  ).toBe(0)
  expect(make).toHaveBeenCalledWith('sk_test_x')
  expect(lines.filter((l) => l.startsWith('created'))).toHaveLength(3)
  expect(lines.filter((l) => l.startsWith('STRIPE_PRICE_'))).toHaveLength(3)
  lines.length = 0
  await setupStripe(
    { STRIPE_SECRET_KEY: 'sk_test_x' },
    (l) => lines.push(l),
    make
  )
  expect(lines.filter((l) => l.startsWith('exists'))).toHaveLength(3)
})

it('talks to api.stripe.com by default', () => {
  expect(makeStripe('sk_test_x')).toBeInstanceOf(Stripe)
})
