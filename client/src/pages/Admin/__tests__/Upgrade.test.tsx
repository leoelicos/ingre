import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import type { MockedResponse } from '@apollo/client/testing'
import { axe, toHaveNoViolations } from 'jest-axe'
import { CHECKOUT, GET_USER } from '../../../lib/apollo/graphQL/queries'
import { logIn, renderWithProviders } from '../../../test/providers'
import { Upgrade } from '../Upgrade'

expect.extend(toHaveNoViolations)

// The page renders inside App's <main>; here it is rendered alone.
const IN_APP_MAIN = { rules: { region: { enabled: false } } }

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

/* Stripe navigates away on success, so its promise never settles */
const redirectToCheckout = jest.fn(
  (): Promise<never> => new Promise(() => null)
)

/* Stands in for Stripe.js on the page (what js.stripe.com/v3 defines, version 3). Set
   before @stripe/stripe-js looks for it, so the real loadStripe resolves with it. */
Object.defineProperty(window, 'Stripe', {
  configurable: true,
  value: Object.assign(() => ({ redirectToCheckout }), { version: 3 })
})

const checkoutDown: MockedResponse = {
  request: { query: CHECKOUT },
  error: new Error('could not create stripe response')
}

const renderUpgrade = (mocks: MockedResponse[], path = '/upgrade') =>
  renderWithProviders(<Upgrade />, { mocks, path, routes: {} })

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

  it('says so when Stripe checkout cannot start, and the user stays not-pro', async () => {
    logIn(false)
    renderUpgrade([user(false), checkoutDown])
    fireEvent.click(
      screen.getByRole('button', { name: /checkout with stripe/i })
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /couldn.t start the stripe checkout/i
    )
    expect(redirectToCheckout).not.toHaveBeenCalled()
    expect(screen.queryByText(/you are pro/i)).toBeNull()
    expect(await axe(document.body, IN_APP_MAIN)).toHaveNoViolations()
  })

  it('confirms a cancelled checkout without charging', async () => {
    logIn(false)
    renderUpgrade([user(false)], '/upgrade?checkout=cancelled')
    expect(screen.getByRole('status')).toHaveTextContent(
      /checkout cancelled. you have not been charged/i
    )
    expect(screen.queryByRole('alert')).toBeNull()
    expect(await axe(document.body, IN_APP_MAIN)).toHaveNoViolations()
  })
})
