import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { Signup } from '../Signup'

const renderSignup = (initialEntries = ['/signup']) =>
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <Signup />
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

describe('Signup', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders signup form for logged-out users', () => {
    renderSignup()
    expect(
      screen.getByRole('heading', { name: /sign up/i })
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
  })
})
