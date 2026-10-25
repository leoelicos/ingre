// @ts-check
/* Stand-in for Stripe.js (https://js.stripe.com/v3) in the e2e suite (#175).
   redirectToCheckout opens WireMock's stand-in hosted checkout for the session.
   Type-checked (checkJs, `npm run check`) against Stripe.js's own types; the
   request.baseUrl placeholder below is filled in by WireMock response templating. */

/** @typedef {Pick<import('@stripe/stripe-js').Stripe, 'redirectToCheckout'>} CheckoutRedirect */

/** @type {(publishableKey: string) => CheckoutRedirect} */
const standIn = function () {
  return {
    redirectToCheckout: function (options) {
      const sessionId = 'sessionId' in options ? options.sessionId : ''
      window.location.assign(
        '{{request.baseUrl}}/c/pay/' + encodeURIComponent(sessionId)
      )
      // Stripe navigates away, so this never settles
      return new Promise(function () {})
    }
  }
}

Object.assign(window, { Stripe: standIn })
