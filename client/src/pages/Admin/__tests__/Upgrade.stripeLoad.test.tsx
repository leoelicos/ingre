import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import type { MockedResponse } from '@apollo/client/testing'
import type { StripeError } from '@stripe/stripe-js'
import { CHECKOUT, GET_USER } from '../../../lib/apollo/graphQL/queries'
import { logIn, renderWithProviders } from '../../../test/providers'
import { Upgrade } from '../Upgrade'

/*
 * The real loader (@stripe/stripe-js/pure) with no Stripe.js on the page: the script is only
 * added when checkout starts, and when it fails to load (a 404 or 500 for the script fires
 * its error event) the page says checkout failed and the user is not upgraded. Pressing
 * the button again retries in place: the loader swaps the failed script for a new one.
 */

const STRIPE_JS = 'script[src^="https://js.stripe.com/v3"]'

const FAILED = /couldn.t start the stripe checkout\. you have not been charged/i

const STRIPE_ERROR: StripeError = {
  type: 'invalid_request_error',
  message: 'No such checkout.session: cs_test_2'
}

const checkoutSession = (session: string): MockedResponse => ({
  request: { query: CHECKOUT },
  result: {
    data: { checkout: { __typename: 'Checkout', session } }
  }
})

const mocks: MockedResponse[] = [
  {
    request: { query: GET_USER },
    result: {
      data: {
        getUser: {
          __typename: 'User',
          _id: 'u1',
          email: 'ada@example.com',
          firstName: 'Ada',
          lastName: 'Lovelace',
          numSavedRecipes: 0,
          pro: false
        }
      }
    }
  },
  checkoutSession('cs_test_1'),
  checkoutSession('cs_test_2')
]

/** The Stripe.js script tags on the page. */
const stripeScripts = () => Array.from(document.querySelectorAll(STRIPE_JS))

const pressCheckout = () => {
  fireEvent.click(screen.getByRole('button', { name: /checkout with stripe/i }))
}

/** Waits for the loader to add a script other than `previous`, and gives it. */
const nextScript = async (previous: Element | null): Promise<Element> => {
  await waitFor(() => {
    expect(stripeScripts()).toHaveLength(1)
    expect(stripeScripts()[0]).not.toBe(previous)
  })
  const [script] = stripeScripts()
  if (script === undefined) throw new Error('no Stripe.js script')
  return script
}

describe('Upgrade, when Stripe.js fails to load', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'Stripe')
  })

  it('adds Stripe.js only on checkout, shows the failure, then retries the load in place', async () => {
    localStorage.clear()
    logIn(false)
    renderWithProviders(<Upgrade />, { mocks, path: '/upgrade', routes: {} })
    expect(screen.getByText(/why upgrade/i)).toBeInTheDocument()
    expect(stripeScripts()).toEqual([])

    pressCheckout()
    const failedScript = await nextScript(null)
    expect(screen.queryByRole('alert')).toBeNull()

    failedScript.dispatchEvent(new Event('error'))
    expect(await screen.findByRole('alert')).toHaveTextContent(FAILED)
    expect(screen.queryByText(/you are pro/i)).toBeNull()

    // try again: the failed script is replaced, no page reload
    pressCheckout()
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull()
    })
    const retryScript = await nextScript(failedScript)
    expect(failedScript.isConnected).toBe(false)

    // this time Stripe.js loads; Stripe then reports an error for the session
    const redirectToCheckout = jest.fn(() =>
      Promise.resolve({ error: STRIPE_ERROR })
    )
    Object.assign(window, {
      Stripe: Object.assign(() => ({ redirectToCheckout }), { version: 3 })
    })
    retryScript.dispatchEvent(new Event('load'))
    await waitFor(() => {
      expect(redirectToCheckout).toHaveBeenCalledWith({
        sessionId: 'cs_test_2'
      })
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(FAILED)
    expect(screen.queryByText(/you are pro/i)).toBeNull()
    expect(
      screen.getByRole('button', { name: /checkout with stripe/i })
    ).toBeInTheDocument()
  })
})
