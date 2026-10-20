/* Stand-in for Stripe.js (https://js.stripe.com/v3) in the e2e suite (#175).
   redirectToCheckout opens WireMock's stand-in hosted checkout for the session. */
window.Stripe = function () {
  return {
    redirectToCheckout: function (options) {
      window.location.assign(
        '{{request.baseUrl}}/c/pay/' + encodeURIComponent(options.sessionId)
      )
      return new Promise(function () {})
    }
  }
}
