import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import type { MockedResponse } from '@apollo/client/testing'
import { axe, toHaveNoViolations } from 'jest-axe'
import { GET_USER } from '../../../lib/apollo/graphQL/queries'
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

const renderUpgrade = (mocks: MockedResponse[], path = '/upgrade') =>
  renderWithProviders(<Upgrade />, {
    mocks,
    path,
    routes: { '/checkout': <p>Paddle checkout</p> }
  })

describe('Upgrade', () => {
  beforeEach(() => {
    localStorage.clear()
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

  it('sends a logged-in user to the Paddle checkout page', async () => {
    logIn(false)
    renderUpgrade([user(false)])
    expect(screen.getByText(/why upgrade/i)).toBeInTheDocument()
    expect(screen.getByText(/secure payment with paddle/i)).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: /continue to checkout/i })
    )
    expect(screen.getByTestId('location')).toHaveTextContent('/checkout')
    expect(screen.getByText('Paddle checkout')).toBeInTheDocument()
    expect(await axe(document.body, IN_APP_MAIN)).toHaveNoViolations()
  })
})
