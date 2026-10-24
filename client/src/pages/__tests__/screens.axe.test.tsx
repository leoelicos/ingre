import '@testing-library/jest-dom'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../utils/auth/AuthContext'
import { ExploreProvider } from '../../utils/explore/ExploreContext'
import Search from '../Search/Search'
import { Header } from '../../components/Header'
import { Login } from '../Admin/Login'
import { Signup } from '../Admin/Signup'
import { ListPage } from '../List/ListPage'
import { SearchBox } from '../../components/SearchBox/SearchBox'
import { PICKED_KEY } from '../../utils/storage/shoppingState'

expect.extend(toHaveNoViolations)

const searchBox = () =>
  screen.getByRole('searchbox', { name: 'Search ingredients and recipes' })

const renderScreen = (ui: React.ReactElement, path = '/') =>
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <ExploreProvider>
            <Routes>
              <Route
                path="*"
                element={ui}
              />
            </Routes>
          </ExploreProvider>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

describe('All screens accessibility (axe)', () => {
  it('Header has no axe violations', async () => {
    const { container } = renderScreen(<Header />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Search has no axe violations', async () => {
    const { container } = renderScreen(<Search />, '/search')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('The list with the Saved filter on has no axe violations', async () => {
    const { container } = renderScreen(<ListPage />, '/?saved=1')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Explore with matches, an open See recipe row and no matches has no axe violations (#181)', async () => {
    localStorage.clear()
    const { container } = renderScreen(<ListPage />, '/')
    fireEvent.click(
      screen.getByRole('button', { name: 'See recipe: Red lentil dahl' })
    )
    expect(await axe(container)).toHaveNoViolations()
    cleanup()
    const matches = renderScreen(
      <>
        <SearchBox />
        <ListPage />
      </>,
      '/'
    )
    fireEvent.change(searchBox(), { target: { value: 'chick' } })
    expect(await axe(matches.container)).toHaveNoViolations()
    fireEvent.change(searchBox(), { target: { value: 'zzqx' } })
    expect(await axe(matches.container)).toHaveNoViolations()
  })

  it('Login has no axe violations', async () => {
    const { container } = renderScreen(<Login />, '/login')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Signup has no axe violations', async () => {
    const { container } = renderScreen(<Signup />, '/signup')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('The list, empty, has no axe violations', async () => {
    localStorage.clear()
    const { container } = renderScreen(<ListPage />, '/')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('The list with chips, an open chip panel, the plus area and an open row has no axe violations', async () => {
    localStorage.setItem(
      PICKED_KEY,
      JSON.stringify(['dahl', 'vegetable-curry'])
    )
    const { container } = renderScreen(<ListPage />, '/')
    fireEvent.click(screen.getByRole('button', { name: 'Brown onion details' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add an ingredient' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Red lentil dahl details' })
    )
    expect(await axe(container)).toHaveNoViolations()
    localStorage.clear()
  })
})
