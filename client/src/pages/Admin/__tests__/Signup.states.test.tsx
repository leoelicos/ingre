import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { Signup } from '../Signup'
import { CHECK_EMAIL_ALREADY_EXISTS } from '../../../lib/apollo/graphQL/queries'
import { ADD_USER } from '../../../lib/apollo/graphQL/mutations'

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

const VALID_TOKEN =
  'eyJhbGciOiJub25lIn0.eyJkYXRhIjp7ImZpcnN0TmFtZSI6IkFkYSIsImVtYWlsIjoiYWRhQGIuYyIsIl9pZCI6IjEiLCJwcm8iOmZhbHNlfSwiZXhwIjo5OTk5OTk5OTk5fQ.'

const emailExistsMock: MockedResponse = {
  request: {
    query: CHECK_EMAIL_ALREADY_EXISTS,
    variables: { email: 'exists@example.com' }
  },
  result: { data: { checkEmailAlreadyExists: true } }
}

const emailFreeMock: MockedResponse = {
  request: {
    query: CHECK_EMAIL_ALREADY_EXISTS,
    variables: { email: 'new@example.com' }
  },
  result: { data: { checkEmailAlreadyExists: false } }
}

const addUserMock: MockedResponse = {
  request: {
    query: ADD_USER,
    variables: {
      input: {
        email: 'new@example.com',
        password: 'secret123',
        firstName: 'Ada',
        lastName: 'Lovelace'
      }
    }
  },
  result: {
    data: {
      addUser: {
        token: VALID_TOKEN,
        user: { _id: '1', firstName: 'Ada' }
      }
    }
  }
}

const renderWithProviders = (
  mocks: MockedResponse[] = [],
  initialEntries: Array<
    string | { pathname: string; state?: { from: string } }
  > = ['/signup']
) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <Routes>
            <Route
              path="/signup"
              element={<Signup />}
            />
            <Route
              path="/"
              element={<div>home with list</div>}
            />
            <Route
              path="/login"
              element={<div>login page</div>}
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

describe('Signup states', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the form when logged out', () => {
    renderWithProviders()
    expect(
      screen.getByRole('heading', { name: /sign up/i })
    ).toBeInTheDocument()
    expect(screen.queryByText('home with list')).not.toBeInTheDocument()
  })

  it('toggles password visibility', () => {
    renderWithProviders()
    const password = screen.getByLabelText(/password/i)
    const toggle = screen.getByRole('button', { name: /show/i })
    expect(password).toHaveAttribute('type', 'password')
    fireEvent.click(toggle)
    expect(password).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /hide/i })).toBeInTheDocument()
  })

  it('disables submit when the email already exists', async () => {
    renderWithProviders([emailExistsMock])
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'Ada' }
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'exists@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' }
    })
    fireEvent.submit(
      screen.getByRole('button', { name: /sign up/i }).closest('form')!
    )

    await waitFor(() => {
      expect(
        screen.getByText(/user with this email already exists/i)
      ).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled()
  })

  it('shows validation messages for empty required fields', async () => {
    renderWithProviders()
    fireEvent.submit(
      screen.getByRole('button', { name: /sign up/i }).closest('form')!
    )
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /please enter your first name/i
      )
    })
  })

  it('navigates to the starting page after successful sign-up and keeps the list', async () => {
    renderWithProviders(
      [emailFreeMock, addUserMock],
      [{ pathname: '/signup', state: { from: '/' } }]
    )
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'Ada' }
    })
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Lovelace' }
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' }
    })
    fireEvent.submit(
      screen.getByRole('button', { name: /sign up/i }).closest('form')!
    )

    await waitFor(() => {
      expect(screen.getByText('home with list')).toBeInTheDocument()
    })
  })
})
