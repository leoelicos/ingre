/*
 * #312: makes the three tiers' Products and monthly Prices in Stripe's test mode.
 * Idempotent: a second run finds them by lookup key and makes nothing new.
 *
 *   STRIPE_SECRET_KEY=sk_test_... npm run stripe:setup
 */
import { setupStripe } from '../src/utils/stripeSetup'

void setupStripe(process.env, console.log).then((code) => process.exit(code))
