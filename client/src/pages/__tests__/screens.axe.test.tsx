import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../utils/auth/AuthContext'
import { Header } from '../../components/Header'
import { Login } from '../Admin/Login'
import { Signup } from '../Admin/Signup'
import { ListPage } from '../List/ListPage'
import { fakeObserver, fire, resetObserver } from '../../test/observer'
import { PICKED_KEY } from '../../utils/storage/shoppingState'

expect.extend(toHaveNoViolations)

const searchBox = () =>
  screen.getByRole('searchbox', { name: 'Search ingredients and recipes' })

const openFab = () =>
  fireEvent.click(screen.getByRole('button', { name: /^Add a / }))

const renderScreen = (ui: React.ReactElement, path = '/') =>
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

describe('All screens accessibility (axe)', () => {
  it('Header has no axe violations', async () => {
    const { container } = renderScreen(<Header />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('The list with the Saved filter on (Explore open) has no axe violations', async () => {
    renderScreen(<ListPage />, '/?saved=1')
    expect(screen.getByRole('dialog', { name: 'Explore' })).toBeInTheDocument()
    expect(await axe(document.body)).toHaveNoViolations()
  })

  it('Explore browsing, with an open See recipe row, has no axe violations (#181, #192)', async () => {
    localStorage.clear()
    renderScreen(<ListPage />, '/')
    openFab()
    const container = document.body
    fireEvent.click(
      screen.getByRole('button', { name: 'See recipe: Red lentil dahl' })
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it.each(['chick', 'zzqx'])(
    'Explore searching %s (matches, then no matches) has no axe violations (#181)',
    async (query) => {
      localStorage.clear()
      renderScreen(<ListPage />, '/')
      openFab()
      fireEvent.change(searchBox(), { target: { value: query } })
      expect(await axe(document.body)).toHaveNoViolations()
    }
  )

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

  it('The Extra sheet, with its catalogue, has no axe violations (#192)', async () => {
    localStorage.clear()
    fakeObserver()
    renderScreen(<ListPage />, '/')
    fire('ingredients', { isIntersecting: true })
    fireEvent.click(screen.getByRole('button', { name: 'Add a pantry item' }))
    expect(screen.getByRole('dialog', { name: 'Extra' })).toBeInTheDocument()
    expect(await axe(document.body)).toHaveNoViolations()
    resetObserver()
  })

  it('The list with chips, an open chip panel and an open row with its add area has no axe violations', async () => {
    localStorage.setItem(
      PICKED_KEY,
      JSON.stringify(['dahl', 'vegetable-curry'])
    )
    const { container } = renderScreen(<ListPage />, '/')
    fireEvent.click(screen.getByRole('button', { name: 'Brown onion details' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Red lentil dahl details' })
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add an ingredient to Red lentil dahl'
      })
    )
    expect(await axe(container)).toHaveNoViolations()
    localStorage.clear()
  })
})
