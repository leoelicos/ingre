import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../utils/auth/AuthContext'
import Search from '../Search/Search'
import { Header } from '../../components/Header'
import RecipePage from '../Recipe/RecipePage'
import { Login } from '../Admin/Login'
import { Signup } from '../Admin/Signup'
import TapOff from '../TapOff/TapOff'
import { ShoppingFlow } from '../ShoppingList/ShoppingFlow'

expect.extend(toHaveNoViolations)

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

  it('Search has no axe violations', async () => {
    const { container } = renderScreen(<Search />, '/search')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Pick with the Saved filter on has no axe violations', async () => {
    const { container } = renderScreen(<ShoppingFlow />, '/?saved=1')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Recipe page has no axe violations', async () => {
    const { container } = renderScreen(<RecipePage />, '/recipe/dahl')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Login has no axe violations', async () => {
    const { container } = renderScreen(<Login />, '/login')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Signup has no axe violations', async () => {
    const { container } = renderScreen(<Signup />, '/signup')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('TapOff has no axe violations', async () => {
    const { container } = renderScreen(<TapOff />, '/tapoff')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('ShoppingFlow (Pick) has no axe violations', async () => {
    const { container } = renderScreen(<ShoppingFlow />, '/')
    expect(await axe(container)).toHaveNoViolations()
  })
})
