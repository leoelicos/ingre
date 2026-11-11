/*
 * #312: a local stand-in for api.stripe.com that behaves like Stripe's test mode for the
 * documented test tokens (https://docs.stripe.com/testing), each made into a PaymentMethod
 * (card[token]): tok_visa and tok_mastercard succeed, tok_visa_chargeDeclined can't be attached (card_declined / generic_decline), and
 * tok_chargeCustomerFail attaches but its first charge fails (the subscription is incomplete).
 */
import { createServer, type IncomingMessage, type Server } from 'http'
import Stripe from 'stripe'

export interface Call {
  readonly method: string
  readonly path: string
  readonly body: Record<string, string>
}

type Json = Record<string, unknown>

const readBody = (req: IncomingMessage): Promise<string> =>
  new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    req.on('end', () => resolve(body))
  })

const DECLINES: Readonly<Record<string, string>> = {
  tok_visa_chargeDeclined: 'generic_decline',
  tok_visa_chargeDeclinedInsufficientFunds: 'insufficient_funds'
}

export const fakeStripe = () => {
  const calls: Call[] = []
  const prices: Json[] = []
  const products: Json[] = []
  const sources = new Map<string, string>()
  /** PaymentMethod id to the test token it was made from */
  const paymentMethods = new Map<string, string>()
  const subscriptions = new Map<string, Json>()
  let down = false
  let n = 0
  const next = (prefix: string) => `${prefix}_${++n}`

  const subscription = (customer: string, price: string, metadata: Json) => ({
    id: next('sub'),
    object: 'subscription',
    customer,
    status:
      sources.get(customer) === 'tok_chargeCustomerFail'
        ? 'incomplete'
        : 'active',
    metadata,
    items: { object: 'list', data: [{ id: next('si'), price: { id: price } }] }
  })

  const route = (call: Call): [number, Json] => {
    const { method, path, body } = call
    const [pathname = '', query = ''] = path.split('?')
    const params = new URLSearchParams(query)
    const metadataOf = (): Json =>
      Object.fromEntries(
        Object.entries(body)
          .filter(([k]) => k.startsWith('metadata['))
          .map(([k, v]) => [k.slice(9, -1), v])
      )
    if (method === 'GET' && pathname === '/v1/prices') {
      const key = params.get('lookup_keys[0]')
      return [
        200,
        { object: 'list', data: prices.filter((p) => p['lookup_key'] === key) }
      ]
    }
    if (method === 'GET' && pathname === '/v1/products') {
      return [200, { object: 'list', data: products }]
    }
    if (method === 'POST' && pathname === '/v1/products') {
      const product = {
        id: next('prod'),
        object: 'product',
        metadata: metadataOf()
      }
      products.push(product)
      return [200, product]
    }
    if (method === 'POST' && pathname === '/v1/prices') {
      const price = {
        id: next('price'),
        object: 'price',
        product: body['product'],
        lookup_key: body['lookup_key'],
        unit_amount: Number(body['unit_amount']),
        recurring: { interval: body['recurring[interval]'] }
      }
      prices.push(price)
      return [200, price]
    }
    if (method === 'POST' && pathname === '/v1/payment_methods') {
      const id = next('pm')
      paymentMethods.set(id, body['card[token]'] ?? '')
      return [200, { id, object: 'payment_method', type: 'card' }]
    }
    /* a PaymentMethod made from a token carries the token's test behaviour */
    const attaching =
      body['payment_method'] ??
      pathname.match(/^\/v1\/payment_methods\/(\w+)\/attach$/)?.[1]
    const source =
      attaching === undefined ? undefined : paymentMethods.get(attaching)
    if (source !== undefined && source in DECLINES) {
      return [
        402,
        {
          error: {
            type: 'card_error',
            code: 'card_declined',
            decline_code: DECLINES[source],
            message: 'Your card was declined.'
          }
        }
      ]
    }
    const attached = pathname.match(/^\/v1\/payment_methods\/(\w+)\/attach$/)
    if (method === 'POST' && attached !== null) {
      if (source !== undefined) sources.set(body['customer'] ?? '', source)
      return [
        200,
        {
          id: attached[1],
          object: 'payment_method',
          customer: body['customer']
        }
      ]
    }
    if (method === 'POST' && pathname === '/v1/customers') {
      const id = next('cus')
      if (source !== undefined) sources.set(id, source)
      return [200, { id, object: 'customer' }]
    }
    const customer = pathname.match(/^\/v1\/customers\/(\w+)$/)?.[1]
    if (method === 'POST' && customer !== undefined) {
      return [200, { id: customer, object: 'customer' }]
    }
    if (method === 'POST' && pathname === '/v1/subscriptions') {
      const made = subscription(
        body['customer'] ?? '',
        body['items[0][price]'] ?? '',
        metadataOf()
      )
      subscriptions.set(String(made.id), made)
      return [200, made]
    }
    const sub = pathname.match(/^\/v1\/subscriptions\/(\w+)$/)?.[1]
    const found = sub === undefined ? undefined : subscriptions.get(sub)
    if (found !== undefined && method === 'GET') return [200, found]
    if (found !== undefined && method === 'POST') {
      const moved = {
        ...found,
        metadata: metadataOf(),
        items: {
          object: 'list',
          data: [
            {
              id: body['items[0][id]'] ?? next('si'),
              price: { id: body['items[0][price]'] }
            }
          ]
        }
      }
      subscriptions.set(String(found['id']), moved)
      return [200, moved]
    }
    return [
      404,
      {
        error: {
          type: 'invalid_request_error',
          message: `no route ${method} ${path}`
        }
      }
    ]
  }

  const server: Server = createServer(async (req, res) => {
    const call = {
      method: req.method ?? 'GET',
      path: req.url ?? '',
      body: Object.fromEntries(new URLSearchParams(await readBody(req)))
    }
    calls.push(call)
    const [status, json] = down
      ? [500, { error: { type: 'api_error', message: 'down' } }]
      : route(call)
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(json))
  })

  const start = (): Promise<Stripe> =>
    new Promise((resolve) =>
      server.listen(0, '127.0.0.1', () => {
        const address = server.address()
        const port =
          typeof address === 'object' && address !== null ? address.port : 0
        resolve(
          new Stripe('sk_test_local', {
            apiVersion: '2020-08-27',
            host: '127.0.0.1',
            port,
            protocol: 'http',
            maxNetworkRetries: 0
          })
        )
      })
    )
  const stop = (): Promise<void> =>
    new Promise((resolve) => {
      server.closeAllConnections()
      server.close(() => resolve())
    })
  return {
    calls,
    prices,
    products,
    start,
    stop,
    setDown: (value: boolean) => {
      down = value
    }
  }
}
