jest.mock('@stripe/stripe-js', () => ({
  loadStripe: () => Promise.resolve(null)
}))
