import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../utils/auth/AuthContext'
import { addFontAwesome } from '../../utils/addFontAwesome'
import { Header, LOGO_TEXT } from '../Header'

addFontAwesome()

describe('Header (#164, #192)', () => {
  it('shows only the logo and the account icon: search moved to the discovery sheet', () => {
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter>
          <AuthProvider>
            <Header />
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )
    const header = within(screen.getByRole('banner'))
    const logo = header.getByRole('link', { name: LOGO_TEXT })
    expect(logo).toHaveAttribute('href', '/')
    expect(logo).toHaveClass('focus-visible:focus-ring')
    expect(header.getAllByRole('link')).toEqual([logo])
    expect(header.queryByRole('searchbox')).toBeNull()
    expect(header.queryByRole('search')).toBeNull()
    expect(header.getAllByRole('button')).toEqual([
      header.getByRole('button', { name: 'Account' })
    ])
    expect(header.queryByRole('navigation')).toBeNull()
    for (const name of ['Recipes', 'Saved', 'Shopping list', 'Log in'])
      expect(header.queryByText(name)).toBeNull()
  })
})
