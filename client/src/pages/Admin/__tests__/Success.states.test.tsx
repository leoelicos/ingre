import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Success } from '../Success'

const mockSuccess: {
  loggedIn: boolean
  Token: () => null
  searchParams: { get: (key: string) => string | null }
} = {
  loggedIn: true,
  Token: () => null,
  searchParams: { get: () => 'session' }
}

jest.mock('../useSuccess', () => ({
  useSuccess: () => mockSuccess
}))

jest.mock('../../../components/NotLoggedIn', () => () => (
  <div>Not logged in</div>
))

describe('Success states', () => {
  it('shows a logged-out message and a payment error', () => {
    mockSuccess.loggedIn = false
    const { rerender } = render(
      <MemoryRouter>
        <Success />
      </MemoryRouter>
    )
    expect(screen.getByText(/not logged in/i)).toBeInTheDocument()

    mockSuccess.loggedIn = true
    mockSuccess.searchParams = { get: () => null }
    rerender(
      <MemoryRouter>
        <Success />
      </MemoryRouter>
    )
    expect(screen.getByText(/payment error/i)).toBeInTheDocument()
  })
})
