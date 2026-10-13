import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthButton } from '../AuthButton'

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ handleLogout: jest.fn() })
}))

describe('AuthButton', () => {
  it('shows login link when logged out', () => {
    render(
      <MemoryRouter>
        <AuthButton loggedIn={false} />
      </MemoryRouter>
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/login')
  })

  it('shows logout button when logged in', () => {
    render(
      <MemoryRouter>
        <AuthButton loggedIn={true} />
      </MemoryRouter>
    )
    expect(screen.getByRole('button')).toHaveTextContent(/log out/i)
  })
})
