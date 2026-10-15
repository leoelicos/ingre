import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../../../utils/auth/AuthContext'
import { Header } from '../Header'

const Logo = () => <span>Logo</span>
const LogoCollapsed = () => <span>Menu</span>

const renderHeader = () =>
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter>
        <AuthProvider>
          <Header
            Logo={Logo}
            LogoCollapsed={LogoCollapsed}
            logoText="ingré"
            links={[{ to: '/saved', label: 'Saved' }]}
            loggedIn={false}
          />
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

describe('Header mobile toggle', () => {
  it('toggles the menu open and closed and closes on link click', () => {
    renderHeader()
    const toggle = screen.getByRole('button', { name: /menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByRole('link', { name: 'Saved' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the menu on Escape and returns focus to the button', () => {
    renderHeader()
    const toggle = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('ignores non-Escape keys while open', () => {
    renderHeader()
    const toggle = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(toggle)
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes the menu when the auth button area is clicked', () => {
    renderHeader()
    const toggle = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const authLink = screen.getByRole('link', { name: /log\s*in/i })
    fireEvent.click(authLink)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
