import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import type { MockedResponse } from '@apollo/client/testing'
import type { FC, ReactNode } from 'react'
import { useEffect } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { GET_SAVED_RECIPES } from '../../../lib/apollo/graphQL/queries'
import { jwt, serverRecipe } from '../../../test/fixtures'
import { AuthProvider, useAuthContext } from '../../../utils/auth/AuthContext'
import { StoreProvider } from '../../../utils/state/GlobalState'
import TapOff from '../../TapOff/TapOff'
import { ShoppingListPage } from '../ShoppingListPage'

const LogIn: FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, dispatch] = useAuthContext()
  useEffect(() => dispatch({ type: 'LOGIN', data: jwt() }), [dispatch])
  return auth.loggedIn ? <>{children}</> : null
}

const saved = (libraryIds: string[]): MockedResponse => ({
  request: { query: GET_SAVED_RECIPES },
  result: {
    data: {
      getSavedRecipes: libraryIds.map((libraryId) =>
        serverRecipe({ _id: libraryId, libraryId })
      )
    }
  }
})

const renderPage = (
  page: JSX.Element,
  mocks: MockedResponse[],
  loggedIn = true
) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <AuthProvider>
          <StoreProvider>
            {loggedIn ? <LogIn>{page}</LogIn> : page}
          </StoreProvider>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

describe('Shopping list page', () => {
  beforeEach(() => localStorage.clear())

  it('asks logged-out users to log in', () => {
    renderPage(<ShoppingListPage />, [], false)
    expect(screen.getByText(/need to be logged in/)).toBeInTheDocument()
    expect(document.title).toMatch(/Shopping list/)
  })

  it('loads saved recipes then shows the list', async () => {
    renderPage(<ShoppingListPage />, [saved(['dahl'])])
    expect(screen.getByText(/Loading your saved recipes/)).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Check your kitchen' })
    ).toBeInTheDocument()
  })

  it('reports a load error', async () => {
    renderPage(<ShoppingListPage />, [
      { request: { query: GET_SAVED_RECIPES }, error: new Error('down') }
    ])
    expect(await screen.findByText(/Couldn't load/)).toBeInTheDocument()
  })
})

describe('Tap Off', () => {
  beforeEach(() => localStorage.clear())

  it('lists to-buy items by shop section and counts what is left', async () => {
    renderPage(<TapOff />, [saved(['dahl'])])
    const left = await screen.findByText(/left to find$/)
    const n = Number(left.textContent?.split(' ')[0])
    expect(
      screen.queryByRole('region', { name: 'Fridge' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Pantry' })).toBeInTheDocument()
    screen.getAllByRole('checkbox').forEach((box) => box.click())
    expect(await screen.findByText('All done!')).toBeInTheDocument()
    expect(n).toBeGreaterThan(0)
  })

  it('points back to the list when nothing is saved', async () => {
    renderPage(<TapOff />, [saved([])])
    expect(
      await screen.findByText(/Nothing to tap off yet/)
    ).toBeInTheDocument()
  })
})
