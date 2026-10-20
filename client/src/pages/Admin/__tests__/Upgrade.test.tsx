import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import type { MockedResponse } from '@apollo/client/testing'
import { CHECKOUT, GET_USER } from '../../../lib/apollo/graphQL/queries'
import { logIn, renderWithProviders } from '../../../test/providers'
import { Upgrade } from '../Upgrade'

const user = (pro: boolean): MockedResponse => ({
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
        pro
      }
    }
  }
})

const checkout: MockedResponse = {
  request: { query: CHECKOUT },
  result: {
    data: { checkout: { __typename: 'Checkout', session: 'cs_test_1' } }
  }
}

const redirectToCheckout = jest.fn(() => Promise.resolve({ error: undefined }))

/* Stands in for Stripe.js on the page (what js.stripe.com defines). Set before
   @stripe/stripe-js looks for it, so the real loadStripe resolves with it. */
Object.defineProperty(window, 'Stripe', {
  configurable: true,
  value: () => ({ redirectToCheckout })
})

const renderUpgrade = (mocks: MockedResponse[]) =>
  renderWithProviders(<Upgrade />, { mocks, path: '/upgrade', routes: {} })

describe('Upgrade', () => {
  beforeEach(() => {
    localStorage.clear()
    redirectToCheckout.mockClear()
  })

  it('asks a logged-out visitor to log in', () => {
    renderUpgrade([user(false)])
    expect(screen.getByText('Upgrade')).toBeInTheDocument()
    expect(
      screen.getByText('You need to be logged in to see this page.')
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log\s+in/i })).toHaveAttribute(
      'href',
      '/login'
    )
  })

  it('tells a pro user they are pro', async () => {
    logIn(true)
    renderUpgrade([user(true)])
    expect(await screen.findByText(/you are pro/i)).toBeInTheDocument()
  })

  it('sends a logged-in user to Stripe checkout with the new session', async () => {
    logIn(false)
    renderUpgrade([user(false), checkout])
    expect(screen.getByText(/why upgrade/i)).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: /checkout with stripe/i })
    )
    await waitFor(() => {
      expect(redirectToCheckout).toHaveBeenCalledWith({
        sessionId: 'cs_test_1'
      })
    })
  })
})
