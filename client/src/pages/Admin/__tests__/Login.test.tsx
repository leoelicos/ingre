import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/providers'
import { Login } from '../Login'

describe('Login', () => {
  it('renders the login form and titles the page', () => {
    localStorage.clear()
    renderWithProviders(<Login />, { mocks: [], path: '/login', routes: {} })
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument()
    expect(document.title).toMatch(/log in/i)
  })
})
