import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Success } from '../Success'

jest.mock('../useSuccess', () => ({
  useSuccess: () => ({
    loggedIn: true,
    Token: () => null,
    searchParams: { get: () => 'session123' }
  })
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: true }, jest.fn()]
}))

jest.mock('../../../components/NotLoggedIn', () => () => (
  <div>Not logged in</div>
))

describe('Success', () => {
  it('renders success message', () => {
    render(
      <MemoryRouter>
        <Success />
      </MemoryRouter>
    )
    expect(screen.getByText(/success/i)).toBeInTheDocument()
  })
})
