import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Signup } from '../Signup'

const mockSignup: {
  loggedIn: boolean
  fields: {
    firstName: string
    lastName: string
    email: string
    password: string
  }
  handleFormSubmit: jest.Mock
  onFirstNameChange: jest.Mock
  onLastNameChange: jest.Mock
  onEmailChange: jest.Mock
  onPasswordChange: jest.Mock
  checkEmailLoading: boolean
  checkEmailError: Error | null
  emailExists: boolean
  addUserError: Error | null
  addUserLoading: boolean
} = {
  loggedIn: false,
  fields: {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  },
  handleFormSubmit: jest.fn(),
  onFirstNameChange: jest.fn(),
  onLastNameChange: jest.fn(),
  onEmailChange: jest.fn(),
  onPasswordChange: jest.fn(),
  checkEmailLoading: false,
  checkEmailError: null,
  emailExists: false,
  addUserError: null,
  addUserLoading: false
}

jest.mock('../useSignup', () => ({
  useSignup: () => mockSignup
}))

describe('Signup states', () => {
  beforeEach(() => {
    mockSignup.loggedIn = false
    mockSignup.checkEmailLoading = false
    mockSignup.checkEmailError = null
    mockSignup.emailExists = false
    mockSignup.addUserError = null
    mockSignup.addUserLoading = false
    mockSignup.handleFormSubmit.mockClear()
  })

  it('shows the form when logged out', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route
            path="/signup"
            element={<Signup />}
          />
          <Route
            path="/"
            element={<div>home</div>}
          />
        </Routes>
      </MemoryRouter>
    )
    expect(
      screen.getByRole('heading', { name: /sign up/i })
    ).toBeInTheDocument()
    expect(screen.queryByText('home')).not.toBeInTheDocument()
  })

  it('shows email and signup errors and submits the form', () => {
    mockSignup.checkEmailLoading = true
    const { rerender } = render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route
            path="/signup"
            element={<Signup />}
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/checking email/i)).toBeInTheDocument()

    mockSignup.checkEmailLoading = false
    mockSignup.checkEmailError = new Error('mail')
    rerender(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route
            path="/signup"
            element={<Signup />}
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/couldn't check that email/i)).toBeInTheDocument()

    mockSignup.checkEmailError = null
    mockSignup.emailExists = true
    rerender(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route
            path="/signup"
            element={<Signup />}
          />
        </Routes>
      </MemoryRouter>
    )
    expect(
      screen.getByText(/user with this email already exists/i)
    ).toBeInTheDocument()

    mockSignup.emailExists = false
    mockSignup.addUserError = new Error('add')
    rerender(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route
            path="/signup"
            element={<Signup />}
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/couldn't sign you up/i)).toBeInTheDocument()
  })
})
