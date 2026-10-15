import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../utils/auth/AuthContext'
import Home from '../Home/Home'
import Search from '../Search/Search'
import { Saved } from '../Saved/Saved'
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
  it('Home has no axe violations', async () => {
    const { container } = renderScreen(<Home />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Search has no axe violations', async () => {
    const { container } = renderScreen(<Search />, '/search')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Saved has no axe violations', async () => {
    const { container } = renderScreen(<Saved />, '/saved')
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
    const { container } = renderScreen(<ShoppingFlow />, '/ingredients')
    expect(await axe(container)).toHaveNoViolations()
  })
})
