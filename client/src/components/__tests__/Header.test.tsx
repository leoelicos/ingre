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
  it('shows only the logo, the search, the War room button and the account icon (#164, #207)', () => {
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
    const warRoom = header.getByRole('link', { name: 'War room' })
    expect(warRoom).toHaveAttribute('href', '/war-room')
    expect(header.getAllByRole('link')).toEqual([logo, warRoom])
    expect(header.getAllByRole('searchbox')).toHaveLength(1)
    expect(header.getAllByRole('button')).toEqual([
      header.getByRole('button', { name: 'Account' })
    ])
    expect(header.queryByRole('navigation')).toBeNull()
    for (const name of ['Recipes', 'Saved', 'Shopping list', 'Log in'])
      expect(header.queryByText(name)).toBeNull()
  })

  it('sticks to the top below the drawer width, so the search stays high (#228)', () => {
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
    expect(screen.getByRole('banner')).toHaveClass(
      'sticky',
      'top-0',
      'min-[1328px]:static'
    )
  })
})
