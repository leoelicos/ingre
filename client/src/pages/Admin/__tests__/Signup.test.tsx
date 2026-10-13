import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Signup } from '../Signup'

jest.mock('../useSignup', () => ({
  useSignup: () => ({
    loggedIn: true,
    handleFormSubmit: jest.fn(),
    onFirstNameChange: jest.fn(),
    onLastNameChange: jest.fn(),
    onEmailChange: jest.fn(),
    checkEmailLoading: false,
    checkEmailError: null,
    onPasswordChange: jest.fn(),
    addUserError: null
  })
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

describe('Signup', () => {
  it('renders signup form', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )
    expect(screen.getByText(/sign up/i)).toBeInTheDocument()
  })
})
