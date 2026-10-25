import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import type { MockedResponse } from '@apollo/client/testing'
import { CHECKOUT, GET_USER } from '../../../lib/apollo/graphQL/queries'
import { logIn, renderWithProviders } from '../../../test/providers'
import { Upgrade } from '../Upgrade'

/*
 * The real loader (@stripe/stripe-js/pure) with no Stripe.js on the page: the script is only
 * added when checkout starts, and when it fails to load (a 404 or 500 for the script fires
 * its error event) the page says checkout failed and the user is not upgraded.
 */

const STRIPE_JS = 'script[src^="https://js.stripe.com/v3"]'

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
  {
    request: { query: CHECKOUT },
    result: {
      data: { checkout: { __typename: 'Checkout', session: 'cs_test_1' } }
    }
  }
]

describe('Upgrade, when Stripe.js fails to load', () => {
  it('adds Stripe.js only on checkout, then shows the failure and stays not-pro', async () => {
    localStorage.clear()
    logIn(false)
    renderWithProviders(<Upgrade />, { mocks, path: '/upgrade', routes: {} })
    expect(screen.getByText(/why upgrade/i)).toBeInTheDocument()
    expect(document.querySelector(STRIPE_JS)).toBeNull()

    fireEvent.click(
      screen.getByRole('button', { name: /checkout with stripe/i })
    )
    await waitFor(() => {
      expect(document.querySelector(STRIPE_JS)).not.toBeNull()
    })
    expect(screen.queryByRole('alert')).toBeNull()

    document.querySelector(STRIPE_JS)?.dispatchEvent(new Event('error'))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /couldn.t start the stripe checkout\. you have not been charged/i
    )
    expect(screen.queryByText(/you are pro/i)).toBeNull()
    expect(
      screen.getByRole('button', { name: /checkout with stripe/i })
    ).toBeInTheDocument()
  })
})
