import '@testing-library/jest-dom'
import { useEffect, useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { AuthProvider, useAuthContext } from '../../../utils/auth/AuthContext'
import { returnPath } from '../../../utils/auth/returnPath'
import { Signup } from '../Signup'
import { CHECK_EMAIL_ALREADY_EXISTS } from '../../../lib/apollo/graphQL/queries'
import { ADD_USER } from '../../../lib/apollo/graphQL/mutations'

const VALID_TOKEN =
  'eyJhbGciOiJub25lIn0.eyJkYXRhIjp7ImZpcnN0TmFtZSI6IkFkYSIsImVtYWlsIjoiYWRhQGIuYyIsIl9pZCI6IjEiLCJwcm8iOmZhbHNlfSwiZXhwIjo5OTk5OTk5OTk5fQ.'

const emailExistsMock: MockedResponse = {
  request: {
    query: CHECK_EMAIL_ALREADY_EXISTS,
    variables: { email: 'exists@example.com' }
  },
  result: { data: { checkEmailAlreadyExists: true } }
}

const emailErrorMock: MockedResponse = {
  request: {
    query: CHECK_EMAIL_ALREADY_EXISTS,
    variables: { email: 'bad@example.com' }
  },
  error: new Error('network down')
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

const addUserErrorMock: MockedResponse = {
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
  error: new Error('E11000 duplicate key')
}

const LoginProbe = () => {
  const location = useLocation()
  return <div>login page from {returnPath(location.state)}</div>
}

const renderWithProviders = (
  mocks: MockedResponse[] = [],
  initialEntries: Array<
    string | { pathname: string; state?: { from: string } }
  > = ['/signup'],
  signup: React.ReactNode = <Signup />
) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <Routes>
            <Route
              path="/signup"
              element={signup}
            />
            <Route
              path="/"
              element={<div>home with list</div>}
            />
            <Route
              path="/saved"
              element={<div>saved list still here</div>}
            />
            <Route
              path="/login"
              element={<LoginProbe />}
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

const fillAccount = () => {
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
}

const AlreadyLoggedIn = () => {
  const [, dispatch] = useAuthContext()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    dispatch({ type: 'LOGIN', data: VALID_TOKEN })
    setReady(true)
  }, [dispatch])
  if (!ready) return null
  return <Signup />
}

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

  it('returns an already logged-in user to the list', async () => {
    renderWithProviders(
      [],
      [{ pathname: '/signup', state: { from: '/' } }],
      <AlreadyLoggedIn />
    )
    await waitFor(() => {
      expect(screen.getByText('home with list')).toBeInTheDocument()
    })
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

  it('shows one alert and disables submit when the email already exists', async () => {
    renderWithProviders(
      [emailExistsMock],
      [{ pathname: '/signup', state: { from: '/' } }]
    )
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
    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled()
    fireEvent.click(screen.getByRole('link', { name: /log in\?/i }))
    expect(screen.getByText('login page from /')).toBeInTheDocument()
  })

  it('shows one alert when the email cannot be checked', async () => {
    renderWithProviders([emailErrorMock])
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'Ada' }
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'bad@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' }
    })
    fireEvent.submit(
      screen.getByRole('button', { name: /sign up/i }).closest('form')!
    )
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /couldn't check that email/i
      )
    })
    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.queryByText(/network down/i)).not.toBeInTheDocument()
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

  it('shows one friendly message when sign-up fails and keeps the form', async () => {
    renderWithProviders([emailFreeMock, addUserErrorMock])
    fillAccount()
    fireEvent.submit(
      screen.getByRole('button', { name: /sign up/i }).closest('form')!
    )
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /couldn't sign you up/i
      )
    })
    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.queryByText(/duplicate key/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Ada')
  })

  it('navigates to the starting page after successful sign-up and keeps the list', async () => {
    renderWithProviders(
      [emailFreeMock, addUserMock],
      [{ pathname: '/signup', state: { from: '/saved' } }]
    )
    fillAccount()
    fireEvent.submit(
      screen.getByRole('button', { name: /sign up/i }).closest('form')!
    )

    await waitFor(() => {
      expect(screen.getByText('saved list still here')).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('heading', { name: /sign up/i })
    ).not.toBeInTheDocument()
  })

  it('passes the starting page through the log in link', () => {
    renderWithProviders([], [{ pathname: '/signup', state: { from: '/' } }])
    fireEvent.click(screen.getByRole('link', { name: /^log in$/i }))
    expect(screen.getByText('login page from /')).toBeInTheDocument()
  })
})
