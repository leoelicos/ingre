import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../../../utils/auth/AuthContext'
import { Header } from '../Header'

const Logo = () => <span>Logo</span>
const LogoCollapsed = () => <span>Menu</span>

describe('Header mobile toggle', () => {
  it('toggles the menu open and closed and closes on link click', () => {
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
    const toggle = screen.getByRole('button', { name: /open menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    fireEvent.click(screen.getByRole('link', { name: 'Saved' }))
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })
})
