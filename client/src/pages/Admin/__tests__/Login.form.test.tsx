import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Login } from '../Login'

const mockNavigate = jest.fn()
const mockLogin = jest.fn()
const mockAuth = { loggedIn: false }
const mockUseAuth: {
  login: typeof mockLogin
  loginError: Error | null
  loginLoading: boolean
} = {
  login: mockLogin,
  loginError: null,
  loginLoading: false
}

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [mockAuth, jest.fn()]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

describe('Login form', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockLogin.mockClear()
    mockAuth.loggedIn = false
    mockUseAuth.loginError = null
    mockUseAuth.loginLoading = false
  })

  it('submits credentials and toggles the password', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'a@b.c' }
    })
    const password = document.getElementById('password')
    if (!password) throw new Error('password field missing')
    fireEvent.change(password, { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Show' }))
    expect(password).toHaveAttribute('type', 'text')
    fireEvent.click(screen.getByRole('button', { name: 'Hide' }))
    expect(password).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'a@b.c',
      password: 'secret'
    })
  })

  it('shows loading and error states', () => {
    mockUseAuth.loginLoading = true
    const { rerender } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(screen.getByText('Loading')).toBeInTheDocument()
    mockUseAuth.loginLoading = false
    mockUseAuth.loginError = new Error('no')
    rerender(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(screen.getByText(/couldn't log you in/i)).toBeInTheDocument()
  })

  it('leaves when already logged in', () => {
    mockAuth.loggedIn = true
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
