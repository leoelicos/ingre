import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from '../Header/Header'

jest.mock('../../../components/AuthButton', () => ({
  AuthButton: ({ loggedIn }: { loggedIn: boolean }) => (
    <div>{loggedIn ? 'Log out' : 'Log in'}</div>
  )
}))

const Logo = () => <span>logo</span>
const LogoCollapsed = () => <span>collapsed</span>

describe('library Header', () => {
  it('renders links and the logged-out auth button', () => {
    render(
      <MemoryRouter>
        <Header
          Logo={Logo}
          LogoCollapsed={LogoCollapsed}
          logoText="ingre"
          loggedIn={false}
          links={[
            { to: '/search', label: 'Search' },
            { to: '/saved', label: 'Saved' }
          ]}
        />
      </MemoryRouter>
    )
    expect(screen.getByText('ingre')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Log in')).toBeInTheDocument()
  })

  it('renders the logged-in auth button', () => {
    render(
      <MemoryRouter>
        <Header
          Logo={Logo}
          LogoCollapsed={LogoCollapsed}
          logoText="ingre"
          loggedIn={true}
          links={[]}
        />
      </MemoryRouter>
    )
    expect(screen.getByText('Log out')).toBeInTheDocument()
  })
})
