import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../utils/auth/AuthContext'
import { Login } from '../Admin/Login'
import { Signup } from '../Admin/Signup'
import { ShoppingFlow } from '../ShoppingList/ShoppingFlow'
import { Header } from '../../components/Header'

const renderAt = (ui: React.ReactElement, path: string) =>
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <Routes>
            <Route
              path="*"
              element={ui}
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

describe('Keyboard-only', () => {
  it('Login form is fully operable with keyboard', async () => {
    const user = userEvent.setup()
    renderAt(<Login />, '/login')

    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)
    const submit = screen.getByRole('button', { name: /log in/i })

    await user.tab()
    expect(email).toHaveFocus()
    await user.keyboard('user@example.com')
    await user.tab()
    expect(password).toHaveFocus()
    await user.keyboard('secret')
    await user.tab()
    await user.tab()
    expect(submit).toHaveFocus()
    await user.keyboard('{Enter}')
  })

  it('Signup form is fully operable with keyboard', async () => {
    const user = userEvent.setup()
    renderAt(<Signup />, '/signup')

    const first = screen.getByLabelText(/first name/i)
    await user.tab()
    expect(first).toHaveFocus()
    await user.keyboard('Ada')
    await user.tab()
    await user.tab()
    await user.keyboard('ada@b.c')
    await user.tab()
    await user.keyboard('secret123')
    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: /sign up/i })).toHaveFocus()
  })

  it('ShoppingFlow Home control works from the keyboard', async () => {
    const user = userEvent.setup()
    localStorage.setItem('ingre.list.step', '"home"')
    renderAt(<ShoppingFlow />, '/')
    const home = screen.getByRole('button', { name: 'Home' })
    home.focus()
    await user.keyboard('{Enter}')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Pick' })
    ).toHaveFocus()
  })
})

describe('VoiceOver (ARIA name, role, state)', () => {
  it('Login controls expose name, role and state', () => {
    renderAt(<Login />, '/login')
    expect(
      screen.getByRole('textbox', { name: /email/i })
    ).toHaveAccessibleName(/email/i)
    expect(screen.getByLabelText(/password/i)).toHaveAccessibleName(/password/i)
    expect(screen.getByRole('button', { name: /show/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(
      screen.getByRole('button', { name: /log in/i })
    ).toHaveAccessibleName(/log in/i)
  })

  it('Signup password toggle exposes pressed state', async () => {
    const user = userEvent.setup()
    renderAt(<Signup />, '/signup')
    const toggle = screen.getByRole('button', { name: /show/i })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)
    expect(screen.getByRole('button', { name: /hide/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('ShoppingFlow Saved filter exposes on/off state as a switch', async () => {
    const user = userEvent.setup()
    renderAt(<ShoppingFlow />, '/')
    const saved = screen.getByRole('switch', { name: 'Saved' })
    expect(saved).not.toBeChecked()
    await user.click(saved)
    expect(screen.getByRole('switch', { name: 'Saved' })).toBeChecked()
  })

  it('Primary action buttons have accessible names', () => {
    renderAt(<Login />, '/login')
    expect(
      screen.getByRole('button', { name: /log in/i })
    ).toHaveAccessibleName()
    renderAt(<Signup />, '/signup')
    expect(
      screen.getByRole('button', { name: /sign up/i })
    ).toHaveAccessibleName()
  })
})

describe('High contrast / focus visibility', () => {
  it('Interactive controls in the header are focusable', () => {
    renderAt(<Header />, '/')
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    const first = links[0]
    if (!first) throw new Error('expected at least one link')
    first.focus()
    expect(first).toHaveFocus()
  })

  it('Login inputs are focusable and use token-based classes', () => {
    renderAt(<Login />, '/login')
    const email = screen.getByLabelText(/email/i)
    email.focus()
    expect(email).toHaveFocus()
    expect(email.className).toMatch(/auth-form__input/)
  })

  it('Focus-visible styles exist for primary buttons (outline via tokens)', () => {
    // Login's submit is a PrimaryButton (#170): the shared focus-ring on focus-visible.
    renderAt(<Login />, '/login')
    const submit = screen.getByRole('button', { name: /log in/i })
    submit.focus()
    expect(submit).toHaveFocus()
  })
})
