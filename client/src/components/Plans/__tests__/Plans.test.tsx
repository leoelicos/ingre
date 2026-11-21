import '@testing-library/jest-dom'
import { fireEvent, screen, within } from '@testing-library/react'
import type { MockedResponse } from '@apollo/client/testing'
import { axe, toHaveNoViolations } from 'jest-axe'
import { GET_TIER } from '../../../lib/apollo/graphQL/queries'
import type { Tier } from '../../../lib/apollo/graphQL/typedefs'
import { Upgrade } from '../../../pages/Admin/Upgrade'
import { logIn, renderWithProviders } from '../../../test/providers'
import { markFirstEndToEnd } from '../../../utils/tier/upsell'
import { Plans } from '../Plans'

expect.extend(toHaveNoViolations)

const IN_APP_MAIN = { rules: { region: { enabled: false } } }

const tierOf = (tier: Tier | null): MockedResponse => ({
  request: { query: GET_TIER },
  result: { data: { getUser: { __typename: 'User', _id: 'u1', tier } } }
})

const renderPlans = (mocks: MockedResponse[], path = '/upgrade') =>
  renderWithProviders(<Plans />, {
    mocks,
    path,
    routes: { '/checkout': <p>Paddle checkout</p> }
  })

const card = (name: string) => screen.getByRole('region', { name })

describe('Plans (#208)', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')
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
      screen.getByText(/checkout continues on the next page with paddle/i)
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

  it('choosing a tier continues on the Paddle checkout page', async () => {
    markFirstEndToEnd()
    logIn(false)
    renderPlans([tierOf(null)])
    fireEvent.click(
      await screen.findByRole('button', { name: 'Choose Leader' })
    )
    expect(screen.getByTestId('location')).toHaveTextContent('/checkout')
    expect(screen.getByText('Paddle checkout')).toBeInTheDocument()
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
