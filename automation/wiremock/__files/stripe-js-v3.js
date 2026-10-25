// @ts-check
/* Stand-in for Stripe.js (https://js.stripe.com/v3) in the e2e suite (#175).
   redirectToCheckout opens WireMock's stand-in hosted checkout for the session, or,
   when the serving stub sets the redirectError transformer parameter (see
   failRedirectToCheckout in tests/wiremock.ts), resolves with that Stripe error.
   Type-checked (checkJs, `npm run check`) against Stripe.js's own types; the
   placeholders in double braces below are filled in by WireMock response templating. */

/** @typedef {Pick<import('@stripe/stripe-js').Stripe, 'redirectToCheckout'>} CheckoutRedirect */

/** Stripe's error message for redirectToCheckout; '' opens the hosted checkout.
    @type {string} */
const REDIRECT_ERROR = '{{parameters.redirectError}}'

/** @type {(publishableKey: string) => CheckoutRedirect} */
const standIn = function () {
  return {
    redirectToCheckout: function (options) {
      if (REDIRECT_ERROR !== '') {
        // what Stripe.js does when it cannot open checkout: resolve with the error
        return Promise.resolve({
          error: { type: 'invalid_request_error', message: REDIRECT_ERROR }
        })
      }
      const sessionId = 'sessionId' in options ? options.sessionId : ''
      window.location.assign(
        '{{request.baseUrl}}/c/pay/' + encodeURIComponent(sessionId)
      )
      // Stripe navigates away, so this never settles
      return new Promise(function () {})
    }
  }
}

// Stripe.js v3 says which version it is; @stripe/stripe-js checks it against its own
Object.assign(window, { Stripe: Object.assign(standIn, { version: 3 }) })
