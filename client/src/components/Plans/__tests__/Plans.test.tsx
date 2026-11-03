import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import type { MockedResponse } from '@apollo/client/testing'
import { axe, toHaveNoViolations } from 'jest-axe'
import { CHECKOUT, GET_TIER } from '../../../lib/apollo/graphQL/queries'
import type { Tier } from '../../../lib/apollo/graphQL/typedefs'
import { Upgrade } from '../../../pages/Admin/Upgrade'
import { logIn, renderWithProviders } from '../../../test/providers'
import { readPendingTier } from '../../../utils/tier/pending'
import { markFirstEndToEnd } from '../../../utils/tier/upsell'
import { Plans } from '../Plans'

expect.extend(toHaveNoViolations)

const IN_APP_MAIN = { rules: { region: { enabled: false } } }

const tierOf = (tier: Tier | null): MockedResponse => ({
  request: { query: GET_TIER },
  result: { data: { getUser: { __typename: 'User', _id: 'u1', tier } } }
})

const checkoutFor = (tier: Tier): MockedResponse => ({
  request: { query: CHECKOUT, variables: { tier } },
  result: {
    data: { checkout: { __typename: 'Checkout', session: `cs_test_${tier}` } }
  }
})

const redirectToCheckout = jest.fn(
  (): Promise<never> => new Promise(() => null)
)

Object.defineProperty(window, 'Stripe', {
  configurable: true,
  value: Object.assign(() => ({ redirectToCheckout }), { version: 3 })
})

const renderPlans = (mocks: MockedResponse[], path = '/upgrade') =>
  renderWithProviders(<Plans />, { mocks, path, routes: {} })

const card = (name: string) => screen.getByRole('region', { name })

describe('Plans (#208)', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    window.history.pushState({}, '', '/')
    redirectToCheckout.mockImplementation(() => new Promise(() => null))
  })

  it('before the first end-to-end, says when Plans open and shows no prices or checkout', () => {
    logIn(false)
    renderPlans([tierOf(null)])
    expect(
      screen.getByText(/plans open after your first shop/i)
    ).toBeInTheDocument()
    expect(screen.queryByText(/USD/)).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('after it, asks a logged-out visitor to log in', () => {
    markFirstEndToEnd()
    renderPlans([])
    expect(
      screen.getByRole('heading', { level: 1, name: 'Plans' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log\s+in/i })).toHaveAttribute(
      'href',
      '/login'
    )
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('shows Explorer 4, Manager 8 and Leader 16 USD, each adding its own features', async () => {
    markFirstEndToEnd()
    logIn(false)
    renderPlans([tierOf(null)])
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Plans' })
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    ).toEqual(['Explorer', 'Manager', 'Leader'])
    const explorer = within(card('Explorer'))
    expect(explorer.getByText('4 USD')).toBeInTheDocument()
    expect(explorer.getByText('Suggestions')).toBeInTheDocument()
    expect(explorer.queryByText(/everything in/i)).toBeNull()
    const manager = within(card('Manager'))
    expect(manager.getByText('8 USD')).toBeInTheDocument()
    expect(manager.getByText('Everything in Explorer')).toBeInTheDocument()
    expect(manager.getByText('Guest profiles')).toBeInTheDocument()
    expect(manager.queryByText('HACCP')).toBeNull()
    const leader = within(card('Leader'))
    expect(leader.getByText('16 USD')).toBeInTheDocument()
    expect(leader.getByText('Everything in Manager')).toBeInTheDocument()
    expect(leader.getByText('HACCP')).toBeInTheDocument()
    expect(
      screen.getByText(/test mode: no real charges.*4242 4242 4242 4242/i)
    ).toBeInTheDocument()
    expect(await axe(document.body, IN_APP_MAIN)).toHaveNoViolations()
  })

  it('marks the tier you have and offers the others', async () => {
    markFirstEndToEnd()
    logIn(true)
    renderPlans([tierOf('MANAGER')])
    expect(await screen.findByText('Your plan')).toBeInTheDocument()
    expect(within(card('Manager')).queryByRole('button')).toBeNull()
    expect(
      within(card('Explorer')).getByRole('button', { name: 'Choose Explorer' })
    ).toBeInTheDocument()
    expect(
      within(card('Leader')).getByRole('button', { name: 'Choose Leader' })
    ).toBeInTheDocument()
  })

  it('choosing a tier opens Stripe checkout for that tier and remembers it for the Success page', async () => {
    markFirstEndToEnd()
    logIn(false)
    renderPlans([tierOf(null), checkoutFor('LEADER')])
    fireEvent.click(
      await screen.findByRole('button', { name: 'Choose Leader' })
    )
    await waitFor(() => {
      expect(redirectToCheckout).toHaveBeenCalledWith({
        sessionId: 'cs_test_LEADER'
      })
    })
    expect(readPendingTier()).toBe('LEADER')
    expect(
      screen.getByText(/starting the stripe checkout/i)
    ).toBeInTheDocument()
  })

  it('says so when checkout cannot start', async () => {
    markFirstEndToEnd()
    logIn(false)
    renderPlans([
      tierOf(null),
      {
        request: { query: CHECKOUT, variables: { tier: 'EXPLORER' } },
        error: new Error('no stripe')
      }
    ])
    fireEvent.click(
      await screen.findByRole('button', { name: 'Choose Explorer' })
    )
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('tells a buyer who came back from a cancelled checkout', async () => {
    markFirstEndToEnd()
    logIn(false)
    renderPlans([tierOf(null)], '/upgrade?checkout=cancelled')
    expect(await screen.findByText(/checkout cancelled/i)).toBeInTheDocument()
  })
})

describe('Upgrade with the tiers flag', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  it('shows Plans on /upgrade when the flag is on', () => {
    window.history.pushState({}, '', '/upgrade?flags=tiers')
    renderWithProviders(<Upgrade />, {
      mocks: [],
      path: '/upgrade',
      routes: {}
    })
    expect(
      screen.getByText(/plans open after your first shop/i)
    ).toBeInTheDocument()
    window.history.pushState({}, '', '/')
  })

  it('keeps the old PRO upgrade when it is off', () => {
    renderWithProviders(<Upgrade />, {
      mocks: [],
      path: '/upgrade',
      routes: {}
    })
    expect(screen.getByText('Upgrade')).toBeInTheDocument()
    expect(screen.queryByText(/plans open/i)).toBeNull()
  })
})
