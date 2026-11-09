import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/providers'
import { Login } from '../Login'

describe('Login', () => {
  it('renders the login form and titles the page', async () => {
    localStorage.clear()
    renderWithProviders(<Login />, { mocks: [], path: '/login', routes: {} })
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument()
    expect(document.title).toMatch(/log in/i)
    /* a 44px tap target on the phone too (#296) */
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveClass(
      'inline-flex',
      'min-h-[44px]',
      'items-center'
    )
    const google = screen.getByRole('button', { name: /continue with google/i })
    const biometric = screen.getByRole('button', { name: /use biometrics/i })
    expect(google).toBeInTheDocument()
    expect(biometric).toBeInTheDocument()
    await userEvent.click(google)
    await userEvent.click(biometric)
  })
})
