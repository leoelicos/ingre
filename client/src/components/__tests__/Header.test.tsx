import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../utils/auth/AuthContext'
import { addFontAwesome } from '../../utils/addFontAwesome'
import { Header, LOGO_TEXT } from '../Header'

addFontAwesome()

describe('Header (#164, #192)', () => {
  it('shows only the logo, the War room button and the account icon: search moved to the discovery sheet (#192, #207)', () => {
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
    /* the egg alone, below sm, is still a 44px tap target (#296) */
    expect(logo).toHaveClass('min-h-[44px]', 'min-w-[44px]')
    const warRoom = header.getByRole('link', { name: 'War room' })
    expect(warRoom).toHaveAttribute('href', '/war-room')
    expect(header.getAllByRole('link')).toEqual([logo, warRoom])
    expect(header.queryByRole('searchbox')).toBeNull()
    expect(header.queryByRole('search')).toBeNull()
    expect(header.getAllByRole('button')).toEqual([
      header.getByRole('button', { name: 'Account' })
    ])
    expect(header.queryByRole('navigation')).toBeNull()
    for (const name of ['Recipes', 'Saved', 'Shopping list', 'Log in'])
      expect(header.queryByText(name)).toBeNull()
  })

  it('sticks to the top (#228)', () => {
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter>
          <AuthProvider>
            <Header />
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )
    expect(screen.getByRole('banner')).toHaveClass('sticky', 'top-0')
  })

  it('reaches up behind the Android status bar and clears it with the top inset (#296)', () => {
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter>
          <AuthProvider>
            <Header />
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )
    expect(screen.getByRole('banner')).toHaveClass(
      '-mt-[var(--safe-top)]',
      'pt-[var(--safe-top)]',
      'bg-bg'
    )
  })
})
