import Stripe from 'stripe'
import { StripeApi } from './stripe'
import { getStripe } from './stripe'

const mockProduct = {
  id: 'prod_123',
  object: 'product',
  active: true,
  attributes: [],
  created: 1234567890,
  description: 'A product for testing',
  images: ['https://example.com/image.png'],
  livemode: false,
  metadata: {},
  name: 'Test Product',
  package_dimensions: null,
  shippable: null,
  statement_descriptor: null,
  type: 'service',
  unit_label: null,
  updated: 1234567890,
  url: null,
  caption: '',
  tax_code: null,
  lastResponse: {
    headers: {},
    requestId: '',
    statusCode: 200,
    apiVersion: '',
    idempotencyKey: '',
    stripeAccount: ''
  }
} as Stripe.Response<Stripe.Product>

const mockPrice = {
  id: 'price_123',
  object: 'price',
  active: true,
  billing_scheme: 'per_unit',
  created: Math.floor(Date.now() / 1000),
  currency: 'usd',
  currency_options: {
    usd: {
      custom_unit_amount: null,
      tax_behavior: 'exclusive',
      unit_amount: 2000,
      unit_amount_decimal: '2000'
    }
  },
  custom_unit_amount: null,
  lastResponse: {
    headers: { headerKey: 'headerValue' },
    requestId: '1',
    statusCode: 2,
    apiVersion: '3',
    idempotencyKey: '4',
    stripeAccount: '5'
  },
  livemode: false,
  lookup_key: 'standard_price',
  metadata: {},
  nickname: 'Standard Plan',
  product: 'prod_123',
  recurring: {
    aggregate_usage: null,
    interval: 'month',
    interval_count: 1,
    trial_period_days: null,
    usage_type: 'licensed'
  },
  tax_behavior: 'exclusive',
  tiers_mode: null,
  tiers: [],
  transform_quantity: null,
  type: 'recurring',
  unit_amount: 2000,
  unit_amount_decimal: '2000'
} as Stripe.Response<Stripe.Price>

const mockSession: Stripe.Checkout.Session = {
  id: 'cs_test_123',
  object: 'checkout.session',
  after_expiration: null,
  allow_promotion_codes: null,
  amount_subtotal: 5000,
  amount_total: 5000,
  automatic_tax: { enabled: false, status: null },
  billing_address_collection: 'auto',
  cancel_url: 'https://example.com/cancel',
  client_reference_id: 'client_123',
  consent: null,
  consent_collection: null,
  currency: 'usd',
  customer: 'cus_123',
  customer_creation: 'always',
  customer_details: null,
  customer_email: 'test@example.com',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  livemode: false,
  locale: null,
  metadata: {},
  mode: 'payment',
  payment_intent: 'pi_123',
  payment_link: null,
  payment_method_options: null,
  payment_method_types: ['card'],
  payment_status: 'unpaid',
  phone_number_collection: { enabled: false },
  recovered_from: null,
  setup_intent: null,
  shipping: null,
  shipping_address_collection: null,
  shipping_options: [],
  shipping_rate: null,
  status: 'open',
  submit_type: null,
  subscription: null,
  success_url: 'https://example.com/success',
  total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
  url: 'https://checkout.stripe.com/pay/cs_test_123'
}

const mockRootUrl = 'https://www.example.com'

const mockProductsCreate = jest.fn().mockResolvedValue(mockProduct)
const mockSessionsCreate = jest.fn().mockResolvedValue(mockSession)
const mockPricesCreate = jest.fn().mockResolvedValue(mockPrice)

let mockStripeInstance = {
  products: { create: (e: any) => mockProductsCreate(e) },
  checkout: { sessions: { create: (e: any) => mockSessionsCreate(e) } },
  prices: { create: (e: any) => mockPricesCreate(e) }
}

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripeInstance)
})

describe('StripeApi class', () => {
  const mockProps = {
    productName: mockProduct.name,
    productDescription: mockProduct.description,
    productImages: mockProduct.images,
    productCost: mockPrice.unit_amount,
    productCurrency: mockPrice.currency,
    rootEndpoint: mockRootUrl
  }

  let stripeApi: any
  beforeEach(() => {
    jest.clearAllMocks()

    stripeApi = new StripeApi()
  })

  it('getStripe should return stripe', async () => {
    const stripe = getStripe()
    expect(stripe).toBe(mockStripeInstance)
  })

  it('should complete the payment process by creating a product, price, and session', async () => {
    const result = await stripeApi.stripePay(mockProps)
    expect(result).toEqual(mockSession)
    expect(mockProductsCreate).toHaveBeenCalledWith({
      description: mockProduct.description,
      images: mockProduct.images,
      name: mockProduct.name
    })
    expect(mockPricesCreate).toHaveBeenCalledWith({
      currency: mockPrice.currency,
      product: mockProduct.id,
      unit_amount: mockPrice.unit_amount
    })
    expect(mockSessionsCreate).toHaveBeenCalledWith({
      cancel_url: `${mockRootUrl}/`,
      line_items: [
        {
          price: mockPrice.id,
          quantity: 1
        }
      ],
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: mockRootUrl + '/success?session_id={CHECKOUT_SESSION_ID}'
    })
  })

  it('should throw if createProduct throws', async () => {
    mockProductsCreate.mockRejectedValueOnce(null)
    try {
      await stripeApi.stripePay(mockProps)
    } catch (error) {
      expect(error).toStrictEqual(new Error('could not process stripe payment'))
    }
  })

  it('should throw if createPrices throws', async () => {
    mockPricesCreate.mockRejectedValueOnce(null)
    try {
      await stripeApi.stripePay(mockProps)
    } catch (error) {
      expect(error).toStrictEqual(new Error('could not process stripe payment'))
    }
  })

  it('should throw if createSession throws', async () => {
    mockSessionsCreate.mockRejectedValueOnce(null)
    try {
      await stripeApi.stripePay(mockProps)
    } catch (error) {
      expect(error).toStrictEqual(new Error('could not process stripe payment'))
    }
  })
})
