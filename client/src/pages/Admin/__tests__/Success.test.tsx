import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'
import type { MockedResponse } from '@apollo/client/testing'
import { MAKE_USER_PRO } from '../../../lib/apollo/graphQL/mutations'
import { logIn, renderWithProviders } from '../../../test/providers'
import { Success } from '../Success'

const madePro: MockedResponse = {
  request: { query: MAKE_USER_PRO },
  result: {
    data: { makeUserPro: { __typename: 'User', _id: 'u1', pro: true } }
  }
}

const failed: MockedResponse = {
  request: { query: MAKE_USER_PRO },
  error: new Error('stripe')
}

const renderSuccess = (path: string, mocks: MockedResponse[]) =>
  renderWithProviders(<Success />, {
    mocks,
    path,
    routes: { '/upgrade': <p>Upgrade page</p> }
  })

describe('Success', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('asks a logged-out visitor to log in', () => {
    renderSuccess('/success?session_id=cs_1', [madePro])
    expect(
      screen.getByText('You need to be logged in to see this page.')
    ).toBeInTheDocument()
  })

  it('shows a payment error without a checkout session', () => {
    logIn(false)
    renderSuccess('/success', [madePro])
    expect(screen.getByText('Payment error')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /try again/i })).toHaveAttribute(
      'href',
      '/upgrade'
    )
  })

  it('thanks the buyer, makes them pro, then returns to Upgrade', async () => {
    jest.useFakeTimers()
    logIn(false)
    renderSuccess('/success?session_id=cs_1', [madePro])
    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText(/your purchase reference is/i)).toBeInTheDocument()
    await jest.advanceTimersByTimeAsync(3000)
    expect(screen.getByTestId('location')).toHaveTextContent('/upgrade')
    expect(screen.getByText('Upgrade page')).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('logs a failed upgrade and stays put', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    logIn(false)
    renderSuccess('/success?session_id=cs_1', [failed])
    await waitFor(() => {
      expect(error).toHaveBeenCalled()
    })
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/success?session_id=cs_1'
    )
    error.mockRestore()
  })
})
