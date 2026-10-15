import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { LOGIN } from '../../../lib/apollo/graphQL/mutations'
import { Login } from '../Login'

const VALID_TOKEN =
  'eyJhbGciOiJub25lIn0.eyJkYXRhIjp7ImZpcnN0TmFtZSI6IkFkYSIsImVtYWlsIjoiYWRhQGIuYyIsIl9pZCI6IjEiLCJwcm8iOmZhbHNlfSwiZXhwIjo5OTk5OTk5OTk5fQ.'

const loginMock: MockedResponse = {
  request: {
    query: LOGIN,
    variables: { email: 'a@b.c', password: 'secret' }
  },
  result: { data: { login: { token: VALID_TOKEN } } }
}

const renderLogin = (mocks: MockedResponse[] = []) =>
  render(
    <MockedProvider mocks={mocks}>
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    </MockedProvider>
  )

describe('Login form', () => {
  it('toggles the password and submits credentials', async () => {
    renderLogin([loginMock])
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
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Log in' })).not.toBeNull()
    })
  })

  it('shows an inline error for an empty submit', () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      /please enter an email address/i
    )
  })
})
