import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Signup } from '../Signup'

const mockSignup: {
  loggedIn: boolean
  handleFormSubmit: jest.Mock
  onFirstNameChange: jest.Mock
  onLastNameChange: jest.Mock
  onEmailChange: jest.Mock
  checkEmailLoading: boolean
  checkEmailError: Error | null
  onPasswordChange: jest.Mock
  addUserError: Error | null
} = {
  loggedIn: true,
  handleFormSubmit: jest.fn(),
  onFirstNameChange: jest.fn(),
  onLastNameChange: jest.fn(),
  onEmailChange: jest.fn(),
  checkEmailLoading: false,
  checkEmailError: null,
  onPasswordChange: jest.fn(),
  addUserError: null
}

jest.mock('../useSignup', () => ({
  useSignup: () => mockSignup
}))

describe('Signup states', () => {
  beforeEach(() => {
    mockSignup.loggedIn = true
    mockSignup.checkEmailLoading = false
    mockSignup.checkEmailError = null
    mockSignup.addUserError = null
  })

  it('redirects when logged out', () => {
    mockSignup.loggedIn = false
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
    expect(screen.getByText('home')).toBeInTheDocument()
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
    expect(screen.getByText(/check email error/i)).toBeInTheDocument()

    mockSignup.checkEmailError = null
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
    expect(
      screen.getByText(/user with this email already exists/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/couldn't sign you up/i)).toBeInTheDocument()
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Ada' } })
    fireEvent.change(inputs[1], { target: { value: 'Lovelace' } })
    fireEvent.change(inputs[2], { target: { value: 'a@b.c' } })
    fireEvent.change(inputs[3], { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(mockSignup.handleFormSubmit).toHaveBeenCalled()
  })
})
