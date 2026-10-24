import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../utils/auth/AuthContext'
import { ExploreProvider } from '../../utils/explore/ExploreContext'
import { addFontAwesome } from '../../utils/addFontAwesome'
import { Header, LOGO_TEXT } from '../Header'

addFontAwesome()

describe('Header (#164)', () => {
  it('shows only the logo, the search and the account icon', () => {
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
    const header = within(screen.getByRole('banner'))
    const logo = header.getByRole('link', { name: LOGO_TEXT })
    expect(logo).toHaveAttribute('href', '/')
    expect(logo).toHaveClass('focus-visible:focus-ring')
    expect(header.getAllByRole('link')).toEqual([logo])
    expect(header.getAllByRole('searchbox')).toHaveLength(1)
    expect(header.getAllByRole('button')).toEqual([
      header.getByRole('button', { name: 'Account' })
    ])
    expect(header.queryByRole('navigation')).toBeNull()
    for (const name of ['Recipes', 'Saved', 'Shopping list', 'Log in'])
      expect(header.queryByText(name)).toBeNull()
  })
})
