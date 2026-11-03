import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../utils/auth/AuthContext'
import { ExploreProvider } from '../../utils/explore/ExploreContext'
import { addFontAwesome } from '../../utils/addFontAwesome'
import { Header, LOGO_TEXT } from '../Header'

addFontAwesome()

describe('Header (#164, #192)', () => {
  const header = () => within(screen.getByRole('banner'))

  it('on the workspace shows the logo and account, and not search', () => {
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter>
          <AuthProvider>
            <ExploreProvider>
              <Header />
            </ExploreProvider>
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )
    const bar = header()
    const logo = bar.getByRole('link', { name: LOGO_TEXT })
    expect(logo).toHaveAttribute('href', '/')
    expect(logo).toHaveClass('focus-visible:focus-ring')
    expect(bar.getAllByRole('link')).toEqual([logo])
    expect(bar.queryByRole('searchbox')).toBeNull()
    expect(bar.getAllByRole('button')).toEqual([
      bar.getByRole('button', { name: 'Account' })
    ])
    expect(bar.queryByRole('navigation')).toBeNull()
    for (const name of ['Recipes', 'Saved', 'Shopping list', 'Log in'])
      expect(bar.queryByText(name)).toBeNull()
  })

  it('on other pages keeps the search bar', () => {
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <ExploreProvider>
              <Header />
            </ExploreProvider>
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )
    expect(header().getAllByRole('searchbox')).toHaveLength(1)
  })
})
