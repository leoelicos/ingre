import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Signup } from '../Signup'

jest.mock('../useSignup', () => ({
  useSignup: () => ({
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
  })
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

describe('Signup', () => {
  it('renders signup form for logged-out users', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )
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
