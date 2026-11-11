/**
 * #312: Stripe's publishable key, from VITE_STRIPE_PUBLISHABLE_KEY at build time (injected
 * like `__GRAPHQL_URL__`, see vite.config.mts). Test mode only: anything but a pk_test_ key
 * counts as unset, and then Plans keeps Stripe's hosted checkout.
 */
declare const __STRIPE_PUBLISHABLE_KEY__: string

export const testModeKey = (key: string): string | null =>
  key.startsWith('pk_test_') ? key : null

export const PUBLISHABLE_KEY: string | null = testModeKey(
  __STRIPE_PUBLISHABLE_KEY__
)
