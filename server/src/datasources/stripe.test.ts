import { createServer, type IncomingMessage, type Server } from 'http'
import Stripe from 'stripe'
import { StripeApi, getStripe, stripeConnection, stripeKey } from './stripe'

/* No module mocks: the real stripe-node client talks to a local stand-in for api.stripe.com. */

interface Call {
  path: string
  body: Record<string, string>
}

const RESPONSES: Record<string, object> = {
  '/v1/products': { id: 'prod_123', object: 'product' },
  '/v1/prices': { id: 'price_123', object: 'price' },
  '/v1/checkout/sessions': {
    id: 'cs_test_123',
    object: 'checkout.session',
    url: 'https://checkout.example/pay/cs_test_123'
  }
}

const calls: Call[] = []
const failing = new Set<string>()

const readBody = (req: IncomingMessage): Promise<string> =>
  new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    req.on('end', () => resolve(body))
  })

const fakeStripe: Server = createServer(async (req, res) => {
  const path = req.url ?? ''
  const body = Object.fromEntries(new URLSearchParams(await readBody(req)))
  calls.push({ path, body })
  const ok = !failing.has(path) && path in RESPONSES
  res.writeHead(ok ? 200 : 500, { 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify(
      ok ? RESPONSES[path] : { error: { type: 'api_error', message: 'down' } }
    )
  )
})

const portOf = (server: Server): number => {
  const address = server.address()
  if (address === null || typeof address === 'string') {
    throw new Error('fake Stripe is not listening')
  }
  return address.port
}

const clientFor = (server: Server): Stripe =>
  new Stripe('sk_test_local', {
    apiVersion: '2020-08-27',
    host: '127.0.0.1',
    port: portOf(server),
    protocol: 'http'
  })

const props = {
  productName: 'ingré PRO',
  productDescription: 'Access instructions',
  productImages: ['https://example.com/image.png'],
  productCost: 500,
  productCurrency: 'usd',
  rootEndpoint: 'https://www.example.com'
}

describe('Stripe configuration', () => {
  it('uses api.stripe.com and the sample test key when nothing is set', () => {
    expect(stripeConnection({})).toEqual({})
    expect(stripeConnection({ STRIPE_API_HOST: '' })).toEqual({})
    expect(stripeKey({})).toMatch(/^sk_test_4/)
  })

  it('reads a stand-in host, port and protocol from the environment', () => {
    expect(
      stripeConnection({
        STRIPE_API_HOST: 'localhost',
        STRIPE_API_PORT: '4312',
        STRIPE_API_PROTOCOL: 'http'
      })
    ).toEqual({ host: 'localhost', port: '4312', protocol: 'http' })
    expect(stripeConnection({ STRIPE_API_HOST: 'stripe.local' })).toEqual({
      host: 'stripe.local',
      port: 443,
      protocol: 'https'
    })
    expect(
      stripeKey({
        STRIPE_API_HOST: 'localhost',
        STRIPE_API_KEY: 'sk_test_dummy'
      })
    ).toBe('sk_test_dummy')
    // a key alone never replaces the sample key: only with a stand-in host
    expect(stripeKey({ STRIPE_API_KEY: 'sk_test_dummy' })).toMatch(/^sk_test_4/)
  })
})

describe('StripeApi', () => {
  let stripeApi: StripeApi

  beforeAll(async () => {
    await new Promise<void>((resolve) =>
      fakeStripe.listen(0, '127.0.0.1', resolve)
    )
  })

  afterAll(async () => {
    await new Promise((resolve) => fakeStripe.close(resolve))
  })

  beforeEach(() => {
    calls.length = 0
    failing.clear()
    stripeApi = new StripeApi(clientFor(fakeStripe))
  })

  it('getStripe returns a real Stripe client, and is the default', () => {
    expect(getStripe()).toBeInstanceOf(Stripe)
    expect(new StripeApi()).toBeInstanceOf(StripeApi)
  })

  it('reaches the env-configured Stripe host with the env key (e2e WireMock)', async () => {
    const api = new StripeApi(
      getStripe({
        STRIPE_API_KEY: 'sk_test_env',
        STRIPE_API_HOST: '127.0.0.1',
        STRIPE_API_PORT: String(portOf(fakeStripe)),
        STRIPE_API_PROTOCOL: 'http'
      })
    )
    await api.stripePay(props)
    expect(calls).toHaveLength(3)
  })

  it('creates a product, a price, then a checkout session', async () => {
    const session = await stripeApi.stripePay(props)
    expect(session.id).toBe('cs_test_123')
    expect(calls.map((c) => c.path)).toEqual([
      '/v1/products',
      '/v1/prices',
      '/v1/checkout/sessions'
    ])
    expect(calls[0]?.body).toEqual({
      name: props.productName,
      description: props.productDescription,
      'images[0]': props.productImages[0]
    })
    expect(calls[1]?.body).toEqual({
      product: 'prod_123',
      unit_amount: '500',
      currency: 'usd'
    })
    expect(calls[2]?.body).toEqual({
      'payment_method_types[0]': 'card',
      'line_items[0][price]': 'price_123',
      'line_items[0][quantity]': '1',
      mode: 'payment',
      success_url: `${props.rootEndpoint}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${props.rootEndpoint}/upgrade?checkout=cancelled`
    })
  })

  it.each(['/v1/products', '/v1/prices', '/v1/checkout/sessions'])(
    'fails with one clear error when %s fails',
    async (path) => {
      failing.add(path)
      await expect(stripeApi.stripePay(props)).rejects.toStrictEqual(
        new Error('could not process stripe payment')
      )
      expect(calls.at(-1)?.path).toBe(path)
    }
  )
})
