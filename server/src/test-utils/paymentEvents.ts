/*
 * Paddle + RevenueCat: realistic webhook payloads (trimmed from Paddle's and RevenueCat's
 * documented samples) for the unit tests. Every id is made up.
 */
export const USER = '65a1b2c3d4e5f60718293a4b'
export const OTHER_USER = '65a1b2c3d4e5f60718293a4c'

export const paddleSubscription = (
  overrides: Record<string, unknown> = {}
) => ({
  id: 'sub_01hv8x29kz0t586xy6zn1a62ny',
  status: 'active',
  customer_id: 'ctm_01hv8wt8nffez4p2t6typn4a5j',
  address_id: 'add_01hv8wt8npm0wkmqcehsqxs3t8',
  currency_code: 'INR',
  collection_mode: 'automatic',
  billing_cycle: { interval: 'year', frequency: 1 },
  current_billing_period: {
    starts_at: '2026-11-12T00:00:00Z',
    ends_at: '2027-11-12T00:00:00Z'
  },
  scheduled_change: null,
  canceled_at: null,
  items: [
    {
      status: 'active',
      quantity: 1,
      recurring: true,
      price: {
        id: 'pri_01hv0vax6rv18t4tamj848ne4d',
        product_id: 'pro_01hv0vax6rv18t4tamj848ne4e',
        name: 'Explorer yearly',
        billing_cycle: { interval: 'year', frequency: 1 },
        tax_mode: 'account_setting',
        unit_price: { amount: '400', currency_code: 'USD' },
        unit_price_overrides: [
          {
            country_codes: ['IN'],
            unit_price: { amount: '117900', currency_code: 'INR' }
          }
        ],
        custom_data: { ingre_tier: 'EXPLORER' }
      }
    }
  ],
  custom_data: { ingre_user_id: USER },
  ...overrides
})

export const paddleEvent = (
  eventType = 'subscription.activated',
  data: unknown = paddleSubscription(),
  overrides: Record<string, unknown> = {}
) => ({
  event_id: 'evt_01hv8x2acma7ttf0ksgxz6wzyv',
  event_type: eventType,
  occurred_at: '2026-11-12T00:00:05.000000Z',
  notification_id: 'ntf_01hv8x2af8me9fd8zhpp4qyynh',
  data,
  ...overrides
})

export const revenueCatEvent = (overrides: Record<string, unknown> = {}) => ({
  api_version: '1.0',
  event: {
    id: 'CD489E0E-5D52-4C52-A3B4-2E2D4E5E1B9A',
    type: 'INITIAL_PURCHASE',
    app_user_id: USER,
    original_app_user_id: USER,
    aliases: [USER],
    product_id: 'ingre_manager_monthly',
    entitlement_ids: ['manager'],
    period_type: 'NORMAL',
    purchased_at_ms: 1794787200000,
    expiration_at_ms: 1797465600000,
    event_timestamp_ms: 1794787205000,
    store: 'APP_STORE',
    environment: 'SANDBOX',
    original_transaction_id: '2000000812345678',
    transaction_id: '2000000812345678',
    currency: 'USD',
    price: 8,
    ...overrides
  }
})
